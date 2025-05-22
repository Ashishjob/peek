// Keep track of current page content and vectors
let pageContent = {
  chunks: [],
  vectors: []
};

// Keep track of highlighted results
let highlightedElements = [];
let currentResultIndex = -1;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Content script received message:', request);
  
  switch(request.action) {
    case 'performSearch':
      handleSearch(request.query, request.threshold, sendResponse);
      return true; // Keep the message channel open for the async response
      
    case 'scrollToResult':
      scrollToResult(request.index);
      break;
      
    case 'clearHighlights':
      clearHighlights();
      break;
    case 'triggerSemanticSearchShortcut':
      const query = prompt("🔍 Enter search query for peek:");
      if (query) {
        handleSearch(query, 0.7, (res) => {
          console.log('[peek] Keyboard search results:', res);
        });
      }
      break;
  }
});

// Function to extract text content from the page
function extractPageContent() {
  // Get body text content, excluding scripts, styles, etc.
  const body = document.body;
  const chunks = [];
  
  // Function to recursively extract text from DOM nodes
  function extractTextFromNode(node, depth = 0) {
    // Skip script, style, and other non-content elements
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || 
        node.tagName === 'NOSCRIPT' || node.tagName === 'IFRAME') {
      return;
    }
    
    // If this is a text node with content
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
      const parentElement = node.parentElement;
      chunks.push({
        text: node.textContent.trim(),
        node: parentElement || node,
        index: chunks.length
      });
      return;
    }
    
    // If this is an element node with children
    if (node.nodeType === Node.ELEMENT_NODE) {
      // For block-level elements or elements with significant content, consider them as chunks
      const isBlockOrSignificant = 
        getComputedStyle(node).display === 'block' || 
        ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(node.tagName);
      
      if (isBlockOrSignificant && node.textContent.trim().length > 0) {
        // Only add as a chunk if it has immediate text children
        // (and not just text from deeply nested elements)
        let hasDirectTextContent = false;
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].nodeType === Node.TEXT_NODE && 
              node.childNodes[i].textContent.trim().length > 0) {
            hasDirectTextContent = true;
            break;
          }
        }
        
        if (hasDirectTextContent) {
          chunks.push({
            text: node.textContent.trim(),
            node: node,
            index: chunks.length
          });
          return;
        }
      }
      
      // Recursively process child nodes
      for (let i = 0; i < node.childNodes.length; i++) {
        extractTextFromNode(node.childNodes[i], depth + 1);
      }
    }
  }
  
  extractTextFromNode(body);
  return chunks;
}

// Function to handle search request
async function handleSearch(query, threshold, sendResponse) {
  try {
    clearHighlights();
    
    // Extract page content if not already done
    if (pageContent.chunks.length === 0) {
      pageContent.chunks = extractPageContent();
      console.log(`Extracted ${pageContent.chunks.length} text chunks from page`);
    }
    
    // For now, we'll use a simple keyword-based approach as a placeholder
    // In the full implementation, this would use the embedded vectors
    const results = performKeywordSearch(query, pageContent.chunks, threshold);
    
    // Highlight the results on the page
    highlightResults(results);
    
    // Send results back to popup
    sendResponse({ results: results });
    
  } catch (error) {
    console.error('Error performing search:', error);
    sendResponse({ error: error.message });
  }
}

// Temporary function to perform keyword search
// This will be replaced with semantic search once we integrate embeddings
function performKeywordSearch(query, chunks, threshold) {
  const results = [];
  const queryLower = query.toLowerCase();
  
  chunks.forEach(chunk => {
    const textLower = chunk.text.toLowerCase();
    if (textLower.includes(queryLower)) {
      // Calculate a simple "similarity" based on number of occurrences
      // This is a placeholder for the actual vector similarity
      const occurrences = (textLower.match(new RegExp(queryLower, 'g')) || []).length;
      const similarity = Math.min(0.5 + (occurrences * 0.1), 0.95);
      
      if (similarity >= threshold) {
        results.push({
          index: chunk.index,
          text: chunk.text,
          similarity: similarity
        });
      }
    }
  });
  
  return results.sort((a, b) => b.similarity - a.similarity);
}

// Function to highlight search results on the page
function highlightResults(results) {
  if (!results || results.length === 0) return;
  
  results.forEach(result => {
    const chunk = pageContent.chunks[result.index];
    if (!chunk || !chunk.node) return;
    
    // Create a highlight element to wrap the content
    const originalContent = chunk.node.innerHTML;
    const highlightColor = getHighlightColor(result.similarity);
    
    // Apply the highlight style
    chunk.node.style.backgroundColor = highlightColor;
    chunk.node.style.transition = 'background-color 0.3s';
    
    // Keep track of highlighted elements for later removal
    highlightedElements.push({
      element: chunk.node,
      originalContent: originalContent
    });
  });
  
  // Scroll to the first result
  if (results.length > 0) {
    scrollToResult(0);
  }
}

// Function to scroll to a specific result
function scrollToResult(index) {
  if (index < 0 || index >= pageContent.chunks.length) return;
  
  const chunk = pageContent.chunks[index];
  if (!chunk || !chunk.node) return;
  
  // Remove highlight from previous result if any
  if (currentResultIndex >= 0 && currentResultIndex < highlightedElements.length) {
    const prevElement = highlightedElements[currentResultIndex].element;
    if (prevElement) {
      prevElement.style.outline = 'none';
    }
  }
  
  // Add highlight to current result
  chunk.node.style.outline = '2px solid #4285f4';
  chunk.node.style.outlineOffset = '-2px';
  
  // Scroll the element into view
  chunk.node.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
  
  currentResultIndex = index;
}

// Function to clear all highlights
function clearHighlights() {
  highlightedElements.forEach(highlight => {
    highlight.element.style.backgroundColor = '';
    highlight.element.style.outline = '';
  });
  
  highlightedElements = [];
  currentResultIndex = -1;
}

// Utility function to get highlight color based on similarity score
function getHighlightColor(similarity) {
  // Convert similarity (0.0-1.0) to a yellow-to-green gradient
  const r = Math.floor(255 - (similarity * 100));
  const g = 255;
  const b = 0;
  return `rgba(${r}, ${g}, ${b}, 0.3)`;
}

// Initialize when the content script loads
console.log('peek Semantic Search content script initialized');
