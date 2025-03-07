const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');

/**
 * Select all information of a product stored on the DB using a parameter (product id) 
 * It returns an object with nested objects if the query was succesfull, otherwise it returns an empty object
 * @param {number} parameter
 * @returns {Object} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectAllProductInfoQuery = async (parameter) => {
    console.log('calling select all product Info query with:', parameter)
    const sqlStatement = pgp.as.format(`SELECT products_categories.name AS "category_name", products.*
                                        FROM products 
                                        LEFT JOIN products_categories ON products.category_id = products_categories.id
                                        WHERE products.id = $1`, [parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('select all product Info results:', queryResult.rows[0])
    if(queryResult.rows?.length) return queryResult.rows[0];
    return []; 
}

/**
 * Select all information of a product stored on the DB using a parameter (product id) 
 * It returns an object with nested objects if the query was succesfull, otherwise it returns an empty object
 * @param {number} parameter
 * @returns {Object} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectAllProductInfoQueryWithStock = async (parameter) => {
    console.log('calling select all product Info query with:', parameter)
    const sqlStatement = pgp.as.format(`SELECT products_categories.name AS "category", products.*,
                                        product_stock.stock_available AS "stock", product_stock.qty_purchased AS "sold units"                                    
                                        FROM products 
                                        LEFT JOIN products_categories ON products.category_id = products_categories.id
                                        LEFT JOIN product_stock ON products.id = product_stock.product_id
                                        WHERE products.id = $1`, [parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('select all product Info results:', queryResult.rows[0])
    if(queryResult.rows?.length) return queryResult.rows[0];
    return []; 
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
const selectAllProducts = async (limit, offset, search) => {
    console.log('calling select all products:', limit, offset, search)

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
            queryParams.push(searchTerm, searchTerm);
            searchCondition = `
                AND (
                    products.name ILIKE $3
                    OR products.color ILIKE $4
                )
            `;
        }
    }

    const sqlStatement = pgp.as.format(
        `SELECT products_categories.name AS "category_name", products.*
        FROM products
        LEFT JOIN products_categories ON products.category_id = products_categories.id
        WHERE 1=1  -- Dummy condition to safely append the search filter
        ${searchCondition}
        ORDER BY products.id
        LIMIT $1 OFFSET $2`, 
        queryParams
    );

    console.log('Executing SQL SELECT ALL PRODUCTS:', sqlStatement);

    console.log('with query params:', queryParams)
    const queryResult = await db.query(sqlStatement);

    console.log('results on the DB:', queryResult.rows)

    if (queryResult.rows?.length) return queryResult.rows;
    return [];
};

const selectTotalProducts = async (search) => {
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
            queryParams.push(searchTerm, searchTerm);
            searchCondition = `
                AND (
                    products.name ILIKE $1
                    OR products.color ILIKE $2
                )
            `;
        }
    }

    const sqlStatement = pgp.as.format(
            `SELECT COUNT(*) FROM products
            LEFT JOIN products_categories ON products.category_id = products_categories.id
            WHERE 1=1  -- Dummy condition to safely append the search filter
            ${searchCondition}`,
            queryParams
    );

    console.log('Executing SQL SELECT TOTAL PRODUCTS:', sqlStatement);
    console.log('with query params:', queryParams)
    const queryResult = await db.query(sqlStatement);
    return parseInt(queryResult.rows[0].count, 10);
};



/**
 * Select all cartegories stored on the DB 
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectAllCategories = async () => {
    console.log('calling select all categories')
    const sqlStatement = `SELECT products_categories.*
                        FROM products_categories`;
    const queryResult = await db.query(sqlStatement);
    console.log('select all categories results:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows;
    return []; 
}

/**
 * Select all products by category stored on the DB using the category id (id), limit and offset for pagination
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @param {number} id
 * @param {number} limit
 * @param {number} offset
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 * */

const selectAllProductsByCategory = async (id, limit, offset, filters) => {
    console.log('calling select all products by category:', id, limit, offset, filters);
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
    const sqlStatement = pgp.as.format(
        `SELECT products_categories.name AS "category_name", products.*
        FROM products
        LEFT JOIN products_categories ON products.category_id = products_categories.id
        ${whereClause}
        ORDER BY products.id
        LIMIT $2 OFFSET $3`, 
        queryParams
    );

    console.log('Executing SQL SELECT ALL CATEGORY PRODUCTS:', sqlStatement);
    const queryResult = await db.query(sqlStatement);

    console.log('select all products by category, results on the DB:', queryResult.rows);

    if (queryResult.rows?.length) return queryResult.rows;
    return [];
};


/**
 * Select all products stored on the DB using a search term (string)
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @param {String} searchTerm
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectProductBySearchParameters = async (searchTerm, filters) => {
    const { color, category } = filters;
    console.log('calling select products by search parameter:', searchTerm, filters)
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

    const sqlStatement = `
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
    `;

    console.log('Executing SQL SELECT PRODUCTS BY SEARCH PARAMETERS:', sqlStatement);
    console.log('with query params:', queryParams);
    
    const queryResult = await db.query(sqlStatement, queryParams);
    console.log('select products by parameter result:', queryResult.rows);

    if (queryResult.rows?.length) return queryResult.rows;
    return [];
};

module.exports = {
    selectAllProductInfoQuery,
    selectAllProductInfoQueryWithStock,
    selectAllProducts,
    selectAllCategories,
    selectAllProductsByCategory,
    selectProductBySearchParameters,
    selectTotalProducts
}