const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');


/**
 * Select all orden information stored on the DB using a parameter (order id) and the columnName
 * to supply the condition.
 * It returns an array with an object if the query was successfull, otherwise it returns an empty array
 * @param {number} parameter
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectAllOrderInfoQuery = async (parameter, columnName) => {
    console.log('calling select all order Info query with:', parameter)
    const sqlStatement = pgp.as.format(`SELECT 
                                            orders.id, 
                                            orders.created, 
                                            orders.status, 
                                            orders.delivery_date,
                                            orders.total,
                                            orders.shipping_address_id,
                                            orders.contact_info_id,
                                            json_agg(
                                                json_build_object(
                                                    'order_id', ordered_items.order_id,
                                                    'product_id', ordered_items.product_id,
                                                    'name', products.name,
                                                    'qty', ordered_items.qty
                                                )
                                            ) AS "items",
                                            json_build_object(
                                                'address', MAX(users_addresses.address),
                                                'city', MAX(users_addresses.city),
                                                'state', MAX(users_addresses.state),
                                                'zip_code', MAX(users_addresses.zip_code),
                                                'phone', MAX(users_phones.phone)
                                            ) AS "shipping_info"
                                        FROM orders
                                        LEFT JOIN ordered_items ON orders.id = ordered_items.order_id
                                        LEFT JOIN users_addresses ON orders.shipping_address_id = users_addresses.id
                                        LEFT JOIN users_phones ON orders.contact_info_id = users_phones.id
                                        LEFT JOIN products ON ordered_items.product_id = products.id
                                        WHERE orders.${columnName} = $1
                                        GROUP BY orders.id`, [parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('select all order Info results:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows;
    return [];
}


module.exports = {
    selectAllOrderInfoQuery
}