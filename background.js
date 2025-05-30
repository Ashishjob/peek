// background.js
console.log("[peek] background script loaded");

// Configuration - Update these with your Elasticsearch settings
const ELASTICSEARCH_CONFIG = {
  url: 'http://localhost:9200', // Your Elasticsearch URL
  index: 'peek_search', // Index name for storing embeddings
  // Add authentication if needed
  // username: 'your_username',
  // password: 'your_password'
};

// Create Elasticsearch index if it doesn't exist
async function ensureIndexExists() {
  try {
    // Check if Elasticsearch is accessible
    const healthCheck = await fetch(`${ELASTICSEARCH_CONFIG.url}/_cluster/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!healthCheck.ok) {
      console.warn('[peek] Elasticsearch not accessible, semantic search will use fallback');
      return false;
    }
    
    const response = await fetch(`${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}`, {
      method: 'HEAD'
    });
    
    if (response.status === 404) {
      // Create index with proper mapping for vector search
      const createResponse = await fetch(`${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mappings: {
            properties: {
              text: { type: 'text' },
              embedding: {
                type: 'dense_vector',
                dims: 384 // Adjust based on your embedding model
              },
              url: { type: 'keyword' },
              timestamp: { type: 'date' }
            }
          }
        })
      });
      
      if (createResponse.ok) {
        console.log('[peek] Elasticsearch index created');
        return true;
      }
    }
    
    return response.ok;
  } catch (error) {
    console.warn('[peek] Elasticsearch not available, using fallback semantic search:', error.message);
    return false;
  }
}

// Add your Hugging Face API key here
const YOUR_HUGGINGFACE_API_KEY = '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'; // Replace with your actual token

// Generate embeddings using a local model or API
async function generateEmbedding(text) {
  try {
    // Use Hugging Face API (free tier available)
    const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOUR_HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text
      })
    });
    
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }
    
    const embedding = await response.json();
    
    // Handle potential API errors
    if (embedding.error) {
      throw new Error(embedding.error);
    }
    
    return embedding;
    
  } catch (error) {
    console.error('[peek] Error generating embedding:', error);
    return null;
  }
}

// Store content with embeddings in Elasticsearch
async function storeContentWithEmbeddings(content, url) {
  try {
    const documents = [];
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      const embedding = await generateEmbedding(item.text);
      
      if (embedding) {
        documents.push({
          index: {
            _index: ELASTICSEARCH_CONFIG.index,
            _id: `${url}_${i}`
          }
        });
        
        documents.push({
          text: item.text,
          embedding: embedding,
          url: url,
          timestamp: new Date().toISOString(),
          content_id: i
        });
      }
    }
    
    if (documents.length > 0) {
      const response = await fetch(`${ELASTICSEARCH_CONFIG.url}/_bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: documents.map(doc => JSON.stringify(doc)).join('\n') + '\n'
      });
      
      if (response.ok) {
        console.log(`[peek] Stored ${documents.length / 2} documents in Elasticsearch`);
      }
    }
  } catch (error) {
    console.error('[peek] Error storing content:', error);
  }
}

// Perform semantic search using Elasticsearch
async function performSemanticSearch(query, content) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding');
    }
    
    // Search using vector similarity
    const searchResponse = await fetch(`${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          script_score: {
            query: { match_all: {} },
            script: {
              source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
              params: {
                query_vector: queryEmbedding
              }
            }
          }
        },
        size: 10,
        _source: ['text', 'content_id']
      })
    });
    
    const searchResults = await searchResponse.json();
    
    // Format results for highlighting
    const matches = searchResults.hits.hits.map(hit => ({
      id: hit._source.content_id,
      text: hit._source.text,
      score: hit._score
    }));
    
    return matches;
    
  } catch (error) {
    console.error('[peek] Semantic search error:', error);
    
    // Fallback: simple text matching for demo purposes
    const matches = content
      .map((item, index) => ({
        id: index,
        text: item.text,
        score: item.text.toLowerCase().includes(query.toLowerCase()) ? 0.8 : 0.1
      }))
      .filter(match => match.score > 0.5)
      .sort((a, b) => b.score - a.score);
    
    return matches;
  }
}

// Message listener for semantic search requests
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'semanticSearch') {
    try {
      const currentTab = sender.tab;
      
      // Store content for future searches if not already stored
      await storeContentWithEmbeddings(request.content, currentTab.url);
      
      // Perform semantic search
      const matches = await performSemanticSearch(request.query, request.content);
      
      sendResponse({ 
        success: true, 
        matches: matches,
        query: request.query
      });
    } catch (error) {
      console.error('[peek] Background script error:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
    
    return true; // Keep message channel open for async response
  }
});

// Initialize on extension startup
chrome.runtime.onStartup.addListener(ensureIndexExists);
chrome.runtime.onInstalled.addListener(ensureIndexExists);
