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
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentNode;

    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) continue;

    if (regex.test(node.nodeValue)) {
      const span = document.createElement("span");
      span.innerHTML = node.nodeValue.replace(regex, match => `<mark class="peek-highlight">${match}</mark>`);
      parent.replaceChild(span, node);
    }
  }

  currentHighlights = Array.from(document.querySelectorAll("mark.peek-highlight"));

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
