// textChunker.js - Utility for extracting and chunking text from web pages

export function extractTextChunks(doc = document, options = {}) {
  const {
    minChunkLength = 20,
    maxChunkLength = 300,
    chunkOverlap = 50,
    includeHeadings = true,
    skipSelectors = [
      'script', 'style', 'noscript', 'iframe',
      'nav', 'footer', '.ad', '.advertisement',
      '[aria-hidden="true"]'
    ],
    prioritizeViewport = true
  } = options;

  const chunks = [];
  const body = doc.body;
  if (!body) return chunks;

  const walker = doc.createTreeWalker(
    body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        for (const selector of skipSelectors) {
          if (node.parentElement && node.parentElement.matches(selector)) {
            return NodeFilter.FILTER_SKIP;
          }
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    },
    false
  );

  let currentNode;
  while (currentNode = walker.nextNode()) {
    const text = currentNode.textContent.trim();
    if (text.length < minChunkLength) continue;
    const splitChunks = splitTextIntoChunks(text, {
      maxChunkLength,
      chunkOverlap
    });
    chunks.push(...splitChunks);
  }

  return chunks;
}

function splitTextIntoChunks(text, { maxChunkLength, chunkOverlap }) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChunkLength, text.length);
    chunks.push({
      text: text.slice(start, end),
      metadata: { start, end }
    });
    start = end - chunkOverlap;
  }
  return chunks;
}

export function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
