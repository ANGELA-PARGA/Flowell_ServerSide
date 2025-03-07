const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');

/**
 * DEPENDS ON parameter and columnName values (order_id or user_id)
 * Select all orden information stored on the DB using a parameter (order id or user_id) and the columnName
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
                                            orders.created_at,
                                            orders.updated_at, 
                                            orders.status, 
                                            orders.delivery_date,
                                            orders.total,
                                            json_build_object(
                                                'address', orders.address,
                                                'city', orders.city,
                                                'state', orders.state,
                                                'zip_code', orders.zip_code,
                                                'phone', orders.contact_phone
                                            ) AS "shipping_info",
                                            json_agg(
                                                json_build_object(
                                                    'order_id', ordered_items.order_id,
                                                    'product_id', ordered_items.product_id,
                                                    'name', products.name,
                                                    'qty', ordered_items.qty
                                                )
                                            ) AS "items"
                                        FROM orders
                                        LEFT JOIN ordered_items ON orders.id = ordered_items.order_id
                                        LEFT JOIN products ON ordered_items.product_id = products.id
                                        WHERE orders.${columnName} = $1
                                        GROUP BY orders.id`, [parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('select all order Info results:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows;
    return [];
}

/**
 * Select all orden information stored on the DB using a parameter (order id) and the columnName
 * to supply the condition. This query also includes the user information (name, email, etc)
 * It returns an array with an object if the query was successfull, otherwise it returns an empty array
 * @param {number} parameter
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectAllOrderInfoWithUserQuery = async (parameter, columnName) => {
    console.log('calling select all order Info query with user information:', parameter)
    const sqlStatement = pgp.as.format(`SELECT 
                                            orders.id, 
                                            orders.created_at,
                                            orders.updated_at, 
                                            orders.status, 
                                            orders.delivery_date, 
                                            orders.total,
                                            json_build_object(
                                                'address', orders.address,
                                                'city', orders.city,
                                                'state', orders.state,
                                                'zip_code', orders.zip_code,
                                                'phone', orders.contact_phone
                                            ) AS "shipping_info",
                                            json_build_object(
                                                'id', users.id,
                                                'first_name', users.first_name,
                                                'last_name', users.last_name,
                                                'email', users.email
                                            ) AS "customer",
                                            json_agg(
                                                json_build_object(
                                                    'created_at', ordered_items.created_at,
                                                    'updated_at', ordered_items.updated_at,
                                                    'order_id', ordered_items.order_id,
                                                    'product_id', ordered_items.product_id,
                                                    'name', products.name,
                                                    'qty', ordered_items.qty
                                                )
                                            ) AS "items"
                                        FROM orders
                                        LEFT JOIN ordered_items ON orders.id = ordered_items.order_id
                                        LEFT JOIN products ON ordered_items.product_id = products.id
                                        LEFT JOIN users ON orders.user_id = users.id
                                        WHERE orders.${columnName} = $1
                                        GROUP BY 
                                            orders.id,
                                            users.id
                                        `, [parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('select all order Info results:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows;
    return [];
}

/*This query uses: limit and offset to determine the pagination, 
and filters which is an object with status */
const selectAllOrdersQuery = async (limit, offset, search) => {
    console.log('calling select all orders:', limit, offset, search)

    let queryParams = [limit, offset];

    let searchCondition = '';
    if (search) {
        if (/^\d+$/.test(search)) {
            // Search by numeric ID directly (no ILIKE needed)
            queryParams.push(Number(search));  // Safe casting to integer
            searchCondition = `
                AND orders.id = $3
            `;
        } else {
            // Search by status (text field)
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm);
            searchCondition = `
                AND orders.status ILIKE $3
            `;
        }
    }

    const sqlStatement = pgp.as.format(
        `SELECT orders.*
        FROM orders
        WHERE 1=1  -- Dummy condition to safely append the search filter
        ${searchCondition}
        ORDER BY orders.id
        LIMIT $1 OFFSET $2`, 
        queryParams
    );

    console.log('Executing SQL SELECT ALL ORDERS:', sqlStatement);
    console.log('with query params:', queryParams)
    const queryResult = await db.query(sqlStatement);

    console.log('results on the DB:', queryResult.rows)

    if (queryResult.rows?.length) return queryResult.rows;
    return [];
};

const selectTotalOrdersQuery = async (search) => {
    let queryParams = [];

    let searchCondition = '';
    if (search) {
        if (/^\d+$/.test(search)) {
            // Search by numeric ID directly (no ILIKE needed)
            queryParams.push(Number(search));  // Safe casting to integer
            searchCondition = `
                AND orders.id = $1
            `;
        } else {
            // Search by status (text field)
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm);
            searchCondition = `
                AND orders.status ILIKE $1
            `;
        }
    }

    const sqlStatement = pgp.as.format(
            `SELECT COUNT(*) FROM orders
            WHERE 1=1  -- Dummy condition to safely append the search filter
            ${searchCondition}`,
            queryParams
    );

    console.log('Executing SQL SELECT TOTAL ORDERS:', sqlStatement);
    const queryResult = await db.query(sqlStatement);
    console.log('results on the DB:', queryResult.rows[0].count)
    return parseInt(queryResult.rows[0].count, 10);
};


module.exports = {
    selectAllOrderInfoQuery,
    selectAllOrderInfoWithUserQuery,
    selectAllOrdersQuery,
    selectTotalOrdersQuery
}