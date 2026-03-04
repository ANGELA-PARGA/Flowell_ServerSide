
import { createDatabaseError } from '../Utilities/errorStandard.js';

class OrderedItemsQueries {
    /**
     * OrderedItemsQueries class is responsible for executing queries related to ordered items in the database.
     * It contains the following methods:
     * - updateOrderedItems: Updates the quantity of ordered items in the database.
     * - cancelOrderedItems: Cancels the ordered items by setting their quantity to 0.
     * It uses pg-promise to interact with the PostgreSQL database and also the object 'db' (dbConnection) to execute the queries.
     * @param {Object} db - The database connection object.
     * @param {Object} pgp - The pg-promise library instance.
     */
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

    static handleDbError(error, context) {
        const dbError = createDatabaseError( `An unexpected error occurred during ${context}`, error);
        return dbError;
    }

    /**
     * Update items of an order stored on the DB using a data object { order_id, product_id, qty } 
     * It returns an object with the updated information if the query was succesfull, otherwise it returns an empty object
     * @param {Object} data { order_id, product_id, qty }
     * @returns {Object} successfull query 
     * @returns {null} unsuccessfull query
     */
    async updateOrderedItems(data) {
        try {
            const { order_id, product_id, qty } = data;
            const updated_at = new Date().toISOString();
            
            const condition = this.pgp.as.format(`WHERE order_id = $1 AND product_id = $2 RETURNING *`, [order_id, product_id]);
            const sqlStatement = this.pgp.helpers.update({qty: qty, updated_at:updated_at}, null, 'ordered_items') + condition;

            
            const queryResult = await this.db.query(sqlStatement);
            return queryResult[0] || null;
        } catch (error) {
            throw OrderedItemsQueries.handleDbError(error, `update ordered items in updateOrderedItems from ordered items table`);            
        }
    }

    /**
     * Update items of an order stored on the DB using a data object { order_id } and
     * set the qty of all items to 0
     * It returns an object with the updated information if the query was succesfull, otherwise it returns an empty object
     * @param {Object} data { order_id }
     * @returns {Object} successfull query 
     * @returns {null} unsuccessfull query
     */
    async cancelOrderedItems(data) {
        try {
            const { order_id } = data;
            const updated_at = new Date().toISOString();
            
            const condition = this.pgp.as.format(`WHERE order_id = $1 RETURNING *`, [order_id]);
            const sqlStatement = this.pgp.helpers.update({qty: 0, updated_at:updated_at}, null, 'ordered_items') + condition;

            
            const queryResult = await this.db.query(sqlStatement);
            return queryResult[0] || null;
            
        } catch (error) {
            throw OrderedItemsQueries.handleDbError(error, `update to 0 ordered items in cancelOrderedItems from ordered items table`);                      
        }

    }
}

export default OrderedItemsQueries;

