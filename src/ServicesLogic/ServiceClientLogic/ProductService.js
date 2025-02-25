const createError = require('http-errors');
const ProductModel = require('../../ClassModels/ClassClientModels/productModel');
module.exports = class ProductService { 

    // retrieve the information of a specific product using the product ID
    static async loadSpecificProduct(id){
        try {
            const product = await ProductModel.retrieveProductInfo(id);
            return product;  
        } catch (error) {
            throw error
        }
    }

    //add a product to the cart, data is an object {cart_id, product_id, qty}
    static async addProductToCart(data){
        try {
            const productToAdd = await ProductModel.addProductToCart(data);           
            return productToAdd;         
        } catch (error) {
            throw error
        }
    }

    //Returns a list of products:     
    static async loadAllProducts(limit, offset, filters){
        try {
            const productsList = await ProductModel.returnProductsList(limit, offset, filters);
            return productsList;
        } catch (error) {
            throw error
        }
    }

    //Returns a list of categories:     
    static async loadAllCategories(){
        try {
            const categoriesList = await ProductModel.returnCategories();
            return categoriesList;
        } catch (error) {
            throw error
        }
    }

    // Returns a list of products by category, using the category ID and multiple conditions:      
    static async loadAllProductsByCategory(id, limit, offset, filters){
        try {
            const categoryProducts = await ProductModel.returnProductsByCategory(id, limit, offset, filters);
            return categoryProducts;
        } catch (error) {
            throw error
        }
    }

    /**
     * Find a product using an object with zero or multiple conditions: 
     * @param {string} searchTerm
     * @returns {Object|null}
     * @throws {Error}
     */
    static async findProductsBySearch(searchTerm, filters){
        try { 
            const searchResults = await ProductModel.findProductsBySearch(searchTerm, filters);
            return searchResults
        } catch (error) {
            throw error
        }
    }

}