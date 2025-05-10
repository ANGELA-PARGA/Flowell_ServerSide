// connectionDB.js

import db from '../DB/connectionDB.js';
import pgPromise from 'pg-promise';
const pgp = pgPromise({ capSQL: true });
/**
 * 
 */
export { db, pgp };
