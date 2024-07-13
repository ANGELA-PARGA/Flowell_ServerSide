const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');


/**
 * Select all cart information stored on the DB using a parameter (cart id).
 * It returns an object with the cart information if the query was succesfull, otherwise it returns an empty array
 * @param {number} parameter
 * @returns {Object} successfull query 
 * @returns {{}} unsuccessfull query
 */
const selectAllCartInfoQuery = async (parameter) => {
    console.log('calling select all cart info query:', parameter)
    const sqlStatement = pgp.as.format(`SELECT 
                                        carts.id AS "id",
                                        carts.total AS "total",
                                        carts.total_items AS "total_items",
                                        json_agg(
                                            json_build_object(
                                                'product_id', cart_items.product_id,
                                                'name', products.name,
                                                'qty', cart_items.qty,
                                                'price_per_case', products.price_per_case
                                            )
                                            ORDER BY cart_items.product_id
                                        ) AS "items"
                                        FROM 
                                            carts
                                        LEFT JOIN 
                                            cart_items ON carts.id = cart_items.cart_id
                                        LEFT JOIN 
                                            products ON cart_items.product_id = products.id
                                        WHERE 
                                            carts.user_id = $1
                                        GROUP BY 
                                            carts.id, carts.total`, [parameter]);
    const queryResult = await db.query(sqlStatement);
    console.log('select all cart info results:', queryResult.rows[0])
    if(queryResult.rows?.length) return queryResult.rows[0];
    return {};
}

module.exports = {
    selectAllCartInfoQuery
}