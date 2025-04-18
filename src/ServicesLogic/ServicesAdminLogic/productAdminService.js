const ProductAdminModel = require('../../ClassModels/ClassAdminModels/productAdminModel');
const {triggerRevalidationEccomerce} = require('../../Utilities/utilities');
module.exports = class ProductAdminService { 

    //create a new product and add stock to it
    static async createNewProduct(data){
        try {
            const newProduct = await ProductAdminModel.createNewProduct(data); 
            // Trigger revalidation for the new product
            const path = `/products`;
            const tag = `products`;  
            await triggerRevalidationEccomerce(path, tag);          
            return newProduct;         
        } catch (error) {
            throw error
        }
    }

    //Returns a list of products in the DB, using multiple conditions:     
    static async loadAllProducts(limit, offset, search){
        try {
            const productsList = await ProductAdminModel.returnProductsList(limit, offset, search);
            return productsList;
        } catch (error) {
            throw error
        }
    }

    //Returns the 3 most products sold:     
    static async returnMostSold(){
        try {
            const mostSoldProducts = await ProductAdminModel.returnMostSold()
            return mostSoldProducts;
        } catch (error) {
            throw error
        }
    }

    //Returns a list of categories:     
    static async loadAllCategories(){
        try {
            const categoriesList = await ProductAdminModel.returnCategories();
            return categoriesList;
        } catch (error) {
            throw error
        }
    }

    // Returns a list of products by category, using the category ID and multiple conditions:      
    static async loadAllProductsByCategory(id, limit, offset, filters){
        try {
            const categoryProducts = await ProductAdminModel.returnProductsByCategory(id, limit, offset, filters);
            return categoryProducts;
        } catch (error) {
            throw error
        }
    }

    // retrieve the information of a specific product using the product ID. It also returns the product's stock and purchased qty:
    static async loadSpecificProduct(id){
        try {
            const product = await ProductAdminModel.retrieveProductInfo(id);
            return product;  
        } catch (error) {
            throw error
        }
    }

    /**
     * Find a product using an object with zero or multiple conditions: 
     * @param {string} searchTerm
     * @param {Object} filters
     * @returns {Object|null}
     * @throws {Error}
     */
    static async findProductsBySearch(searchTerm, filters){
        try { 
            const searchResults = await ProductAdminModel.findProductsBySearch(searchTerm, filters);
            return searchResults
        } catch (error) {
            throw error
        }
    }

    /**
     * Update a product stock using an object with zero or multiple conditions: 
     * @param {stockData} Object stock qty to add or remove and product ID
     * @returns {Object|null}
     * @throws {Error}
     */
    static async updateProductStock(stockData){
        try { 
            const productUpdated = await ProductAdminModel.updateStock(stockData);
            const path = `/products/${productUpdated.id}`; 
            await triggerRevalidationEccomerce(path);  
            return productUpdated
        } catch (error) {
            throw error
        }
    }

    //update the details of a product
    static async updateProductDetails(data){
        try {
            const productUpdated = await ProductAdminModel.updateProductDetails(data);  
            // Trigger revalidation for the updated product
            const path = `/products/${productUpdated.id}`; 
            const tag = 'products'
            await triggerRevalidationEccomerce(path, tag);        
            return productUpdated;         
        } catch (error) {
            throw error
        }
    }

}