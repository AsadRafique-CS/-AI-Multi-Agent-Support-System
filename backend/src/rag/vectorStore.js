/**
 * Vector Store Module
 * Uses ChromaDB for storing and searching document embeddings
 * In-memory storage for simplicity (resets on server restart)
 */

import { ChromaClient } from "chromadb";
import { embed } from "./embeddings.js";

const COLLECTION_NAME = "support_knowledge";

let client = null;
let collection = null;

/**
 * Initialize the vector store
 * Creates ChromaDB client and collection
 */
export async function initialize() {
  try {
    console.log("🗄️ Initializing vector store...");

    // Create in-memory Chroma client
    client = new ChromaClient();

    // Delete existing collection if it exists (fresh start)
    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
    } catch (e) {
      // Collection doesn't exist, that's fine
    }

    // Create new collection
    collection = await client.createCollection({
      name: COLLECTION_NAME,
      metadata: { description: "Support Hub Knowledge Base" },
    });

    console.log("✅ Vector store initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Vector store initialization failed:", error.message);
    throw error;
  }
}

/**
 * Add a document to the vector store
 * @param {string} id - Unique document ID
 * @param {string} text - Document content
 * @param {object} metadata - Additional metadata (category, source, etc.)
 */
export async function addDocument(id, text, metadata = {}) {
  if (!collection) {
    throw new Error("Vector store not initialized. Call initialize() first.");
  }

  try {
    // Generate embedding for the document
    const embedding = await embed(text);

    // Add to collection
    await collection.add({
      ids: [id],
      embeddings: [embedding],
      documents: [text],
      metadatas: [metadata],
    });

    console.log(`📄 Added document: ${id} (${metadata.category || "general"})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to add document ${id}:`, error.message);
    throw error;
  }
}

/**
 * Add multiple documents at once
 * @param {Array<{id: string, text: string, metadata: object}>} documents
 */
export async function addDocuments(documents) {
  console.log(`📚 Adding ${documents.length} documents to vector store...`);

  for (const doc of documents) {
    await addDocument(doc.id, doc.text, doc.metadata || {});
  }

  console.log(`✅ Added ${documents.length} documents successfully`);
}

/**
 * Search for similar documents
 * @param {string} queryText - The query text
 * @param {number} limit - Max number of results (default: 3)
 * @returns {Promise<Array<{id: string, text: string, metadata: object, similarity: number}>>}
 */
export async function searchSimilar(queryText, limit = 3) {
  if (!collection) {
    throw new Error("Vector store not initialized. Call initialize() first.");
  }

  try {
    // Generate embedding for the query
    const queryEmbedding = await embed(queryText);

    // Search for similar documents
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
    });

    // Format results
    const formattedResults = [];
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        formattedResults.push({
          id: results.ids[0][i],
          text: results.documents[0][i],
          metadata: results.metadatas[0][i] || {},
          // ChromaDB returns distances, convert to similarity (1 - distance)
          similarity: results.distances ? 1 - results.distances[0][i] : null,
        });
      }
    }

    console.log(`🔍 Found ${formattedResults.length} similar documents for query`);
    return formattedResults;
  } catch (error) {
    console.error("❌ Search failed:", error.message);
    throw error;
  }
}

/**
 * Delete a document from the vector store
 * @param {string} id - Document ID to delete
 */
export async function deleteDocument(id) {
  if (!collection) {
    throw new Error("Vector store not initialized. Call initialize() first.");
  }

  try {
    await collection.delete({ ids: [id] });
    console.log(`🗑️ Deleted document: ${id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete document ${id}:`, error.message);
    throw error;
  }
}

/**
 * Get collection stats
 */
export async function getStats() {
  if (!collection) {
    return { initialized: false, count: 0 };
  }

  const count = await collection.count();
  return { initialized: true, count };
}

export default {
  initialize,
  addDocument,
  addDocuments,
  searchSimilar,
  deleteDocument,
  getStats,
};
