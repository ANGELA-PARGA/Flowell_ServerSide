const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');
const moment = require('moment');

/**
 * Update items of an order stored on the DB using a data object { order_id, product_id, qty } 
 * It returns an object with the updated information if the query was succesfull, otherwise it returns an empty object
 * @param {Object} data { order_id, product_id, qty }
 * @returns {Object} successfull query 
 * @returns {{}} unsuccessfull query
 */
const updateOrderedItemsQuery = async (data) => {
    const { order_id, product_id, qty } = data;
    const updated_at = moment.utc().toISOString();
    
    const condition = pgp.as.format(`WHERE order_id = $1 AND product_id = $2 RETURNING *`, [order_id, product_id]);
    const sqlStatement = pgp.helpers.update({qty: qty, updated_at:updated_at}, null, 'ordered_items') + condition;

    
    const queryResult = await db.query(sqlStatement);
    if(queryResult.rows?.length) return queryResult.rows[0];
    return {};

}

/**
 * Update items of an order stored on the DB using a data object { order_id } and
 * set the qty of all items to 0
 * It returns an object with the updated information if the query was succesfull, otherwise it returns an empty object
 * @param {Object} data { order_id }
 * @returns {Object} successfull query 
 * @returns {{}} unsuccessfull query
 */
const cancelOrderedItemsQuery = async (data) => {
    const { order_id } = data;
    const updated_at = moment.utc().toISOString();
    
    const condition = pgp.as.format(`WHERE order_id = $1 RETURNING *`, [order_id]);
    const sqlStatement = pgp.helpers.update({qty: 0, updated_at:updated_at}, null, 'ordered_items') + condition;

    
    const queryResult = await db.query(sqlStatement);
    if(queryResult.rows?.length) return queryResult.rows;
    return {};

}

module.exports = {
    updateOrderedItemsQuery,
    cancelOrderedItemsQuery
}
