// similarity.js - Compute cosine similarity between vectors

export function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB);
}

export function rankBySimilarity(queryEmbedding, chunkEmbeddings, topN = 5, threshold = 0.7) {
  return chunkEmbeddings
    .map((item, index) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return { ...item, score, index };
    })
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
