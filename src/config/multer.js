import multer from 'multer';
import path from 'path';
import { createInternalServerError } from '../Utilities/errorStandard.js';

// This configuration uses memory storage, which stores the file in memory as a Buffer.
const imageStorage = multer.memoryStorage();

// Disk storage for documents 
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/knowledge/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: imageStorage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

// Document upload configuration
export const documentUpload = multer({ 
    storage: documentStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.xlsx', '.xls', '.csv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(createInternalServerError('Only PDF, Excel, and CSV files are allowed'));
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});


export default upload;