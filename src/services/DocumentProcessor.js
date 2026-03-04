import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as XLSX from 'xlsx';
import { Document } from '@langchain/core/documents';
import { createInternalServerError } from '../Utilities/errorStandard.js';

export default class DocumentProcessor {
    constructor(vectorStoreRepository) {
        this.vectorRepo = vectorStoreRepository;
        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
    }

    async #processAndStore(docs, sourceType, sourceFile, topic) {
        try {
            // Add common metadata to all documents
            docs.forEach(doc => {
                doc.metadata.source_type = sourceType;
                doc.metadata.source_file = sourceFile;
                doc.metadata.topic = topic;
            });

            await this.vectorRepo.addDocuments(docs);
            console.log(`Successfully processed and stored ${docs.length} chunks from ${sourceFile}`);
            return docs.length;            
        } catch (error) {
            throw createInternalServerError('Error processing and storing documents', error);            
        }
    }

    async processPDF(filePath, topic = 'general') {
        try {
            console.log(`Processing PDF: ${filePath}`);
            const loader = new PDFLoader(filePath);
            const docs = await loader.load(this.textSplitter);
            return this.#processAndStore(docs, 'pdf', filePath, topic);            
        } catch (error) {
            throw createInternalServerError('Error processing PDF document', error);
        }
    }

    async processExcel(filePath, topic = 'general') {
        try {
            console.log(`Processing Excel: ${filePath}`);
            const workbook = XLSX.readFile(filePath);
            const documents = [];

            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const content = Object.entries(row)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n');
                    
                    if (content.trim()) {
                        documents.push(new Document({
                            pageContent: content,
                            metadata: { sheet: sheetName, row: i + 2 }
                        }));
                    }
                }
            }
            const chunks = await this.textSplitter.splitDocuments(documents);
            return this.#processAndStore(chunks, 'excel', filePath, topic);
        } catch (error) {
            throw createInternalServerError('Error processing Excel document', error);
        }
    }

    async processCSV(filePath, topic = 'general') {
        try {
            console.log(`Processing CSV: ${filePath}`);
            const loader = new CSVLoader(filePath);
            const docs = await loader.load(this.textSplitter);
            return this.#processAndStore(docs, 'csv', filePath, topic);
        } catch (error) {
            throw createInternalServerError('Error processing CSV document', error);
        }
    }
}