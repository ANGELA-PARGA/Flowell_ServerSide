import createError from 'http-errors';

class ProductQueries {
    /**
     * ProductQueries class is responsible for executing queries related to products in the database.
     * It includes the following methods:
     * - selectAllInfo: Selects all information of a product using its ID.
     * - selectAllProducts: Selects all products with pagination and filtering options.
     * - selectTotalProducts: Selects the total number of products based on filters.
     * - selectAllCategories: Selects all product categories.
     * - selectByCategory: Selects products by category with pagination and filtering options.
     * - selectBySearch: Selects products based on a search term and filters.
     * - selectAllDashboard: Selects all products for the dashboard with pagination and search options.
     * - selectTotalDashboard: Selects the total number of products for the dashboard based on search options.
     * - selectInfoWithStock: Selects all information of a product with stock information using its ID.
     * - selectTopSelling: Selects the top-selling products.
     * It uses pg-promise to interact with the PostgreSQL database and also the object 'db' (dbConnection) to execute the queries.
     * @param {Object} db - The database connection object.
     * @param {Object} pgp - The pg-promise library instance.
     */
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
    }

    static handleDbError(error, context) {
        const dbError = createError(
            error.status || (error.code ? 400 : 500),
            error.code
                ? `DatabaseError: ${context}`
                : `ServerError: Unexpected error in ${context}`
        );

        dbError.name = error.code ? 'DatabaseError' : 'ServerError';
        dbError.message = error.message || `An unexpected error occurred during ${context}`;
        dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
        dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : `ProductQueries / ${context}`;
        dbError.timestamp = new Date().toISOString();

        return dbError;
    }

    /**
     * Select all information of a product stored on the DB using a parameter (product id) 
     * It returns an object if the query was succesfull, otherwise it returns an empty array
     * @param {number} parameter
     * @returns {Object} successfull query 
     * @returns {[]} unsuccessfull query
     */

    async selectAllInfo(parameter) {
        try {
            const sqlStatement = this.pgp.as.format(`SELECT products_categories.name AS "category_name", products.*
                FROM products 
                LEFT JOIN products_categories ON products.category_id = products_categories.id
                WHERE products.id = $1`, [parameter]);

            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows?.[0] || [];
            
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select product in selectAllInfo`);                   
        }

    }
    
    /**
     * Select all products stored on the DB using limit and offset to help pagination and filters to filter the results
     * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
     * @param {number} limit
     * @param {number} offset
     * @param {Object} filters
     * @returns {Array} successfull query
     * @returns {[]} unsuccessfull query
     * */
    async selectAllProducts(limit, offset, filters) {
        try {
            const { color, category } = filters
            let queryParams = [limit, offset];    
        
            let searchConditions = [];
        
            if (color) {
                const searchTerm = color.split(',').map(c => `%${c.trim()}%`);
                queryParams.push(searchTerm);
                searchConditions.push(`products.color ILIKE ANY($${queryParams.length})`);
            }
        
            if (category) {
                const searchTerm = category.split(',').map(c => `%${c.trim()}%`);
                queryParams.push(searchTerm);
                searchConditions.push(`products_categories.name ILIKE ANY($${queryParams.length})`);
            }
        
            const whereClause = searchConditions.length > 0 ? `AND (${searchConditions.join(" AND ")})` : '';
        
            const sqlStatement = this.pgp.as.format(`SELECT products_categories.name AS "category_name", products.*
                                                        FROM products
                                                        LEFT JOIN products_categories ON products.category_id = products_categories.id
                                                        WHERE 1=1 
                                                        ${whereClause}
                                                        ORDER BY products.id
                                                        LIMIT $1 OFFSET $2`, 
                                                        queryParams
                                                    );
        
            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows || [];

        } catch (error) {
            throw ProductQueries.handleDbError(error, `select all products in selectAllProducts`);                          
        }
    };
    
    /**
     * This method selects the total number of products stored in the database based on the provided 
     * filters (color, category, category id).
     * @param {Object} filters 
     * @returns 
     */
    async selectTotalProducts(filters) {
        try {
            const { color, category, categoryId } = filters
            let queryParams = [];
            let searchConditions = [];
        
            if (color) {
                const searchTerm = color.split(',').map(c => `%${c.trim()}%`);
                queryParams.push(searchTerm);
                searchConditions.push(`products.color ILIKE ANY($${queryParams.length})`);
            }
        
            if (category) {
                const searchTerm = category.split(',').map(c => `%${c.trim()}%`);
                queryParams.push(searchTerm);
                searchConditions.push(`products_categories.name ILIKE ANY($${queryParams.length})`);
            }
        
            if (categoryId) {
                queryParams.push(Number(categoryId));  // Safe casting to integer
                searchConditions.push(`products.category_id = $${queryParams.length}`); 
            }
        
            const whereClause = searchConditions.length > 0 ? `AND (${searchConditions.join(" AND ")})` : '';
        
            const sqlStatement = this.pgp.as.format(`SELECT COUNT(*) FROM products
                                                        LEFT JOIN products_categories ON products.category_id = products_categories.id
                                                        WHERE 1=1  
                                                        ${whereClause}`,
                                                        queryParams
                                                    );
                                        
            const queryResult = await this.db.query(sqlStatement);
            return parseInt(queryResult.rows?.[0].count || 0, 10);
            
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select total products in selectTotalProducts`);                                     
        }
    };
    
    /**
     * Select all cartegories stored on the DB 
     * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectAllCategories() {
        try {
            const sqlStatement = `SELECT products_categories.*
                                FROM products_categories`;
            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows || [];            
        } catch (error) {
            throw this.handleDbError(error, `select all categories in selectAllCategories`);                          
            
        }
    }
    
    /**
     * Select all products by category stored on the DB using the category id (id), limit and offset for pagination
     * and also filters (color)
     * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
     * @param {number} id
     * @param {number} limit
     * @param {number} offset
     * @param {Object} filters
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     * */
    
    async selectByCategory(id, limit, offset, filters) {
        try {
            const { color } = filters;
    
            let whereClauses = [`products.category_id = $1`];
            let queryParams = [id, limit, offset];
        
            // Add color filtering, if provided
            if (color) {
                const colorArray = color.split(',');
                whereClauses.push(
                    `products.color IN (${colorArray.map((_, i) => `$${queryParams.length + i + 1}`).join(', ')})`
                );
                queryParams.push(...colorArray);
            }
        
            const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        
            // Main query without a subquery, directly applying LIMIT and OFFSET
            const sqlStatement = this.pgp.as.format(
                `SELECT products_categories.name AS "category_name", products.*
                FROM products
                LEFT JOIN products_categories ON products.category_id = products_categories.id
                ${whereClause}
                ORDER BY products.id
                LIMIT $2 OFFSET $3`, 
                queryParams
            );
        
            const queryResult = await this.db.query(sqlStatement);
        
            return queryResult.rows || [];
            
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select all products by category in selectByCategory`);                                    
        }
    };
    
    
    /**
     * Select all products stored on the DB using a search term (string) and also an object with filters (color, category)
     * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
     * @param {String} searchTerm
     * @param {Object} filters
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectBySearch(searchTerm, filters) {
        try {
            const { color, category } = filters;
            let whereClauses = [];
            let queryParams = [];
        
            // Build WHERE clause for color filter
            if (color) {
                const colorArray = color.split(',');
                whereClauses.push(`products.color IN (${colorArray.map((_, i) => `$${queryParams.length + i + 1}`).join(', ')})`);
                queryParams.push(...colorArray);
            }
        
            // Build WHERE clause for category filter
            if (category) {
                const categoryArray = category.split(',');
                whereClauses.push(`products_categories.name IN (${categoryArray.map((_, i) => `$${queryParams.length + i + 1}`).join(', ')})`);
                queryParams.push(...categoryArray);
            }
        
            const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        
            // Using tsquery for flexible search
            const searchQuery = searchTerm.split(' ').map(term => `${term}:*`).join(' & ');
            queryParams.push(searchQuery);
            const searchIndex = queryParams.length; // Position of the search query in params
        
            const sqlStatement = this.pgp.as.format(`
                SELECT 
                    products.id, 
                    products.name, 
                    products.color, 
                    products.category_id,
                    products.price_per_case,
                    products.qty_per_case, 
                    products_categories.name AS category_name, 
                    products.images_urls
                FROM products
                LEFT JOIN products_categories ON products.category_id = products_categories.id
                ${whereClause ? `${whereClause} AND` : 'WHERE'}
                to_tsvector(products.name) @@ to_tsquery($${searchIndex})
                ORDER BY products.id
            `);
            
            const queryResult = await this.db.query(sqlStatement, queryParams);
        
            return queryResult.rows || [];
            
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select product by search parameters in selectBySearch`);                                              
        }
    };
    
    
    /*QUERIES FOR FLOWELL DASHBOARD----------------------------------*/
    
    /**
     * Select all products stored on the DB using limit and offset to help pagination and search to 
     * search products by id, name, color or category
     * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
     * @param {number} limit
     * @param {number} offset
     * @param {Object} search
     * @returns {Array} successfull query
     * @returns {[]} unsuccessfull query
     * */
    async selectAllDashboard(limit, offset, search) {
        try {
            let queryParams = [limit, offset];
    
            let searchCondition = '';
        
            if (search) {
                if (/^\d+$/.test(search)) {
                    // Search by numeric ID directly (no ILIKE needed)
                    queryParams.push(Number(search, search));  // Safe casting to integer
                    searchCondition = `
                        AND products.id = $3
                    `;
                } else {
                    // Search by status (text field)
                    const searchTerm = `%${search}%`;
                    queryParams.push(searchTerm, searchTerm, searchTerm);
                    searchCondition = `
                        AND (
                            products.name ILIKE $3
                            OR products.color ILIKE $4
                            OR products_categories.name ILIKE $5
                        )
                    `;
                }
            }
        
            const sqlStatement = this.pgp.as.format(
                `SELECT products_categories.name AS "category_name", products.*
                FROM products
                LEFT JOIN products_categories ON products.category_id = products_categories.id
                WHERE 1=1 
                ${searchCondition}
                ORDER BY products.id
                LIMIT $1 OFFSET $2`, 
                queryParams
            );
        
            const queryResult = await this.db.query(sqlStatement);
        
            return queryResult.rows || [];
                
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select all products in selectAllDashboard`);                                 
        }
    };
    
    async selectTotalDashboard(search) {
        try {
            let queryParams = [];
            let searchCondition = '';
        
            if (search) {
                if (/^\d+$/.test(search)) {
                    // Search by numeric ID directly (no ILIKE needed)
                    queryParams.push(Number(search));  // Safe casting to integer
                    searchCondition = `
                        AND products.id = $1
                    `;
                } else {
                    // Search by status (text field)
                    const searchTerm = `%${search}%`;
                    queryParams.push(searchTerm, searchTerm, searchTerm);
                    searchCondition = `
                        AND (
                            products.name ILIKE $1
                            OR products.color ILIKE $2
                            OR products_categories.name ILIKE $3
                        )
                    `;
                }
            }
        
            const sqlStatement = this.pgp.as.format(
                    `SELECT COUNT(*) FROM products
                    LEFT JOIN products_categories ON products.category_id = products_categories.id
                    WHERE 1=1  
                    ${searchCondition}`,
                    queryParams
            );
        
            const queryResult = await this.db.query(sqlStatement);
            return parseInt(queryResult.rows?.[0].count || 0, 10);
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select total products in selectTotalDashboard`);                                        
        }
    };
    
    /**
     * Select all information of a product stored on the DB using a parameter (product id) 
     * It returns an object with nested objects if the query was succesfull, otherwise it returns an empty object
     * @param {number} parameter
     * @returns {Object} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectInfoWithStock(parameter) {
        try {
            const sqlStatement = this.pgp.as.format(`SELECT products_categories.name AS "category", products.*,
                product_stock.stock_available AS "stock", product_stock.qty_purchased AS "sold units"                                    
                FROM products 
                LEFT JOIN products_categories ON products.category_id = products_categories.id
                LEFT JOIN product_stock ON products.id = product_stock.product_id
                WHERE products.id = $1`, [parameter]);

            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows?.[0] || {};
            
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select product in selectInfoWithStock`);            
        } 
    }
    
    
    async selectTopSelling() {
        try {
            const sqlStatement = this.pgp.as.format(`
                SELECT 
                    products.id AS product_id,
                    products.name AS product_name,
                    product_stock.qty_purchased,
                    products.price_per_case,
                    (product_stock.qty_purchased * products.price_per_case) AS total_revenue
                FROM product_stock
                JOIN products ON product_stock.product_id = products.id
                ORDER BY product_stock.qty_purchased DESC
                LIMIT 3;
            `);
        
            const queryResult = await this.db.query(sqlStatement);
        
            return queryResult.rows || [];
            
        } catch (error) {
            throw ProductQueries.handleDbError(error, `select top selling products in selectTopSelling`);                        
        }
    };
}

export default ProductQueries