console.log("[peek] content.js loaded");

const style = document.createElement('style');
style.textContent = `
  mark.peek-highlight {
    background-color: yellow;
    padding: 0 2px;
    border-radius: 3px;
  }
`;
document.head.appendChild(style);


let currentHighlights = [];
let currentIndex = -1;

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clearHighlights() {
  for (const span of currentHighlights) {
    span.outerHTML = span.innerText;
  }
  currentHighlights = [];
  currentIndex = -1;
}

function highlightMatches(query) {
  clearHighlights();

  const regex = new RegExp(escapeRegExp(query), "gi");

  // Get a snapshot of all text nodes first
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentNode;
    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(parent.tagName)) continue;
    if (!node.nodeValue.trim()) continue;
    nodes.push(node);
  }

  for (const node of nodes) {
    const matches = [...node.nodeValue.matchAll(regex)];
    if (matches.length === 0) continue;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of matches) {
      const start = match.index;
      const end = start + match[0].length;

      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, start)));
      }

      const mark = document.createElement('mark');
      mark.className = 'peek-highlight';
      mark.textContent = match[0];
      frag.appendChild(mark);

      lastIndex = end;
    }

    if (lastIndex < node.nodeValue.length) {
      frag.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
    }

    node.parentNode.replaceChild(frag, node);
  }

  currentHighlights = Array.from(document.querySelectorAll('mark.peek-highlight'));

  if (currentHighlights.length > 0) {
    currentIndex = 0;
    scrollToCurrent();
  }

  console.log(`[peek] Found ${currentHighlights.length} matches for "${query}"`);
}

function scrollToCurrent() {
  if (currentHighlights[currentIndex]) {
    currentHighlights[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    highlightCurrent();
  }
}

function highlightCurrent() {
  currentHighlights.forEach((el, idx) => {
    el.style.backgroundColor = (idx === currentIndex) ? "orange" : "yellow";
  });
}

function goToNext() {
  if (currentHighlights.length === 0) return;
  currentIndex = (currentIndex + 1) % currentHighlights.length;
  scrollToCurrent();
}

function goToPrev() {
  if (currentHighlights.length === 0) return;
  currentIndex = (currentIndex - 1 + currentHighlights.length) % currentHighlights.length;
  scrollToCurrent();
}

window.addEventListener("load", () => {
  console.log("[peek] content.js ready after load");
  initPeekContent();
});

function initPeekContent() {
  const style = document.createElement('style');
  style.textContent = `
    mark.peek-highlight {
      background-color: yellow;
      padding: 0 2px;
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);

  // Then move your global vars + functions (highlightMatches, goToNext, etc.)
  // inside or below this function so they get defined only after page is ready

  // Keep this listener last
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightSearch") {
      highlightMatches(request.query.trim());
      sendResponse({ status: "highlighted", count: currentHighlights.length });
    } else if (request.action === "nextMatch") {
      goToNext();
    } else if (request.action === "prevMatch") {
      goToPrev();
    } else if (request.action === "clearHighlights") {
      clearHighlights();
    }
  });
}

