// content.js
console.log("[peek] content.js loaded");

const style = document.createElement("style");
style.textContent = `
  mark.peek-highlight {
    background-color: yellow;
    padding: 0 2px;
    border-radius: 3px;
  }
  mark.peek-semantic {
    background-color: #90EE90;
    padding: 0 2px;
    border-radius: 3px;
    border-left: 3px solid #32CD32;
  }`;
document.head.appendChild(style);

let currentHighlights = [];
let currentIndex = -1;
let searchMode = 'keyword'; // 'keyword' or 'semantic'

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clearHighlights() {
  for (const span of currentHighlights) {
    span.outerHTML = span.innerText;
  }
  currentHighlights = [];
  currentIndex = -1;
}

// Extract text content from the page for semantic search
function extractPageContent() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  const paragraphs = [];
  let currentParagraph = '';

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentNode;

    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME"].includes(parent.tagName)) {
      continue;
    }

    const text = node.nodeValue.trim();
    if (!text) continue;

    textNodes.push({ node, text });

    // Group text into paragraphs for semantic search
    if (parent.tagName === 'P' || parent.tagName === 'DIV' || parent.tagName === 'SPAN') {
      if (currentParagraph && text) {
        currentParagraph += ' ' + text;
      } else if (text) {
        currentParagraph = text;
      }

      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(parent.tagName)) {
        if (currentParagraph.length > 20) {
          paragraphs.push({
            text: currentParagraph,
            element: parent
          });
        }
        currentParagraph = '';
      }
    }
  }

  return { textNodes, paragraphs };
}

// ✅ Safe call to store embeddings on page load
async function sendContentToBackground() {
  try {
    const { paragraphs } = extractPageContent();
    await chrome.runtime.sendMessage({
      action: 'storeEmbeddings',
      content: paragraphs.map((p, idx) => ({ text: p.text, id: idx })),
    });
    console.log("[peek] Content sent to background for indexing.");
  } catch (err) {
    console.error("[peek] Failed to store embeddings:", err);
  }
}

// 👇 Safely trigger it ONCE when content.js loads
sendContentToBackground();

// Perform semantic search via Elasticsearch
async function performSemanticSearch(query) {
  const { paragraphs } = extractPageContent();
  
  try {
    // Send page content and query to background script for Elasticsearch processing
    await chrome.runtime.sendMessage({
      action: "semanticSearch",
      query,
      content: paragraphs.map((p, idx) => ({ text: p.text, id: idx })),
      url: window.location.href,
    });    
    
    if (response && response.success) {
      return response.matches;
    } else {
      console.error('[peek] Semantic search failed:', response?.error ?? 'Unknown error');
      return [];
    }    
  } catch (error) {
    console.error('[peek] Semantic search error:', error);
    return [];
  }
}

// Highlight semantic search results
function highlightSemanticMatches(matches, query) {
  clearHighlights();
  const { paragraphs } = extractPageContent();
  
  for (const match of matches) {
    const paragraph = paragraphs[match.id];
    if (!paragraph) continue;
    
    // Find and highlight the relevant sentences within the paragraph
    const sentences = paragraph.text.split(/[.!?]+/);
    console.log(`[peek] Match Score: ${match.score} | Text: ${match.text}`);
    highlightElement(paragraph.element, 'peek-semantic');

    // Highlight the entire paragraph or specific sentences
    highlightElement(paragraph.element, 'peek-semantic');
  }
  
  currentHighlights = Array.from(document.querySelectorAll('mark.peek-semantic'));
  
  if (currentHighlights.length > 0) {
    currentIndex = 0;
    scrollToCurrent();
  }
  
  console.log(`[peek] Found ${currentHighlights.length} semantic matches for "${query}"`);
}

// Helper function to highlight an element
function highlightElement(element, className) {
  if (element.querySelector('mark.' + className)) return; // Already highlighted
  
  const mark = document.createElement('mark');
  mark.className = className;
  mark.innerHTML = element.innerHTML;
  element.innerHTML = '';
  element.appendChild(mark);
  
  currentHighlights.push(mark);
}

// Original keyword highlighting function
function highlightMatches(query) {
  clearHighlights();

  const regex = new RegExp(escapeRegExp(query), "gi");

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentNode;
    if (
      !parent ||
      ["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME"].includes(parent.tagName)
    )
      continue;
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
        frag.appendChild(
          document.createTextNode(node.nodeValue.slice(lastIndex, start))
        );
      }

      const mark = document.createElement("mark");
      mark.className = "peek-highlight";
      mark.textContent = match[0];
      frag.appendChild(mark);

      lastIndex = end;
    }

    if (lastIndex < node.nodeValue.length) {
      frag.appendChild(
        document.createTextNode(node.nodeValue.slice(lastIndex))
      );
    }

    node.parentNode.replaceChild(frag, node);
  }

  currentHighlights = Array.from(
    document.querySelectorAll("mark.peek-highlight")
  );

  if (currentHighlights.length > 0) {
    currentIndex = 0;
    scrollToCurrent();
  }

  console.log(
    `[peek] Found ${currentHighlights.length} matches for "${query}"`
  );
}

function scrollToCurrent() {
  if (currentHighlights[currentIndex]) {
    currentHighlights[currentIndex].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    highlightCurrent();
  }
}

function highlightCurrent() {
  currentHighlights.forEach((el, idx) => {
    if (searchMode === 'semantic') {
      el.style.backgroundColor = idx === currentIndex ? "#32CD32" : "#90EE90";
    } else {
      el.style.backgroundColor = idx === currentIndex ? "orange" : "yellow";
    }
  });
}

function goToNext() {
  if (currentHighlights.length === 0) return;
  currentIndex = (currentIndex + 1) % currentHighlights.length;
  scrollToCurrent();
}

function goToPrev() {
  if (currentHighlights.length === 0) return;
  currentIndex =
    (currentIndex - 1 + currentHighlights.length) % currentHighlights.length;
  scrollToCurrent();
}

async function handleSearch(query, mode, sendResponse) {
  try {
    let matches = [];

    const { paragraphs } = extractPageContent();
    const chunks = paragraphs.map((p, idx) => ({ text: p.text, id: idx }));

    if (mode === "semantic") {
      const response = await chrome.runtime.sendMessage({
        action: "semanticSearch",
        query,
        content: chunks,
      });

      if (response.success) {
        matches = response.matches;
        highlightSemanticMatches(matches, query);  // Use correct highlighter
      } else {
        console.warn("[peek] Fallback to keyword search due to error:", response.error);
        matches = keywordSearch(query);
        highlightMatches(query);  // Use fallback
      }
    } else {
      matches = keywordSearch(query);
      highlightMatches(query);
    }

    sendResponse({
      count: matches.length,
      mode,
    });
  } catch (error) {
    console.error("[peek] Error in handleSearch:", error);
    sendResponse({ count: 0, mode });
  }
}

// Enhanced message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightSearch") {
    // ✅ Async operation, must return true to keep the port open
    handleSearch(request.query, request.mode, sendResponse);
    return true;
  }

  if (request.action === "nextMatch") {
    scrollToNext();
  }

  if (request.action === "prevMatch") {
    scrollToPrev();
  }

  if (request.action === "clearHighlights") {
    clearHighlights();
  }
});
