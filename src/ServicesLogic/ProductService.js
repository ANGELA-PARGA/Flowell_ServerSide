const createError = require('http-errors');
const ProductModel = require('../ClassModels/productModel');
module.exports = class ProductService { 

    // retrieve the information of a specific product using the product ID
    static async loadSpecificProduct(id){
        try {
            const product = await ProductModel.retrieveProductInfo(id);
            return product;  
        } catch (error) {
            throw createError(500, 'error on server while finding product information by ID', error.stack, error);        
        }
    }

    //add a product to the cart, data is an object {cart_id, product_id, qty}
    static async addProductToCart(data){
        try {
            const productToAdd = await ProductModel.addProductToCart(data);           
            return productToAdd;         
        } catch (error) {
            throw createError(500, 'Error on server while adding the item to the cart', error.stack, error);            
        }
    }

    //Returns a list of 30 products:     
    static async loadAllProducts(){
        try {
            const productsList = await ProductModel.returnProductsList();
            return productsList;
        } catch (error) {
            throw createError(500, 'error on server while finding all products', error.stack, error);        
        }
    }

    //Returns a list of categories:     
    static async loadAllCategories(){
        try {
            const categoriesList = await ProductModel.returnCategories();
            return categoriesList;
        } catch (error) {
            throw createError(500, 'error on server while finding all categories', error.stack, error);        
        }
    }

    // Returns a list of products by category, using the category ID:      
    static async loadAllProductsByCategory(id){
        try {
            const categoryProducts = await ProductModel.returnProductsByCategory(id);
            return categoryProducts;
        } catch (error) {
            throw createError(500, 'error on server while finding all products by category', error.stack, error);        
        }
    }

    /**
     * Find a product using an object with zero or multiple conditions: 
     * @param {string} searchTerm
     * @returns {Object|null}
     * @throws {Error}
     */
    static async findProductsBySearch(searchTerm){
        try { 
            const searchResults = await ProductModel.findProductsBySearch(searchTerm);
            /*if(!searchResults?.length){
                throw createError(404, 'the product that you are searching does not exist');                
            }*/
            return searchResults
        } catch (error) {
            throw createError(500, `error on server while finding products by search term`, error.stack, error); 
        }
    }

    /**
     * Find a product using an object with zero or multiple conditions: 
     * @param {Object} options
     * @returns {Object|null}
     * @throws {Error}
     */
    static async findProductsByFilter(options){
        try { 
            const filteredResults = await ProductModel.findProductsByFilter(options);
            /*if(!filteredResults?.length){
                throw createError(404, 'the product that you are filtering does not exist');                
            }*/            
            return filteredResults
        } catch (error) {
            throw createError(500, `error on server while filtering products`, error.stack, error); 
        }
    }
}