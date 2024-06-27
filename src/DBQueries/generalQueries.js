const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');
const moment = require('moment');


/**
 * Insert new data on DB. It requires de data to insert (object) and the table name (string)
 * It returns an object with the new added information if the query was succesfull, otherwise it returns
 * an empty object 
 * @param {string} tableName
 * @param {Object} data
 * @returns {Object} query succesfull
 * @returns {{}} query unsuccesfull
 */
const insertQuery = async (data, tableName) => {
    console.log('calling the general insert query with:', data, tableName)
    const sqlStatement = pgp.helpers.insert(data, null, tableName) + 'RETURNING *';
    const queryResult = await db.query(sqlStatement);

    console.log('resource created in insert query:', queryResult.rows[0])
    if(queryResult.rows?.length) return queryResult.rows[0];
    return {};
}

/**
 * updated the data on DB. It requires the data to update (object), the columnName (string)
 * to supply the condition and the table name (string)
 * It returns an object with the updated information if the query was succesfull, otherwise it returns
 * an empty object 
 * @param {string} columnName
 * @param {string} tableName
 * @param {Object} data
 * @returns {Object} query succesfull
 * @returns {{}} query unsuccesfull
 */
const updateQuery = async (data, columnName, tableName) => {
    console.log('calling the general update query with:', data, columnName, tableName)
    const { id, ...params } = data;
    params.modified = moment.utc().toISOString();

    const condition = pgp.as.format(`WHERE ${columnName} = $1 RETURNING *`, [id]);
    const sqlStatement = pgp.helpers.update(params, null, tableName) + condition;

    const queryResult = await db.query(sqlStatement);
    console.log('resource updated in update query:', queryResult.rows[0])
    if(queryResult.rows?.length) return queryResult.rows[0];
    return {};
}

/**
 * select and return the data on DB. It requires a parameter (string), the columnName (string)
 * to supply the condition and the table name (string)
 * It returns an array of 1 or more objects with the information if the query was succesfull, otherwise it returns
 * an empty array 
 * @param {string} columnName
 * @param {string} tableName
 * @param {string} parameter
 * @returns {Object} query succesfull
 * @returns {[]} query unsuccesfull
 */
const standardSelectQuery = async (parameter, tableName, columnName) => {
    console.log('calling the standart select query with:', parameter, tableName, columnName)
    const sqlStatement = pgp.as.format(`SELECT ${tableName}.* FROM ${tableName}
                                        WHERE ${tableName}.${columnName} = $1`,[parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('standard select query result', queryResult.rows)

    if(queryResult.rows?.length) return queryResult.rows;
    return [];
}

/**
 * delete the data on DB. It requires a parameter (string), the columnName (string)
 * to supply the condition and the table name (string)
 * It returns a number > 0 if the query was succesfull (the number of deleted rows), otherwise it returns 0
 * @param {string} columnName
 * @param {string} tableName
 * @param {string} parameter
 * @returns {number} rowCount
 */
const standardDeleteQuery = async (parameter, tableName, columnName) => {
    console.log('calling the standart delete query with:', parameter)   
    const sqlStatement = pgp.as.format(`DELETE FROM ${tableName} WHERE ${columnName} = $1`, [parameter] );
    const queryResult = await db.query(sqlStatement);
    console.log('standard delete query result', queryResult.rowCount)
    return queryResult.rowCount;
}


/**
 * delete the data on DB using double condition. It requires the data with 2 
 * parameters to identify the resource to delete (object), the table name (string) and the column names
 * to supply the condition (cond1, cond2)
 * It returns a number > 0 if the query was succesfull (the number of deleted rows), otherwise it returns 0
 * @param {string} tableName
 * @param {string} cond1
 * @param {string} cond2
 * @param {object} data {param1, param2}
 * @returns {number} rowCount
 */
const deleteDoubleConditionQuery = async (data, tableName, cond1, cond2) => {
    console.log('calling the delect double cond query with:', data, tableName, cond1, cond2) 
    const { param1, param2 } = data
    const sqlStatement = pgp.as.format(`DELETE FROM ${tableName} WHERE ${cond1} = $1 AND ${cond2} = $2`, [param1, param2]);
    const queryResult = await db.query(sqlStatement);
    console.log('double delete query result', queryResult.rowCount)
    return queryResult.rowCount;
}


/**
 * Calculate the total price of an order or a cart using the information stored on the DB.
 * It requires the parameter(usually an id to find the resource), the columnName (string) to supply the
 * condition, and the tableName (string)
 * It returns an object {total:value} if the query was succesfull (there was quantities to sum up), otherwise it returns 0
 * @param {number} parameter
 * @param {string} columnName
 * @param {string} tableName
 * @returns {object} successfull query {total:number}
 * @returns {0} unsuccessfull query
 */
const calculateTotal = async (parameter, columnName, tableName) => {
    console.log('calling calculate total price with:', parameter)
    const sqlStatement = pgp.as.format(`SELECT SUM(${tableName}.qty * products.price_per_case) AS "total"
                                            FROM ${tableName}
                                            INNER JOIN products ON ${tableName}.product_id = products.id
                                            WHERE ${tableName}.${columnName} = $1`,[parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('calculate total result', queryResult.rows)
    if (queryResult.rows?.length) return queryResult.rows[0];
    return 0; 
}


/**
 * Calculate the total number of items on a cart
 * It returns an object {total_items:value} if the query was succesfull (there was quantities to sum up), otherwise it returns 0
 * @param {number} parameter
 * @param {string} columnName
 * @param {string} tableName
 * @returns {object} successfull query {total:number}
 * @returns {0} unsuccessfull query
 */
const calculateTotalItems = async (parameter, columnName, tableName) => {
    console.log('calling calculate total items with:', parameter)
    const sqlStatement = pgp.as.format(`SELECT SUM(${tableName}.qty) AS "total_items"
                                        FROM ${tableName}
                                        WHERE ${tableName}.${columnName} = $1`, [parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('calculate total items result', queryResult.rows)
    if (queryResult.rows?.length) return queryResult.rows[0].total_items;
    return 0; 
}

module.exports = {
    insertQuery,
    updateQuery,
    standardSelectQuery,
    standardDeleteQuery,
    deleteDoubleConditionQuery,
    calculateTotal,
    calculateTotalItems
}
