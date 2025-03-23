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
                                            orders.status, 
                                            orders.tracking,
                                            orders.delivery_date,
                                            orders.total,
                                            json_build_object(
                                                'address', orders.address,
                                                'city', orders.city,
                                                'state', orders.state,
                                                'zip_code', orders.zip_code,
                                                'phone', orders.phone
                                            ) AS "shipping_info",
                                            json_agg(
                                                json_build_object(                    
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
                                            orders.tracking, 
                                            orders.delivery_date, 
                                            orders.total,
                                            json_build_object(
                                                'address', orders.address,
                                                'city', orders.city,
                                                'state', orders.state,
                                                'zip_code', orders.zip_code,
                                                'phone', orders.phone
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
                                                    'qty', ordered_items.qty,
                                                    'price', products.price_per_case
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

const selectAllOrdersDashboard = async () => {
    const sqlStatement = pgp.as.format(`
        WITH status_counts AS (
            SELECT status, COUNT(id) AS count
            FROM orders
            GROUP BY status
        )
        SELECT 
            (SELECT COUNT(id) FROM orders) AS total_orders,
            (SELECT COALESCE(SUM(total), 0) FROM orders) AS total_revenue, 
            json_agg(status_counts) AS status_summary
        FROM status_counts;
    `);

    console.log('Executing SQL SELECT ALL ORDERS FOR DASHBOARD:', sqlStatement);
    const queryResult = await db.query(sqlStatement);
    console.log('Results on the DB:', queryResult.rows);

    return queryResult.rows[0];
};

const selectOrdersByMonth = async () => {
    const sqlStatement = pgp.as.format(`
        SELECT 
            TO_CHAR(created_at, 'Month') AS month,  -- ✅ Get month name (e.g., 'January')
            EXTRACT(MONTH FROM created_at) AS month_number, -- ✅ Get month number (1-12)
            COUNT(*) AS total_orders
        FROM orders
        WHERE 
            status != 'CANCELLED'  -- ✅ Exclude cancelled orders
            AND EXTRACT(YEAR FROM created_at) = 2025  -- ✅ Only 2025 orders
        GROUP BY month, month_number
        ORDER BY month_number;
    `);

    console.log('Executing SQL SELECT ORDERS BY MONTH:', sqlStatement);
    const queryResult = await db.query(sqlStatement);
    console.log('Results on the DB:', queryResult.rows);

    return queryResult.rows;
};

const selectMonthWithMostOrders = async () => {
    const sqlStatement = pgp.as.format(`
        SELECT 
            TO_CHAR(created_at, 'Month') AS month,  -- ✅ Get month name (e.g., 'January')
            EXTRACT(MONTH FROM created_at) AS month_number, -- ✅ Get month number (1-12)
            COUNT(*) AS total_orders
        FROM orders
        WHERE 
            status != 'CANCELLED'  -- ✅ Exclude cancelled orders
            AND EXTRACT(YEAR FROM created_at) = 2025  -- ✅ Only 2025 orders
        GROUP BY month, month_number
        ORDER BY total_orders DESC  -- ✅ Sort by highest orders first
        LIMIT 1;  -- ✅ Only return the top month
    `);

    console.log('Executing SQL SELECT MONTH WITH MOST ORDERS:', sqlStatement);
    const queryResult = await db.query(sqlStatement);
    console.log('Results on the DB:', queryResult.rows);

    return queryResult.rows[0] || {};  // ✅ Return only the highest month or an empty object
};

module.exports = {
    selectAllOrderInfoQuery,
    selectAllOrderInfoWithUserQuery,
    selectAllOrdersQuery,
    selectTotalOrdersQuery,
    selectAllOrdersDashboard,
    selectOrdersByMonth,
    selectMonthWithMostOrders
}