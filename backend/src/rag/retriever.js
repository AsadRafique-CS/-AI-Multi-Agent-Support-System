/**
 * Retriever Module
 * High-level interface for retrieving relevant context from the knowledge base
 * Used by agents to augment their responses with knowledge base content
 */

import { searchSimilar, getStats } from "./vectorStore.js";

/**
 * Retrieve relevant context for a query
 * @param {string} query - The user's query/message
 * @param {object} options - Retrieval options
 * @param {number} options.limit - Max documents to retrieve (default: 3)
 * @param {number} options.minSimilarity - Minimum similarity threshold (default: 0.3)
 * @param {string} options.category - Filter by category (optional)
 * @returns {Promise<{context: string, documents: Array, success: boolean}>}
 */
export async function retrieveContext(query, options = {}) {
  const { limit = 3, minSimilarity = 0.3, category = null } = options;

  try {
    // Check if vector store is ready
    const stats = await getStats();
    if (!stats.initialized || stats.count === 0) {
      console.log("⚠️ Knowledge base is empty or not initialized");
      return {
        context: "",
        documents: [],
        success: false,
        reason: "Knowledge base not ready",
      };
    }

    // Search for similar documents
    const results = await searchSimilar(query, limit);

    // Filter by minimum similarity
    let filteredResults = results.filter(
      (doc) => doc.similarity === null || doc.similarity >= minSimilarity
    );

    // Filter by category if specified
    if (category) {
      filteredResults = filteredResults.filter(
        (doc) => doc.metadata?.category === category
      );
    }

    if (filteredResults.length === 0) {
      console.log("⚠️ No relevant documents found above similarity threshold");
      return {
        context: "",
        documents: [],
        success: true,
        reason: "No relevant documents found",
      };
    }

    // Format context for the agent
    const context = formatContextForAgent(filteredResults);

    console.log(`✅ Retrieved ${filteredResults.length} relevant documents`);

    return {
      context,
      documents: filteredResults,
      success: true,
    };
  } catch (error) {
    console.error("❌ Retrieval failed:", error.message);
    return {
      context: "",
      documents: [],
      success: false,
      reason: error.message,
    };
  }
}

/**
 * Format retrieved documents into a context string for the agent
 * @param {Array} documents - Retrieved documents
 * @returns {string} - Formatted context
 */
function formatContextForAgent(documents) {
  if (documents.length === 0) return "";

  const contextParts = documents.map((doc, index) => {
    const title = doc.metadata?.title || `Document ${index + 1}`;
    const category = doc.metadata?.category || "general";
    const similarity = doc.similarity
      ? `(relevance: ${Math.round(doc.similarity * 100)}%)`
      : "";

    return `[${category.toUpperCase()}] ${title} ${similarity}\n${doc.text}`;
  });

  return `
--- KNOWLEDGE BASE CONTEXT ---
${contextParts.join("\n\n")}
--- END CONTEXT ---
`.trim();
}

/**
 * Retrieve context specifically for refund-related queries
 */
export async function retrieveRefundContext(query) {
  return retrieveContext(query, {
    limit: 3,
    minSimilarity: 0.25,
    category: "refund",
  });
}

/**
 * Retrieve context specifically for technical queries
 */
export async function retrieveTechnicalContext(query) {
  return retrieveContext(query, {
    limit: 3,
    minSimilarity: 0.25,
    category: "technical",
  });
}

/**
 * Retrieve context for general queries (searches all categories)
 */
export async function retrieveGeneralContext(query) {
  return retrieveContext(query, {
    limit: 4,
    minSimilarity: 0.2,
  });
}

export default {
  retrieveContext,
  retrieveRefundContext,
  retrieveTechnicalContext,
  retrieveGeneralContext,
};
