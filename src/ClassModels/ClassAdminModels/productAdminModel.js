const createError = require('http-errors');
const { selectAllProductInfoQueryWithStock, 
        selectProductBySearchParameters,  selectAllCategories, 
        selectAllProductsByCategory, selectTopSellingProducts,
        selectAllProductsDashboard} = require('../../DBQueries/productQueries')
const { updateQuery, insertQuery } = require('../../DBQueries/generalQueries');

module.exports = class ProductAdminModel {
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
     * @param {number} stock_available
     * @param {Array} images_url
     * @returns {Object}
     * @throws {Error}
     */
    static async createNewProduct(data){
        try {
            const { stock_available, ...parameters } = data
            
            /*insert the product information but not yet the images and stock*/
            const newProduct = await insertQuery(parameters, 'products')   
            const product_id = newProduct.id

            /*insert the stock quantity and upload the images and set the urls to the DB*/
            await insertQuery({product_id, stock_available, qty_purchased:0, created_at:newProduct.created_at}, 'product_stock')
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
     * Update the product details, using an object with the information to be changed and the id:
     * @param {number} id 
     * @param {Object} multiple_product_details (color, category_id, among other optional details) 
     * @returns {Object}
     * @throws {Error}
     */
    static async updateProductDetails(data){
        try { 
            const updatedProduct = await updateQuery(data, 'id', 'products')          
            return updatedProduct;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while updating product details' 
                    : 'ServerError: Unexpected error while updating product details'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while updating product details';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / updateProductDetails';
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
     * Returns a list of products for the E-commerce platform: 
     * @returns {Array}
     * @throws {Error}
     */
    static async returnProductsList(limit, offset, search){
        try {
            const productsList = await selectAllProductsDashboard(limit, offset, search)
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
     * Returns most sold products with revenew: 
     * @returns {Array}
     * @throws {Error}
     */
        static async returnMostSold(){
            try {
                const mostSold = await selectTopSellingProducts()
                return mostSold;
            } catch (error) {
                const dbError = createError(
                    error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                    error.code 
                        ? 'DatabaseError: Issue while retrieving the most sold products' 
                        : 'ServerError: Unexpected error while retrieving the most sold products'
                );
    
                dbError.name = error.code ? 'DatabaseError' : 'ServerError';
                dbError.message = error.message || 'An unexpected error occurred while retrieving the most sold products';
                dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
                dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'productAdminModel / returnMostSold';
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