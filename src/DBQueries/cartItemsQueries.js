const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');
const moment = require('moment');

/**
 * Update items of a cart stored on the DB using a data object { cart_id, product_id, qty } 
 * It returns an object with the updated information if the query was succesfull, otherwise it returns an empty object
 * @param {Object} data { cart_id, product_id, qty }
 * @returns {Object} successfull query 
 * @returns {{}} unsuccessfull query
 */
const updateCartItemsQuery = async (data) => {
    const { cart_id, product_id, qty } = data;
    const updated_at = moment.utc().toISOString();

    const condition = pgp.as.format('WHERE cart_id = $1 AND product_id = $2 RETURNING *', [cart_id, product_id]);
    const sqlStatement = pgp.helpers.update({qty:qty, updated_at:updated_at}, null, 'cart_items') + condition;

    const queryResult = await db.query(sqlStatement);
    if(queryResult.rows?.length) return queryResult.rows[0];
    return {};

}

/**
 * Select all cart information stored on the DB using a parameter (cart id).
 * It returns an array with an object if the query was successfull, otherwise it returns an empty array
 * @param {number} parameter
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectCartItemsQuery = async (parameter) => {
    const sqlStatement = pgp.as.format(`SELECT cart_items.product_id, cart_items.qty,
                                        products.price_per_case AS price, 
                                        products.name 
                                        FROM cart_items
                                        JOIN products 
                                            ON cart_items.product_id = products.id
                                        WHERE cart_items.cart_id = $1`,[parameter]);

    const queryResult = await db.query(sqlStatement);
    if(queryResult.rows?.length) return queryResult.rows;
    return []; 

}

module.exports = {
    updateCartItemsQuery,
    selectCartItemsQuery
}
