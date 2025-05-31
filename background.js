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

// 🛠 Ensure index exists
async function ensureIndexExists() {
  try {
    const health = await fetch(`${ELASTICSEARCH_CONFIG.url}/_cluster/health`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!health.ok) {
      console.warn("[peek] Elasticsearch not accessible");
      return false;
    }

    const exists = await fetch(`${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}`, {
      method: "HEAD",
      headers: getAuthHeaders(),
    });

    if (exists.status === 404) {
      const create = await fetch(`${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          mappings: {
            properties: {
              text: { type: "text" },
              embedding: { type: "dense_vector", dims: 384 },
              url: { type: "keyword" },
              timestamp: { type: "date" },
              content_id: { type: "integer" }
            },
          },
        }),
      });

      if (create.ok) {
        console.log("[peek] Index created");
      } else {
        console.error("[peek] Index creation failed:", await create.text());
      }
    }
  } catch (e) {
    console.error("[peek] ensureIndexExists failed:", e);
  }
}

const HUGGINGFACE_API_KEY = "";

async function generateEmbedding(text) {
  const res = await fetch(
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

  if (!res.ok) {
    const err = await res.text();
    console.error("[peek] HuggingFace error:", err);
    throw new Error("HuggingFace error");
  }

  const json = await res.json();
  return json[0];
}

async function storeContentWithEmbeddings(content, url) {
  await ensureIndexExists();

  const documents = [];

  for (let i = 0; i < content.length; i++) {
    const item = content[i];
    try {
      const embedding = await generateEmbedding(item.text);
      documents.push(
        { index: { _index: ELASTICSEARCH_CONFIG.index, _id: `${url}_${i}` } },
        {
          text: item.text,
          embedding,
          url,
          timestamp: new Date().toISOString(),
          content_id: i,
        }
      );
    } catch (e) {
      console.warn(`[peek] Skipped embedding for "${item.text.slice(0, 40)}":`, e.message);
    }
  }

  if (documents.length === 0) {
    console.warn("[peek] No documents to store");
    return;
  }

  const body = documents.map(doc => JSON.stringify(doc)).join("\n") + "\n";
  const res = await fetch(`${ELASTICSEARCH_CONFIG.url}/_bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body,
  });

  const resText = await res.text();
  console.log("[peek] Bulk response:", resText);

  if (!res.ok || resText.includes('"errors":true')) {
    throw new Error("Bulk insert failed");
  }
}

async function performSemanticSearch(query, content) {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const res = await fetch(`${ELASTICSEARCH_CONFIG.url}/${ELASTICSEARCH_CONFIG.index}/_search`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: {
          script_score: {
            query: { match_all: {} },
            script: {
              source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
              params: { query_vector: queryEmbedding },
            },
          },
        },
        size: 10,
        _source: ["text", "content_id"],
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const json = await res.json();
    return json.hits.hits.map(hit => ({
      id: hit._source.content_id,
      text: hit._source.text,
      score: hit._score,
    }));
  } catch (e) {
    console.error("[peek] Semantic fallback:", e.message);
    return content
      .map((item, index) => ({
        id: index,
        text: item.text,
        score: item.text.toLowerCase().includes(query.toLowerCase()) ? 0.8 : 0.1,
      }))
      .filter(item => item.score > 0.5)
      .sort((a, b) => b.score - a.score);
  }
}

// 🔌 Listener
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "semanticSearch") {
    try {
      const matches = await performSemanticSearch(request.query, request.content);
      await storeContentWithEmbeddings(request.content, request.url);
      sendResponse({ success: true, matches });
    } catch (e) {
      console.error("[peek] search error:", e.message);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }

  if (request.action === "storeEmbeddings") {
    try {
      await storeContentWithEmbeddings(request.content, request.url);
      sendResponse({ success: true });
    } catch (e) {
      console.error("[peek] store error:", e.message);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
});

chrome.runtime.onInstalled.addListener(ensureIndexExists);
chrome.runtime.onStartup.addListener(ensureIndexExists);
