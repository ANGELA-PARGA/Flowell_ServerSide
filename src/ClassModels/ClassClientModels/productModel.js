const createError = require('http-errors');
const {selectAllProductInfoQuery, selectAllProducts, 
    selectProductBySearchParameters,
    selectAllCategories, selectAllProductsByCategory} = require('../../DBQueries/productQueries')
const { calculateTotal, updateQuery, calculateTotalItems } = require('../../DBQueries/generalQueries')
const CartItemsModel = require('./cartItemsModel')


module.exports = class ProductModel { 
    /**
     * Find a product information using the product ID: 
     * @param {number} id
     * @returns {Object}
     * @throws {Error}
     */
    static async retrieveProductInfo(id){
        try {
            const productInfo = await selectAllProductInfoQuery(id)
            return productInfo
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while retrieving product information' 
                    : 'ServerError: Unexpected error while retrieving product information'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while retrieving product information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productModel / retrieveProductInfo';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Returns a list of 30 products: 
     * @returns {Array}
     * @throws {Error}
     */
    static async returnProductsList(limit, offset, filters){
        try {
            const productsList = await selectAllProducts(limit, offset, filters)
            return productsList;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while retrieving the list of products' 
                    : 'ServerError: Unexpected error while retrieving the list of products'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while retrieving the list of products';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productModel / returnProductsList';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Returns a list of categories: 
     * @returns {Array}
     * @throws {Error}
     */
    static async returnCategories(){
        try {
            const categoriesList = await selectAllCategories();
            return categoriesList;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while retrieving the categories of products' 
                    : 'ServerError: Unexpected error while retrieving the categories of products'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while retrieving the categories of products';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productModel / returnCategories';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Returns all products from a category using a category ID: 
     * @param {number} id
     * @returns {Array}
     * @throws {Error}
     */
    static async returnProductsByCategory(id, limit, offset, filters){
        try {
            const categoryProducts = await selectAllProductsByCategory(id, limit, offset ,filters)
            return categoryProducts;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while retrieving the products by category' 
                    : 'ServerError: Unexpected error while retrieving the products by category'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while retrieving the products by category';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productModel / returnProductsByCategory';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Add a product to the cart using the object {cart_id, product_id, qty}: 
     * @param {number} product_id
     * @param {number} qty
     * @param {number} cart_id
     * @returns {Object}
     * @throws {Error}
     */
    static async addProductToCart(data){
        try {
            const { cart_id } = data
            const CartItemInstance = new CartItemsModel(data)
            const itemToAdd = await CartItemInstance.createCartItem()

            const newTotal = await calculateTotal(cart_id,'cart_id','cart_items');
            const newItemNumber = await calculateTotalItems(cart_id,'cart_id','cart_items');         
            const updatedCart = await updateQuery({id:cart_id, total:newTotal.total, total_items:newItemNumber}, 'id','carts')

            return {item:itemToAdd, cart:updatedCart};
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while adding products to the cart' 
                    : 'ServerError: Unexpected error while adding products to the cart'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while adding products to the cart';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productModel / addProductToCart';
            dbError.timestamp = new Date().toISOString();

            throw dbError;        
        }
    }

    /**
     * Find a product using a string as a search term: 
     * @param {string} searchTerm
     * @returns {Array}
     * @throws {Error}
     */
    static async findProductsBySearch(searchTerm, filters){
        try { 
            const searchResults = await selectProductBySearchParameters(searchTerm, filters);
            return searchResults
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding products using a search term' 
                    : 'ServerError: Unexpected error while finding products using a search term'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding products using a search term';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productModel / findProductsBySearch';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }
}