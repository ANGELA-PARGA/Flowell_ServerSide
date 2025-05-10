"use strict";

import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

/**
 * * This file is responsible for setting up the database connection using the pg library.
 * * It exports a pool of connections that can be used to query the database.
 * * * The connection details are loaded from environment variables using dotenv.
 */
import pg from 'pg';
const Pool = pg.Pool; // Import the Pool class from the pg

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

export default {
    query: (text, params) => pool.query(text, params)
};