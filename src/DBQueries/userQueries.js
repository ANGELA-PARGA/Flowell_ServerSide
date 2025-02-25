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
    console.log('CALLING: selectAllUserInfoQuery', parameter)
        const sqlStatement = pgp.as.format(`SELECT 
                                            users.id,
                                            users.created,
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
        console.log('selectAllUserInfoQuery RESULT:', queryResult.rows)
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


module.exports = {
    selectAllUserInfoQuery
}