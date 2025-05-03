class CartItemsQueries {
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
        dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : `CartItemsQueries / ${context}`;
        dbError.timestamp = new Date().toISOString();

        return dbError;
    }

    /**
     * Update items of a cart stored on the DB using a data object { cart_id, product_id, qty } 
     * It returns an object with the updated information if the query was succesfull, otherwise it returns an empty object
     * @param {Object} data { cart_id, product_id, qty }
     * @returns {Object} successfull query 
     * @returns {{}} unsuccessfull query
     */
    async updateCartItems(data){
        try {
            const { cart_id, product_id, qty } = data;
            const updated_at = new Date().toISOString();

            const condition = this.pgp.as.format('WHERE cart_id = $1 AND product_id = $2 RETURNING *', [cart_id, product_id]);
            const sqlStatement = this.pgp.helpers.update({qty:qty, updated_at:updated_at}, null, 'cart_items') + condition;

            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows?.[0] || {};            
        } catch (error) {
            throw this.handleDbError(error, 'update cart items in updateCartItems');            
        }

    }

    /**
     * Select all cart information stored on the DB using a parameter (cart id).
     * It returns an array with an object if the query was successfull, otherwise it returns an empty array
     * @param {number} parameter
     * @returns {Array} successfull query 
     * @returns {[]} unsuccessfull query
     */
    async selectCartItems(parameter){
        try {
            const sqlStatement = this.pgp.as.format(`SELECT cart_items.product_id, cart_items.qty,
                products.price_per_case AS price, 
                products.name 
                FROM cart_items
                JOIN products 
                    ON cart_items.product_id = products.id
                WHERE cart_items.cart_id = $1`,[parameter]);

            const queryResult = await this.db.query(sqlStatement);
            return queryResult.rows || []; 
            
        } catch (error) {
            throw this.handleDbError(error, 'select all cart items in selectCartItems');                        
        }
    }
}

module.exports = CartItemsQueries
