// src/services/ChatbotAgent.js
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { PostgresChatMessageHistory } from "@langchain/community/stores/message/postgres";
import { AgentTools } from './AgentTools.js';
import GeminiConfig from '../config/geminiConfig.js';
import { createInternalServerError } from '../Utilities/errorStandard.js';

export default class ChatbotAgent {
    constructor(repositories) {
        this.repositories = repositories;
        this.geminiConfig = new GeminiConfig();
        this.llm = this.geminiConfig.getChatModel();
        this.agentTools = new AgentTools(repositories);
        // The agentExecutor will be created on-demand for each user session
    }

    async #createAgentExecutor(userId, userRole) {
        try {
            const tools = this.agentTools.createTools(userId, userRole);
        
            const prompt = ChatPromptTemplate.fromMessages([
                ["system", `You are Flowell Assistant, an AI agent for an e-commerce flower business.
                    Your capabilities:
                    - Answer questions using the knowledge base (policies, FAQ, product guides)
                    - Help users with their orders, profile, and cart
                    - Search and recommend products
                    - Perform actions like adding items to cart
                    ${userRole === 'admin' ? '- Admin functions like updating order status' : ''}
                    Guidelines:
                    - Be helpful, friendly, and professional.
                    - Always use tools to get accurate, real-time information.
                    - If you need to perform an action, explain what you're doing.
                    - If you can't find information or perform an action, explain why.
                    Current user role: ${userRole}`
                ], new MessagesPlaceholder("chat_history"), ["human", "{input}"], new MessagesPlaceholder("agent_scratchpad"),
            ]);

            const agent = await createToolCallingAgent({ llm: this.llm, tools, prompt });
            
            return new AgentExecutor({
                agent,
                tools,
                verbose: process.env.NODE_ENV === 'development',
                maxIterations: 7, // Increased slightly for complex conversations
                returnIntermediateSteps: true,
            });                
        } catch (error) {
            console.error('Failed to create AgentExecutor:', error);
            throw createInternalServerError('Error creating agent executor', error);            
        }
    }

    async processConversation(userId, userRole, message, sessionId) {
        try {
            if (!sessionId) {
                throw new Error("Session ID is required for conversation history.");
            }

            const agentExecutor = await this.#createAgentExecutor(userId, userRole);

            const agentWithChatHistory = new RunnableWithMessageHistory({
                runnable: agentExecutor,
                getMessageHistory: (sessionId) => {
                    return new PostgresChatMessageHistory({
                        pool: this.repositories.pool,
                        tableName: "agent_conversations",
                        sessionId,
                    });
                },
                inputMessagesKey: "input",
                historyMessagesKey: "chat_history",
            });

            const result = await agentWithChatHistory.invoke(
                { input: message },
                { configurable: { sessionId } }
            );

            return {
                response: result.output,
                session_id: sessionId,
                tools_used: this.#extractToolsUsed(result.intermediateSteps || []),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Agent processing error:', error);
            throw createInternalServerError('Error processing conversation', error);
        }
    }

    #extractToolsUsed(intermediateSteps) {
        return intermediateSteps.map(step => ({
            tool: step.action?.tool || 'unknown',
            input: step.action?.toolInput || '',
            output: step.observation || ''
        }));
    }

    /**
     * Retrieves conversation history for administrative or display purposes.
     * Note: This is separate from the agent's internal memory management.
     */
    async getConversationHistory(sessionId, limit = 20) {
        try {
            const history = new PostgresChatMessageHistory({
                pool: this.repositories.pool,
                tableName: "agent_conversations",
                sessionId,
            });
            const messages = await history.getMessages();
            return messages.slice(-limit);
        } catch (error) {
            console.error('Failed to get conversation history:', error);
            throw createInternalServerError('Error retrieving conversation history', error);
        }
    } 
}  