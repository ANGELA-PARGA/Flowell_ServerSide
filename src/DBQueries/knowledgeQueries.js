import { createDatabaseError } from '../Utilities/errorStandard.js';

export default class KnowledgeQueries {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

    static handleDbError(error, context) {
        const dbError = createDatabaseError( `An unexpected error occurred during ${context}`, error);
        return dbError;
    }

    /**
     * Get statistics about the knowledge base content
     * Groups by source type (pdf, excel, csv) and topic
     * @returns {Promise<Array>} Array of knowledge base statistics
     */
    async getKnowledgeStats() {
        const query = `
            SELECT 
                source_type,
                topic,
                COUNT(*) as chunk_count,
                MIN(created_at) as first_added,
                MAX(created_at) as last_added
            FROM knowledge_base 
            GROUP BY source_type, topic
            ORDER BY source_type, topic
        `;

        try {
            const result = await this.db.any(query);
            return result; 
        } catch (error) {
            console.error('error getting knowledge stats:', error)
            throw this.handleDbError(error, 'getKnowledgeStats');
        }
    }

    /**
     * Get total knowledge base summary
     * @returns {Promise<Object>} Total counts and summary
     */
    async getKnowledgeSummary() {
        const query = `
            SELECT 
                COUNT(*) as total_chunks,
                COUNT(DISTINCT topic) as unique_topics,
                COUNT(DISTINCT source_type) as source_types,
                MIN(created_at) as oldest_content,
                MAX(created_at) as newest_content
            FROM knowledge_base
        `;

        try {
            const result = await this.db.query(query);
            return result[0]; 
        } catch (error) {
            console.error('Error fetching knowledge summary:', error);
            throw this.handleDbError(error, 'getKnowledgeSummary');
        }
    }

    /**
     * Get knowledge stats for a specific topic
     * @param {string} topic - The topic to filter by
     * @returns {Promise<Array>} Knowledge stats for the topic
     */
    async getTopicStats(topic) {
        const query = this.pgp.as.format(`
            SELECT 
                source_type,
                COUNT(*) as chunk_count,
                MIN(created_at) as first_added,
                MAX(created_at) as last_added
            FROM knowledge_base 
            WHERE topic = $1
            GROUP BY source_type
            ORDER BY source_type
        `, [topic]);

        try {
            const result = await this.db.any(query);
            return result;
        } catch (error) {
            console.error('Error getting topic stats:', error);
            throw this.handleDbError(error, 'getTopicStats');
        }
    }

    /**
     * Delete all knowledge for a specific topic (admin cleanup)
     * @param {string} topic - The topic to delete
     * @returns {Promise<number>} Number of chunks deleted
     */
    async deleteTopicKnowledge(topic) {
        const query = this.pgp.as.format(`
            DELETE FROM knowledge_base 
            WHERE topic = $1
        `,  [topic]);

        try {
            const result = await this.db.result(query);
            return result.rowCount;
        } catch (error) {
            console.error('Error deleting topic knowledge:', error);
            throw this.handleDbError(error, 'deleteTopicKnowledge');
        }
    }
}