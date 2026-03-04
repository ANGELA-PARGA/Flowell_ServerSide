"use strict";
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' }); 

import app from './src/app.js';
import { pool } from './src/config/dbConnection.js';

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        const server = app.listen(PORT, "::", () => {
            console.log(`Flowell app listening on port ${PORT}`);
        });

        process.on('SIGTERM', async () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(async () => {
                console.log('HTTP server closed');
                await pool.end(); 
                process.exit(0);
            });
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

export default app;



