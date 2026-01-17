/**
 * Embeddings Module
 * Converts text into vector embeddings using a local transformer model
 * Model: all-MiniLM-L6-v2 (384 dimensions, fast, good quality)
 */

let pipeline = null;
let embedder = null;

/**
 * Lazy-load the embedding model on first use
 * This avoids loading the model if RAG is never used
 */
async function getEmbedder() {
  if (embedder) return embedder;

  console.log("🧠 Loading embedding model (first time only)...");

  try {
    // Dynamic import for ES modules
    const { pipeline: pipelineFn } = await import("@xenova/transformers");
    pipeline = pipelineFn;

    // Load the feature-extraction pipeline with MiniLM model
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true, // Use quantized model for faster loading
    });

    console.log("✅ Embedding model loaded successfully");
    return embedder;
  } catch (error) {
    console.error("❌ Failed to load embedding model:", error.message);
    throw error;
  }
}

/**
 * Convert text to a vector embedding
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - 384-dimensional vector
 */
export async function embed(text) {
  try {
    const model = await getEmbedder();

    // Get embeddings from the model
    const output = await model(text, {
      pooling: "mean",      // Average all token embeddings
      normalize: true,      // Normalize to unit length for cosine similarity
    });

    // Convert to regular array
    const embedding = Array.from(output.data);

    console.log(`📊 Generated embedding for: "${text.substring(0, 50)}..." (${embedding.length} dims)`);

    return embedding;
  } catch (error) {
    console.error("❌ Embedding error:", error.message);
    throw error;
  }
}

/**
 * Embed multiple texts at once (batch processing)
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embeddings
 */
export async function embedBatch(texts) {
  console.log(`📊 Batch embedding ${texts.length} texts...`);

  const embeddings = [];
  for (const text of texts) {
    const embedding = await embed(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

export default { embed, embedBatch };
