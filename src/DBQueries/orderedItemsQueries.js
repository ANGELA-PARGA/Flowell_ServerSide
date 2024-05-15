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
    console.log('calling update ordered items query with:', data)
    const { order_id, product_id, qty } = data;
    const modified = moment.utc().toISOString();
    
    const condition = pgp.as.format(`WHERE order_id = $1 AND product_id = $2 RETURNING *`, [order_id, product_id]);
    const sqlStatement = pgp.helpers.update({qty: qty, modified:modified}, null, 'ordered_items') + condition;

    
    const queryResult = await db.query(sqlStatement);
    console.log('updated ordered items results:', queryResult.rows[0])
    if(queryResult.rows?.length) return queryResult.rows[0];
    return {};

}

module.exports = {
    updateOrderedItemsQuery
}
