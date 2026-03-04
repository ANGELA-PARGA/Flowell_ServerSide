import path from 'path';
import fs from 'fs';
import { chatbotAgent, documentProcessor, knowledgeQueries } from '../../config/container.js';

class ChatbotController {
    /**
     * Process chat message with AI agent
     */
    async processChat(req, res, next) {
        try {
            const { message } = req.body;
            const userId = req.user.id;
            const session_id = req.sessionID;
            const userRole = req.user.role;

            console.log(`Processing chat for user ${userId}: ${message}`);

            const result = await chatbotAgent.processConversation(
                userId, 
                userRole, 
                message, 
                session_id
            );
            console.log(result);

            res.json({
                success: true,
                ...result
            });

        } catch (error) {
            console.error('Chat processing error:', error);
            next(error);
        }
    }

    /**
     * Get conversation history for user session
     */
    async getConversationHistory(req, res, next) {
        try {
            const sessionId = req.sessionID;
            const limit = parseInt(req.query.limit) || 20;

            const history = await chatbotAgent.getConversationHistory(sessionId, limit);

            res.json({
                success: true,
                history: history,
                session_id: sessionId
            });

        } catch (error) {
            console.error('History retrieval error:', error);
            next(error);
        }
    }

    /**
     * Admin: Upload and process knowledge documents
     */
    async uploadKnowledgeDocument(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const { topic = 'general' } = req.body;
            const filePath = req.file.path;
            const fileExt = path.extname(req.file.originalname).toLowerCase();

            console.log(`Processing uploaded file: ${req.file.originalname}`);

            let result;
            switch (fileExt) {
                case '.pdf':
                    result = await documentProcessor.processPDF(filePath, topic);
                    break;
                case '.xlsx':
                case '.xls':
                    result = await documentProcessor.processExcel(filePath, topic);
                    break;
                case '.csv':
                    result = await documentProcessor.processCSV(filePath, topic);
                    break;
                default:
                    return res.status(400).json({ error: 'Unsupported file type' });
            }

            require('fs').unlinkSync(filePath);

            res.json({
                success: true,
                message: `Successfully processed ${result} chunks from ${req.file.originalname}`,
                chunks_processed: result,
                topic: topic
            });

        } catch (error) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Document upload error:', error);
            next(error);
        }
    }

    /**
     * Admin: Get knowledge base statistics
     */
    async getKnowledgeStats(req, res, next) {
        try {
            const stats = await knowledgeQueries.getKnowledgeStats();

            res.json({
                success: true,
                stats: stats
            });

        } catch (error) {
            console.error('Stats retrieval error:', error);
            next(error);
        }
    }
}

export default new ChatbotController();