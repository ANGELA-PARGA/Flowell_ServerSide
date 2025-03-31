const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');
const createError = require('http-errors');

/**
 * Select all user personal information stored on the DB using a parameter (id) of the user
 * It returns an object with nested objects if the query was succesfull, otherwise it returns an empty object
 * @param {number} parameter
 * @returns {object} successfull query 
 * @returns {{}} unsuccessfull query
 */
const selectAllUserInfoQuery = async (parameter) => {
        const sqlStatement = pgp.as.format(`SELECT 
                                            users.id,
                                            users.created_at,
                                            users.first_name,
                                            users.last_name,
                                            users.email,
                                            (
                                                SELECT 
                                                    json_agg(json_build_object(
                                                        'addressID', users_addresses.id,
                                                        'address', users_addresses.address,
                                                        'city', users_addresses.city,
                                                        'state', users_addresses.state,
                                                        'zip_code', users_addresses.zip_code
                                                    ))
                                                FROM 
                                                    users_addresses
                                                WHERE 
                                                    users_addresses.user_id = users.id
                                            ) AS "addresses",
                                            (
                                                SELECT 
                                                    json_agg(json_build_object(
                                                        'phoneID', users_phones.id,
                                                        'phone', users_phones.phone
                                                    ))
                                                FROM 
                                                    users_phones
                                                WHERE 
                                                    users_phones.user_id = users.id
                                            ) AS "phones"
                                            FROM 
                                                users
                                            WHERE 
                                                users.id = $1`, [parameter]);

        const queryResult = await db.query(sqlStatement);

        if(queryResult.rows?.length){
            return queryResult.rows[0];
        } else {
            const customError = createError(404, `User was not found with the provided ID`);
            customError.name = 'NotFound';
            customError.details = 'User was not found with the provided ID';
            customError.stack = 'UserQueries';
            customError.timestamp = new Date().toISOString();
            throw customError;
        }    
}


/**
 * Select all users stored on the DB using limit and offset to help pagination and search term for filtering
 * It returns an array with objects if the query was succesfull, otherwise it returns an empty array
 * @param {number} limit
 * @param {number} offset
 * @param {string } searchTerm
 * @returns {Array} successfull query
 * @returns {[]} unsuccessfull query
 * */

const selectAllUsersQuery = async (limit, offset, searchTerm) => {
    const search = searchTerm ? `%${searchTerm}%` : null;  // Convert to wildcard if search provided
    const queryParams = [limit, offset];

    let searchCondition = '';
    if (search) {
        queryParams.push(search, search, search);  // One for each column
        searchCondition = `
            AND (
                first_name ILIKE $3
                OR last_name ILIKE $4
                OR email ILIKE $5
            )
        `;
    }

    const sqlStatement = pgp.as.format(
        `SELECT 
            users.id, 
            users.first_name, 
            users.last_name, 
            users.email, 
            users.created_at
        FROM users
        WHERE 1=1  -- Dummy condition to safely append the search filter
        ${searchCondition}
        ORDER BY users.id
        LIMIT $1 OFFSET $2`, 
        queryParams
    );

    const queryResult = await db.query(sqlStatement);

    if (queryResult.rows?.length) return queryResult.rows;
    return [];
};


const selectTotalUsersQuery = async (searchTerm) => {
    const search = searchTerm ? `%${searchTerm}%` : null;
    const queryParams = [];
    let searchCondition = '';
    if (search) {
        queryParams.push(search, search, search);  // One for each column
        searchCondition = `
            AND (
                first_name ILIKE $1
                OR last_name ILIKE $2
                OR email ILIKE $3
            )
        `;
    }

    const sqlStatement = pgp.as.format(
            `SELECT COUNT(*) 
            FROM users
            WHERE 1=1  -- Dummy condition to safely append the search filter
            ${searchCondition}`,
            queryParams 
    );

    const queryResult = await db.query(sqlStatement);

    return parseInt(queryResult.rows[0].count, 10);
};


module.exports = {
    selectAllUserInfoQuery,
    selectAllUsersQuery,
    selectTotalUsersQuery
}