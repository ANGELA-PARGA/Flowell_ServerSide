import createError from 'http-errors';
class CartQueries {
    /**
     * CartQueries class is responsible for executing queries related to the cart in the database.
     * It contains the following methods:
     * - selectCartInfo: Selects all cart information from the database based on a specific user ID.
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
        dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : `CartQueries / ${context}`;
        dbError.timestamp = new Date().toISOString();

        return dbError;
    }

    /**
     * Select all cart information stored on the DB using a parameter (cart id).
     * It returns an object with the cart information if the query was succesfull, otherwise it returns an empty array
     * @param {number} parameter
     * @returns {Object} successfull query 
     * @returns {{}} unsuccessfull query
     */
    async selectCartInfo(parameter){
        try {
            const sqlStatement = this.pgp.as.format(`SELECT 
                carts.id AS "id",
                carts.total AS "total",
                carts.total_items AS "total_items",
                json_agg(
                    json_build_object(
                        'product_id', cart_items.product_id,
                        'name', products.name,
                        'qty', cart_items.qty,
                        'price_per_case', products.price_per_case,
                        'images', products.images_urls
                    )
                    ORDER BY cart_items.product_id
                ) AS "items"
                FROM 
                    carts
                LEFT JOIN 
                    cart_items ON carts.id = cart_items.cart_id
                LEFT JOIN 
                    products ON cart_items.product_id = products.id
                WHERE 
                    carts.user_id = $1
                GROUP BY 
                    carts.id, carts.total`, [parameter]);
            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows?.[0] || {};
            
        } catch (error) {
            throw CartQueries.handleDbError(error, 'select all cart information in selectCartInfo');            
        }
    }
}


export default CartQueries