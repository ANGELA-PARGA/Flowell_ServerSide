const pgp = require('pg-promise')({ capSQL: true });
const db = require('../DB/connectionDB');

/**
 * Select all user personal information stored on the DB using a parameter (id) of the user
 * It returns an object with nested objects if the query was succesfull, otherwise it returns an empty object
 * @param {number} parameter
 * @returns {object} successfull query 
 * @returns {{}} unsuccessfull query
 */
const selectAllUserInfoQuery = async (parameter) => {
    console.log('calling select all user info query:', parameter)
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
                                        ) AS "phones",
                                        (
                                            SELECT 
                                                json_agg(json_build_object(
                                                    'creditcardID', users_credit_cards.id,
                                                    'credit_card', users_credit_cards.credit_card,
                                                    'holder', users_credit_cards.holder,
                                                    'expiration_date', users_credit_cards.expiration_date
                                                ))
                                            FROM 
                                                users_credit_cards
                                            WHERE 
                                                users_credit_cards.user_id = users.id
                                        ) AS "credit_cards"
                                    FROM 
                                        users
                                    WHERE 
                                        users.id = $1`, [parameter]);

    const queryResult = await db.query(sqlStatement);
    console.log('select all user info result:', queryResult.rows)
    if(queryResult.rows?.length) return queryResult.rows[0];
    return {}; 
}


module.exports = {
    selectAllUserInfoQuery
}