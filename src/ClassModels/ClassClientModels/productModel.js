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
            throw createError(500, 'error on server while retrieving product information by ID', error.stack, error);        
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
            throw createError(500, 'error on server while retrieving all products', error.stack, error);        
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
            throw createError(500, 'error on server while retrieving all categories', error.stack, error);        
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
            throw createError(500,'error on server while retrieving all products from a category', error.stack, error);        
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
            throw createError(500, 'error adding product to the cart', error.stack, error);        
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
            throw createError(500, `error on server finding products by search term`, error.stack, error);
        }
    }
}