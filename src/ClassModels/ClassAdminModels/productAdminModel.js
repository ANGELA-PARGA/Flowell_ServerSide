const createError = require('http-errors');
const { selectAllProductInfoQueryWithStock, selectAllProducts, 
        selectProductBySearchParameters,
        selectAllCategories, selectAllProductsByCategory} = require('../../DBQueries/productQueries')
const { updateQuery } = require('../../DBQueries/generalQueries')
const moment = require('moment');

module.exports = class ProductAdminModel {
    constructor(data) {
        this.created_at = moment.utc().toISOString();
        this.updated_at = moment.utc().toISOString();
        this.category_id = data.category_id;
        this.name = data.name;
        this.description = data.description;
        this.color = data.color;
        this.stem_length_cm = data.stem_length_cm;
        this.bloom_size_cm = data.bloom_size_cm;
        this.blooms_per_stem = data.blooms_per_stem;
        this.life_in_days = data.life_in_days;
        this.qty_per_case = data.qty_per_case;
        this.measure_per_case = data.measure_per_case;
        this.price_per_case = data.price_per_case;
        this.images_urls = data.images_urls;
        this.stock_available = data.stock_available;
        this.qty_purchased = data.qty_purchased;
    }

    /**
     * Create a new product using data object with the following properties: 
     * @param {number} category_id
     * @param {string} name
     * @param {string} description
     * @param {string} color
     * @param {number} stem_length_cm
     * @param {number} bloom_size_cm
     * @param {number} blooms_per_stem
     * @param {number} life_in_days
     * @param {number} qty_per_case
     * @param {string} measure_per_case
     * @param {number} price_per_case
     * @param {Array} images_urls
     * @param {number} stock_available
     * @param {number} qty_purchased
     * @returns {Object}
     * @throws {Error}
     */
    static async createNewProduct(){
        try {
            const { stock_available, qty_purchased, ...parameters } = this
            const newProduct = await insertQuery(parameters, 'products')   
            const product_id = newProduct.id
            await insertQuery({product_id, stock_available, qty_purchased}, 'product_stock')
            return newProduct;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while creating a new product' 
                    : 'ServerError: Unexpected error while creating a new product'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while creating a new product';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / createNewProduct';
            dbError.timestamp = new Date().toISOString();

            throw dbError;        
        }
    } 

    /**
     * Add or remove stock to the product's inventory using the product ID and a new quantity:
     * @param {number} product_id 
     * @param {number} new_qty 
     * @returns {Object}
     * @throws {Error}
     */
    static async updateStock(data){
        try {
            const { product_id, new_qty } = data  
            const newStock = await updateQuery({id: product_id, stock_available: new_qty}, 'product_id', 'product_stock')          
            return newStock;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while adding/removing stock to the product inventory' 
                    : 'ServerError: Unexpected error while adding stock to the product inventory'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while adding/removing stock to the product inventory';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / addStock';
            dbError.timestamp = new Date().toISOString();

            throw dbError;        
        }
    } 

    /**
     * Find a all product information using the product ID: 
     * @param {number} id
     * @returns {Object}
     * @throws {Error}
     */
    static async retrieveProductInfo(id){
        try {
            const productInfo = await selectAllProductInfoQueryWithStock(id)
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / retrieveProductInfo';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    /**
     * Returns a list of products: 
     * @returns {Array}
     * @throws {Error}
     */
    static async returnProductsList(limit, offset, search){
        try {
            const productsList = await selectAllProducts(limit, offset, search)
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / returnProductsList';
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / returnCategories';
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / returnProductsByCategory';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }

    
    /**
     * Finds products based on a search term and optional filters.
     *
     * @param {string} searchTerm - The term to search for in product data.
     * @param {Object} filters - Optional filters to apply to the search.
     * @returns {Promise<Array>} - A promise that resolves to an array of search results.
     * @throws {Error} - Throws an error if there is an issue with the database or an unexpected error occurs.
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