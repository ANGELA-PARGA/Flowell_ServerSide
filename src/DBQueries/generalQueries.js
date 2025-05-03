// GeneralQueries.js This class provides a set of generic database query methods for inserting, updating,
//  selecting, and deleting records in a PostgreSQL database using the pg-promise library. 
// It also includes error handling for database operations. This class helps to abstract the database 
// operations and provides a reusable interface for different models or repositories in the application.
const createError = require('http-errors');

class GeneralQueries {
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
        dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : `GeneralQueries / ${context}`;
        dbError.timestamp = new Date().toISOString();

        return dbError;
    }

    /**
     * Insert new data on DB. It requires de data to insert (object) and the table name (string)
     * It returns an object with the new added information if the query was succesfull, otherwise it returns
     * an empty object 
     * @param {string} tableName
     * @param {Object} data
     * @returns {Object} query succesfull
     * @returns {{}} query unsuccesfull
     */
    async insert(data, tableName) {
        try {
            const sql = this.pgp.helpers.insert(data, null, tableName) + ' RETURNING *';
            const result = await this.db.query(sql);
            return result.rows?.[0] || {};
        } catch (error) {
            throw this.handleDbError(error, `insert into ${tableName}`);
        }
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
    async update(data, columnName, tableName) {
        try {
            const { id, ...params } = data;
            params.updated_at = new Date().toISOString();
            const condition = this.pgp.as.format(`WHERE ${columnName} = $1 RETURNING *`, [id]);
            const sql = this.pgp.helpers.update(params, null, tableName) + condition;
            const result = await this.db.query(sql);
            return result.rows?.[0] || {};
        } catch (error) {
            throw this.handleDbError(error, `update in ${tableName}`);
        }
    }

    /**
     * select and return the data on DB. It requires a columnValue (string), the columnName (string)
     * to supply the condition and the table name (string)
     * It returns an array of 1 or more objects with the information if the query was succesfull, otherwise it returns
     * an empty array 
     * @param {string} columnName
     * @param {string} tableName
     * @param {string} columnValue
     * @returns {Object} query succesfull
     * @returns {[]} query unsuccesfull
     */
    async selectBy(columnValue, columnName, tableName) {
        try {
            const sql = this.pgp.as.format(`SELECT * FROM ${tableName} WHERE ${columnName} = $1`, [columnValue]);
            const result = await this.db.query(sql);
            return result.rows || [];
        } catch (error) {
            throw this.handleDbError(error, `select from ${tableName}`);
        }
    }


    /**
     * delete the data on DB. It requires a columnValue (string), the columnName (string)
     * to supply the condition and the table name (string)
     * It returns a number > 0 if the query was succesfull (the number of deleted rows), otherwise it returns 0
     * @param {string} columnName
     * @param {string} tableName
     * @param {string} columnValue
     * @returns {number} rowCount
     */
    async deleteBy(columnValue, columnName, tableName) {
        try {
            const sql = this.pgp.as.format(`DELETE FROM ${tableName} WHERE ${columnName} = $1`, [columnValue]);
            const result = await this.db.query(sql);
            return result.rowCount;
        } catch (error) {
            throw this.handleDbError(error, `delete from ${tableName}`);
        }
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
    async deleteByDoubleCondition(data, tableName, cond1, cond2) {
        try {
            const { param1, param2 } = data;
            const sql = this.pgp.as.format(
                `DELETE FROM ${tableName} WHERE ${cond1} = $1 AND ${cond2} = $2`,
                [param1, param2]
            );
            const result = await this.db.query(sql);
            return result.rowCount;
        } catch (error) {
            throw this.handleDbError(error, `delete with double condition from ${tableName}`);
        }
    }

    /**
     * Calculate the total price of an order or a cart using the information stored on the DB.
     * It requires the parameter (usually an id to find the resource), the columnName (string) to supply the
     * condition, and the tableName (string)
     * It returns an object {total:value} if the query was succesfull (there was quantities to sum up), otherwise it returns 0
     * @param {number} parameter
     * @param {string} columnName
     * @param {string} tableName
     * @returns {object} successfull query {total:number}
     * @returns {0} unsuccessfull query
     */
    async calculateTotal(parameter, columnName, tableName) {
        try {
            const sql = this.pgp.as.format(`
                SELECT SUM(${tableName}.qty * products.price_per_case) AS "total"
                FROM ${tableName}
                INNER JOIN products ON ${tableName}.product_id = products.id
                WHERE ${tableName}.${columnName} = $1`, [parameter]);

            const result = await this.db.query(sql);
            return result.rows?.[0] || { total: 0 };
        } catch (error) {
            throw this.handleDbError(error, `calculateTotal in ${tableName}`);
        }
    }

    /**
     * Calculate the total number of items on a cart
     * It returns an object {total_items:value} if the query was succesfull 
     * (there was quantities to sum up), otherwise it returns 0
     * @param {number} parameter
     * @param {string} columnName
     * @param {string} tableName
     * @returns {object} successfull query {total:number}
     * @returns {0} unsuccessfull query
     */
    async calculateTotalItems(parameter, columnName, tableName) {
        try {
            const sql = this.pgp.as.format(`
                SELECT SUM(${tableName}.qty) AS "total_items"
                FROM ${tableName}
                WHERE ${tableName}.${columnName} = $1`, [parameter]);

            const result = await this.db.query(sql);
            return result.rows?.[0]?.total_items || 0;
        } catch (error) {
            throw this.handleDbError(error, `calculateTotalItems in ${tableName}`);
        }
    }
}

module.exports = GeneralQueries;

