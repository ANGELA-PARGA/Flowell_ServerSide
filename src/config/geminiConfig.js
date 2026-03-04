// src/config/geminiConfig.js
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
import { createInternalServerError } from '../Utilities/errorStandard.js';

dotenv.config({ path: 'variables.env' });

export class GeminiConfig {
    constructor() {
        console.log("Initializing GeminiConfig...");
        this.apiKey = process.env.GOOGLE_API_KEY;
        
        if (!this.apiKey) {
            throw createInternalServerError('GOOGLE_API_KEY environment variable is required');
        }

        // Configure the chat model
        this.chatModel = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            //maxOutputTokens: 2048,
            temperature: 0,
            apiKey: this.apiKey,
        });

        // Configure embeddings model
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004",
            apiKey: this.apiKey,
        });
    }

    getChatModel() {
        return this.chatModel;
    }

    getEmbeddings() {
        return this.embeddings;
    }
}

export default GeminiConfig;