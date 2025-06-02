console.log("[peek] background script loaded");

const ELASTICSEARCH_CONFIG = {
  url: "https://871b259f3f2c43099b969a06d73cab1b.us-east-1.aws.found.io",
  index: "peek",
  username: "elastic",
  password: "PyAdeInNg7whrxaVVFSqQR6I",
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization:
    "Basic " +
    btoa(`${ELASTICSEARCH_CONFIG.username}:${ELASTICSEARCH_CONFIG.password}`),
});

// Create Elasticsearch index if it doesn't exist
async function ensureIndexExists() {
  try {
    const healthCheck = await fetch(
      `${ELASTICSEARCH_CONFIG.url}/_cluster/health`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!healthCheck.ok) {
      const errorText = await healthCheck.text();
      console.warn("[peek] Elasticsearch not accessible:", healthCheck.status, errorText);
      return false;
    }

    const response = await fetch(`${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}`, {
        method: "HEAD",
        headers: getAuthHeaders(),
      }
    );

    if (response.status === 404) {
      const createResponse = await fetch(
        `${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            mappings: {
              properties: {
                text: { type: "text" },
                embedding: {
                  type: "dense_vector",
                  dims: 384,
                },
                url: { type: "keyword" },
                timestamp: { type: "date" },
              },
            },
          }),
        }
      );

      if (createResponse.ok) {
        console.log("[peek] Elasticsearch index created");
        return true;
      }
    }

    return response.ok;
  } catch (error) {
    console.warn("[peek] Elasticsearch not available:", error.message);
    return false;
  }
}

const HUGGINGFACE_API_KEY = "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";

async function generateEmbedding(text) {
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );
  
    if (!response.ok) {
      const error = await response.json();
      console.error("[peek] HuggingFace API error details:", error);
      throw new Error("HuggingFace API error: " + response.status);
    }
  
    const json = await response.json();
    return json[0]; // return the embedding vector
  }
  
async function storeContentWithEmbeddings(content, url) {
    await ensureIndexExists();

    try {
      const documents = [];
  
      for (let i = 0; i < content.length; i++) {
        const item = content[i];
        const embedding = await generateEmbedding(item.text);
  
        if (!embedding) {
          console.warn(`[peek] Skipped: failed to embed "${item.text.slice(0, 40)}..."`);
          continue;
        }
  
        console.log(`[peek] Embedding for "${item.text.slice(0, 40)}..." → Length: ${embedding.length}`);
  
        documents.push(
          {
            index: {
              _index: ELASTICSEARCH_CONFIG.index,
              _id: `${url}_${i}`,
            },
          },
          {
            text: item.text,
            embedding,
            url,
            timestamp: new Date().toISOString(),
            content_id: i,
          }
        );
      }
  
      if (documents.length > 0) {
        const bulkBody = documents.map((doc) => JSON.stringify(doc)).join("\n") + "\n";
  
        console.log("[peek] Bulk request body (first 500 chars):", bulkBody.slice(0, 500));
  
        const bulkResponse = await fetch(`${ELASTICSEARCH_CONFIG.url}/_bulk`, {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/x-ndjson",
            },
            body: bulkBody,
          });
          
          const responseText = await bulkResponse.text();
          console.log("[peek] Bulk response:", responseText);
          
          if (!bulkResponse.ok) {
            console.error("[peek] Bulk request failed with status:", bulkResponse.status);
            console.error("[peek] Response text:", responseText);
            throw new Error(`Bulk insert failed with status ${bulkResponse.status}: ${responseText}`);
          }
          
          try {
            const responseJson = JSON.parse(responseText);
            if (responseJson.errors) {
              throw new Error("Bulk insert had errors: " + JSON.stringify(responseJson.items.filter(item => item.index && item.index.error)));
            }
          } catch (parseError) {
            if (responseText.includes('"errors":true')) {
              throw new Error("Bulk insert failed: " + responseText);
            }
            // If it's not valid JSON but the request was successful, log a warning
            console.warn("[peek] Bulk response is not valid JSON, but request was successful");
          }
  
        console.log(`[peek] Stored ${documents.length / 2} documents in Elasticsearch`);
      } else {
        console.warn("[peek] No documents to store — skipping _bulk call.");
      }
    } catch (error) {
      console.error("[peek] Error storing content:", error);
    }
  }

  async function performSemanticSearch(query, content) {
    try {
      const queryEmbedding = await generateEmbedding(query);
      if (!queryEmbedding) throw new Error("Failed to generate query embedding");
  
      console.log("[peek] Query embedding shape:", queryEmbedding.length);
  
      const searchResponse = await fetch(
        `${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}/_search`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            query: {
              script_score: {
                query: { match_all: {} },
                script: {
                  source:
                    "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                  params: { query_vector: queryEmbedding },
                },
              },
            },
            size: 10,
            _source: ["text", "content_id"],
          }),
        }
      );
  
      if (!searchResponse.ok) {
        const errText = await searchResponse.text();
        throw new Error("Elasticsearch query failed: " + errText);
      }
      
      const searchResults = await searchResponse.json();      
  
      return searchResults.hits.hits.map((hit) => ({
        id: hit._source.content_id,
        text: hit._source.text,
        score: hit._score,
      }));
    } catch (error) {
      console.error("[peek] Semantic search error:", error);
      // fallback: keyword search
      return content
        .map((item, index) => ({
          id: index,
          text: item.text,
          score: item.text.toLowerCase().includes(query.toLowerCase())
            ? 0.8
            : 0.1,
        }))
        .filter((match) => match.score > 0.5)
        .sort((a, b) => b.score - a.score);
    }
  }
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "semanticSearch") {
    (async () => {
      try {
        const url = sender.tab ? sender.tab.url : 'unknown';
        await storeContentWithEmbeddings(request.content, url);   
        const matches = await performSemanticSearch(
          request.query,
          request.content
        );

        sendResponse({ success: true, matches, query: request.query });
      } catch (error) {
        console.error("[peek] Background script error:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
  if (request.action === 'storeEmbeddings') {
    (async () => {
      try {
        const currentTab = sender.tab;
        await storeContentWithEmbeddings(request.content, currentTab.url);
        sendResponse({ success: true });
      } catch (error) {
        console.error("[peek] storeEmbeddings error:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
  
});

chrome.runtime.onStartup.addListener(ensureIndexExists);
chrome.runtime.onInstalled.addListener(ensureIndexExists);
