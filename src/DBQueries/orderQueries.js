import createError from 'http-errors';

class OrderQueries {
    /**
     * OrderQueries class is responsible for executing queries related to orders in the database.
     * It contains the following methods:
     * - selectOrderById: Selects order information based on order ID or user ID.
     * - selectOrderAndUserInfo: Selects order information along with user information based on order ID or user ID.
     * - selectAllOrders: Selects all orders with pagination and optional search filter.
     * - selectTotalOrders: Selects the total number of orders with an optional search filter.
     * - selectAllOrdersDashboard: Selects all orders with status and revenue information.
     * - selectOrdersByMonth: Selects orders grouped by month and year, excluding cancelled orders.
     * - selectMonthWithMostOrders: Selects the month with the most orders, excluding cancelled orders.
     * It uses pg-promise to interact with the PostgreSQL database and also the object 'db' (dbConnection) to execute the queries.
     * @param {Object} db - The database connection object.
     * @param {Object} pgp - The pg-promise library instance.
     */
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

    handleDbError(error, context) {
        const dbError = createError(
            error.status || (error.code ? 400 : 500),
            error.code
                ? `DatabaseError: ${context}`
                : `ServerError: Unexpected error in ${context}`
        );

        dbError.name = error.code ? 'DatabaseError' : 'ServerError';
        dbError.message = error.message || `An unexpected error occurred during ${context}`;
        dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
        dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : `OrderQueries / ${context}`;
        dbError.timestamp = new Date().toISOString();

        return dbError;
    }

    /**
     * DEPENDS ON parameter and columnName values (order_id or user_id)
     * Select all orden information stored on the DB using a parameter (order id or user_id) and the columnName
     * to supply the condition.
     * It returns an array with an object if the query was successfull, otherwise it returns an empty array
     * @param {number} parameter
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectOrderById(parameter, columnName) {
        try {
            const sql = this.pgp.as.format(`SELECT 
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
            const result = await this.db.query(sql);
            return result.rows || [];
        } catch (error) {
            throw OrderQueries.handleDbError(error, `select order information in selectOrderById from orders table`);
        }
    }

    /**
     * Select all orden information stored on the DB using a parameter (order id) and the columnName
     * to supply the condition. This query also includes the user information (name, email, etc)
     * It returns an array with an object if the query was successfull, otherwise it returns an empty array
     * @param {number} parameter
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectOrderAndUserInfo(parameter, columnName) {
        try {
            const sql = this.pgp.as.format(`SELECT 
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
                                            users.id`, [parameter]);
            const result = await this.db.query(sql);
            return result.rows || [];
        } catch (error) {
            throw OrderQueries.handleDbError(error, `select order and user information in selectOrderAndUserInfo from orders table`);
        }
    }

    /**
     * Select all orders stored on the DB using limit and offset to determine the pagination,
     * and with a search filter which can be a string (status) or a number (id).
     * It returns an array with an object if the query was successfull, otherwise it returns an empty array
     * @param {number} LIMIT
     * @param {number} OFFSET
     * @param {string} search // optional, can be a number or a string (status)
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectAllOrders(limit, offset, search) {
        try {
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
            const sql = this.pgp.as.format(`SELECT orders.*
                                            FROM orders
                                            WHERE 1=1  -- Dummy condition to safely append the search filter
                                            ${searchCondition}
                                            ORDER BY orders.id
                                            LIMIT $1 OFFSET $2`, 
                                            queryParams
                                        );
            const result = await this.db.query(sql);
            return result.rows || [];
        } catch (error) {
            throw OrderQueries.handleDbError(error, `select all orders in selectAllOrders from orders table`);
        }
    }

    /**
     * Select the total number of orders stored on the DB using a search filter which can be a string (status) or a number (id).
     * It returns an array with an object if the query was successfull, otherwise it returns an empty array
     * @param {string} search // optional, can be a number or a string (status)
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectTotalOrders(search) {
        try {
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
            const sql = this.pgp.as.format(
                `SELECT COUNT(*) FROM orders
                WHERE 1=1  -- Dummy condition to safely append the search filter
                ${searchCondition}`,
                queryParams
            );
    
            const result = await this.db.query(sql);
            return parseInt(result.rows?.[0]?.count || 0, 10);       
        } catch (error) {
            throw OrderQueries.handleDbError(error, `select the total number of orders in selectTotalOrders from orders table`);            
        }
    }

    /**
     * 
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectAllOrdersDashboard() {
        try {
            const sqlStatement = this.pgp.as.format(`
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
        
            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows?.[0];            
        } catch (error) {
            throw OrderQueries.handleDbError(error, `select all orders with status and the revenue in selectAllOrdersDashboard from orders table`);    
        }
    }

    /**
     * This query selects the month and year from the orders table, excluding cancelled orders.
     * It groups the results by month and year, and orders them in ascending order of month.
     * It returns the month name, month number, and total orders for each month in 2025.
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectOrdersByMonth() {
        try {
            const sqlStatement = this.pgp.as.format(`
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
        
            const queryResult = await this.db.query(sqlStatement);
        
            return queryResult.rows || [];            
        } catch (error) {
            throw OrderQueries.handleDbError(error, `select orders by month in selectOrdersByMonth from orders table`);            
        }
    }

    /**
     * This query selects the month with the most orders from the orders table, excluding cancelled orders.
     * It groups the results by month and orders them in descending order of total orders.
     * It returns the month name, month number, and total orders for the month with the most orders.
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectMonthWithMostOrders() {
        try {
            const sqlStatement = this.pgp.as.format(`
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
        
            const queryResult = await this.db.query(sqlStatement);
        
            return queryResult.rows?.[0] || {};  // ✅ Return only the highest month or an empty object          
        } catch (error) {
            throw OrderQueries.handleDbError(error, `select month with most orders excluding cancelled orders in selectMonthWithMostOrders from orders table`);                   
        }
    }

}

export default OrderQueries;

