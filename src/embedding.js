// embedding.js - Text vectorization module using Transformers.js

import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js settings
env.allowLocalModels = true;
env.useBrowserCache = true;
env.localModelPath = './models/';
env.useProgressCallback = true;

// Model configurations
const MODELS = {
  // Small model for free tier - runs entirely in the browser
  local: {
    name: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    max_seq_length: 256
  },
  // Higher quality model for premium tier - uses API
  premium: {
    name: 'text-embedding-ada-002', // This would be accessed via your backend proxy
    dimensions: 1536
  }
};

class EmbeddingManager {
  constructor() {
    this.model = null;
    this.isModelLoading = false;
    this.progressCallbacks = [];
    this.modelLoadingPromise = null;
    this.modelType = 'local'; // 'local' or 'premium'
  }

  /**
   * Initialize the embedding model
   * @param {string} modelType - 'local' or 'premium'
   * @param {Function} progressCallback - Callback for loading progress updates
   * @returns {Promise} - Resolves when model is loaded
   */
  async initialize(modelType = 'local', progressCallback = null) {
    // Register progress callback if provided
    if (progressCallback && typeof progressCallback === 'function') {
      this.progressCallbacks.push(progressCallback);
    }

    // Update model type
    this.modelType = modelType;

    // If we're already loading the model, return the existing promise
    if (this.modelLoadingPromise) {
      return this.modelLoadingPromise;
    }

    // If we're using the premium model type, no need to load local models
    if (this.modelType === 'premium') {
      return Promise.resolve();
    }

    // Start loading the model
    this.isModelLoading = true;
    
    // Create a promise to load the model
    this.modelLoadingPromise = new Promise(async (resolve, reject) => {
      try {
        // Initialize the feature-extraction pipeline
        this.model = await pipeline('feature-extraction', MODELS.local.name, {
          progress_callback: this._handleProgressUpdate.bind(this)
        });
        
        console.log('Embedding model loaded successfully:', MODELS.local.name);
        this.isModelLoading = false;
        resolve(this.model);
      } catch (error) {
        console.error('Error loading embedding model:', error);
        this.isModelLoading = false;
        this.modelLoadingPromise = null;
        reject(error);
      }
    });

    return this.modelLoadingPromise;
  }

  /**
   * Handle progress updates during model loading
   * @param {Object} data - Progress data
   * @private
   */
  _handleProgressUpdate(data) {
    // Call all registered progress callbacks
    for (const callback of this.progressCallbacks) {
      callback(data);
    }
  }

  /**
   * Generate embeddings for a text using the appropriate model
   * @param {string} text - Text to embed
   * @returns {Promise<Float32Array>} - Vector embedding
   */
  async generateEmbedding(text) {
    // Ensure model is initialized
    if (this.modelType === 'local' && !this.model) {
      await this.initialize('local');
    }

    // For premium tier, use the backend service
    if (this.modelType === 'premium') {
      return this._generatePremiumEmbedding(text);
    }

    // For local tier, use the loaded model
    return this._generateLocalEmbedding(text);
  }

  /**
   * Generate embeddings using local model
   * @param {string} text - Text to embed
   * @returns {Promise<Float32Array>} - Vector embedding
   * @private
   */
  async _generateLocalEmbedding(text) {
    try {
      // Generate embedding using the local model
      const output = await this.model(text, {
        pooling: 'mean',
        normalize: true
      });

      // Return the embedding vector
      return output.data;
    } catch (error) {
      console.error('Error generating local embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings using premium API service
   * @param {string} text - Text to embed
   * @returns {Promise<Float32Array>} - Vector embedding
   * @private
   */
  async _generatePremiumEmbedding(text) {
    try {
      // In a real implementation, this would send a request to your backend service
      // which would then forward it to the embedding API using your API keys
      const response = await chrome.runtime.sendMessage({
        action: 'generatePremiumEmbedding',
        text: text
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return new Float32Array(response.embedding);
    } catch (error) {
      console.error('Error generating premium embedding:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Float32Array|Array<number>} vecA - First vector
   * @param {Float32Array|Array<number>} vecB - Second vector
   * @returns {number} - Similarity score between 0 and 1
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Process a page's content into chunks and generate embeddings
   * @param {Array<Object>} chunks - Text chunks from the page
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Promise<Array<Object>>} - Chunks with their embeddings
   */
  async processPageContent(chunks, progressCallback = null) {
    const total = chunks.length;
    const processedChunks = [];

    for (let i = 0; i < total; i++) {
      try {
        // Generate embedding for this chunk
        const embedding = await this.generateEmbedding(chunks[i].text);
        
        // Add the embedding to the chunk
        processedChunks.push({
          ...chunks[i],
          embedding: embedding
        });

        // Report progress
        if (progressCallback && typeof progressCallback === 'function') {
          progressCallback({
            status: 'processing',
            progress: (i + 1) / total,
            current: i + 1,
            total: total
          });
        }
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        // Continue with the next chunk
      }
    }

    return processedChunks;
  }

  /**
   * Find semantic matches between a query and processed chunks
   * @param {Array<Object>} processedChunks - Chunks with embeddings
   * @param {string} query - Search query
   * @param {number} threshold - Similarity threshold (0-1)
   * @returns {Promise<Array<Object>>} - Matching results sorted by similarity
   */
  async findSemanticMatches(processedChunks, query, threshold = 0.7) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Find matches above the threshold
      const matches = [];
      
      for (let i = 0; i < processedChunks.length; i++) {
        const chunk = processedChunks[i];
        
        // Calculate similarity
        const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        
        // If above threshold, add to matches
        if (similarity >= threshold) {
          matches.push({
            index: chunk.index,
            text: chunk.text,
            similarity: similarity,
            node: chunk.node
          });
        }
      }
      
      // Sort by similarity (highest first)
      return matches.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error finding semantic matches:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const embeddingManager = new EmbeddingManager();
export default embeddingManager;
