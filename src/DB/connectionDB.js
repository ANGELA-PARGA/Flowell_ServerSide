"use strict";

require('dotenv').config({ path: 'variables.env' });

const { Pool } = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

module.exports = {
    query: (text, params) => pool.query(text, params)
} 