// src/Routes/ClientRoutes/chatbotRoutes.js
import express from 'express';
import { validateChatMessage, validateTopicDocument } from '../../middleware/expressValidators.js';
import { documentUpload } from '../../config/multer.js';
import { checkAuthenticated, checkAdminRole } from '../../middleware/appMiddlewares.js';
import chatbotController from '../../controllers/clientControllers/chatbotController.js';

const router = express.Router();

router.post('/chat', checkAuthenticated, ...validateChatMessage, chatbotController.processChat);

router.get('/history/:sessionId', checkAuthenticated, chatbotController.getConversationHistory);

router.post('/admin/upload-knowledge', checkAuthenticated, checkAdminRole, documentUpload.single('document'), ...validateTopicDocument, chatbotController.uploadKnowledgeDocument);

router.get('/admin/knowledge-stats', checkAuthenticated, checkAdminRole, chatbotController.getKnowledgeStats);

export default router;