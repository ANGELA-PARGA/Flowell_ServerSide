const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');


/**
 * Select all information of a product stored on the DB using a parameter (product id) 
 * It returns an object with nested objects if the query was succesfull, otherwise it returns an empty object
 * @param {number} parameter
 * @returns {Object} successfull query 
 * @returns {{}} unsuccessfull query
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
 * Select all products(limit 30) stored on the DB 
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectAllProducts = async (limit, offset) => {
    console.log('calling select all products with:', limit, offset)
    const sqlStatement = pgp.as.format(
                        `SELECT products_categories.name AS "category_name", products.*
                        FROM products
                        LEFT JOIN products_categories ON products.category_id = products_categories.id 
                        ORDER BY products.id
                        LIMIT $1 OFFSET $2`, [limit, offset]);
    const queryResult = await db.query(sqlStatement);
    console.log('select all products results:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows;
    return []; 
}

const selectTotalProducts = async () => {
    console.log('calling select total products:')
    const sqlStatement = pgp.as.format(`SELECT COUNT(*) FROM products`);
    const queryResult = await db.query(sqlStatement);
    console.log('select all products count:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows[0].count;
    return 0; 
}


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
 * Select all products by category stored on the DB using the category id (id)
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @param {number} id
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectAllProductsByCategory= async (id) => {
    console.log('calling select all products by category:', id)
    const sqlStatement = pgp.as.format(`SELECT products_categories.name AS "category_name", products.*
                                        FROM products 
                                        LEFT JOIN products_categories ON products.category_id = products_categories.id
                                        WHERE products.category_id = $1`, [id]);
    const queryResult = await db.query(sqlStatement);
    console.log('select all products by category results:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows;
    return []; 
}

/**
 * Select all products stored on the DB using an object with filter parameters. 
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @param {Object} options
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectProductByParameters = async (options) => {
    console.log('calling select products by parameter', options)
    let sqlStatement = `SELECT * FROM products `;
    const parameters = [];
    const conditions = [];
    for (const key in options) {
        if (Object.hasOwnProperty.call(options, key)) {
                conditions.push(`${key} = $${parameters.length + 1}`);
                parameters.push(options[key]);
        }
        
    }

    if (conditions.length > 0) {
        sqlStatement += 'WHERE  ' + conditions.join(' AND ');
    }

    const queryResult = await db.query(sqlStatement, parameters);
    console.log('select products by parameter result:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows;
    return [];  
}

/**
 * Select all products stored on the DB using a search term (string)
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @param {String} searchTerm
 * @returns {Array} successfull query 
 * @returns {[]} unsuccessfull query
 */
const selectProductBySearchParameters = async (searchTerm) => {
    console.log('calling select products by search parameter', searchTerm)
    const sqlStatement = `SELECT * FROM products
                            WHERE name ILIKE $1
                            UNION
                            SELECT * FROM products
                            WHERE category_id IN (
                                SELECT id FROM products_categories
                                WHERE name ILIKE $2
                            )
                            AND name NOT ILIKE $1`;
    const queryResult = await db.query(sqlStatement, [`%${searchTerm}%`, `%${searchTerm}%`]);
    console.log('select products by parameter result:', queryResult.rows)
    if (queryResult.rows?.length) return queryResult.rows;
    return [];  
}



module.exports = {
    selectAllProductInfoQuery,
    selectAllProducts,
    selectAllCategories,
    selectAllProductsByCategory,
    selectProductByParameters,
    selectProductBySearchParameters,
    selectTotalProducts
}