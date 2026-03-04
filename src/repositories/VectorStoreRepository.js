import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { pool } from '../config/dbConnection.js'; 

export default class VectorStoreRepository {
    constructor(geminiConfig) {
        this.pool = pool;
        this.embeddings = geminiConfig.getEmbeddings();
        this.vectorStore = null; 
    }

    /**
     * Initializes the PGVectorStore instance.
     * This must be called before any other methods are used.
     */
    async initialize() {
        if (this.vectorStore) {
            return; 
        }

        console.log("Initializing PGVectorStore...");
        this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
            pool: this.pool,
            tableName: "knowledge_base",
            columns: {
                idColumnName: "id",
                vectorColumnName: "embedding",
                contentColumnName: "content",
                metadataColumnName: "metadata",
            },
            // Use 'cosine' for distance strategy as it's common for text embeddings
            distanceStrategy: "cosine", 
        });
        console.log("PGVectorStore initialized successfully.");
    }

    /**
     * Ensures the vector store is initialized before use.
     */
    async #getStore() {
        if (!this.vectorStore) {
            await this.initialize();
        }
        return this.vectorStore;
    }

    /**
     * Adds documents to the vector store.
     * @param {Array<Document>} documents - An array of LangChain Document objects.
     */
    async addDocuments(documents) {
        const store = await this.#getStore();
        await store.addDocuments(documents);
    }

    /**
     * Performs a similarity search on the vector store.
     * @param {string} query - The search query.
     * @param {number} k - The number of results to return.
     * @returns {Promise<Array<Document>>}
     */
    async similaritySearch(query, k = 5) {
        const store = await this.#getStore();
        return store.similaritySearch(query, k);
    }
}