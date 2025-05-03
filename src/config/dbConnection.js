// connectionDB.js
const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');

module.exports = { db, pgp };
