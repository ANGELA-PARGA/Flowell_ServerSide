import createError from 'http-errors';
import {triggerRevalidationEcomerce} from '../Utilities/utilities.js';
import Product from '../models/productModel.js'; 

export default class ProductService {
    /**
     * This class is responsible for handling product-related operations like creating, updating, and retrieving product information.
     * It interacts with the ProductRepository to perform database operations.
     * @param {ProductRepository} productRepository - The repository for Product-related database operations.
     */
    constructor(productRepository) {
        this.productRepository = productRepository
    }
    /**
     * ADMIN METHOD: Create a new product using data object with the following properties: 
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
     * @param {string} created_at
     * @param {string} updated_at
     * @returns {Object}
     * @throws {Error}
     */
    async createNewProduct(data){
        try {
            const { stock_available, ...parameters } = data
            const product = new Product(parameters)
            
            const newProduct = await this.productRepository.insert(product)   
            const product_id = newProduct.id

            /*insert the stock quantity and upload the images and set the urls to the DB*/
            await this.productRepository.insert({product_id, stock_available, qty_purchased:0, created_at:newProduct.created_at}, 'product_stock')

            // Trigger revalidation for the new product
            const path = `/products`;
            const tag = `products`;  
            await triggerRevalidationEcomerce(path, tag);
            
            return newProduct;
        } catch (error) {
            throw error
        }  
    }

    /**
     * CLIENT METHOD: Find a product information using the product ID: 
     * @param {number} id
     * @returns {Object}
     * @throws {Error}
     */
    async loadSpecificProduct(id){
        try {
            const productInfo = await this.productRepository.selectById(id)
            if (!productInfo) {
                throw createError(404, 'Product not found') 
            }
            return productInfo  
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT AND ADMIN METHOD: Returns a list of 30 products: 
     * @param {number} limit
     * @param {number} offset
     * @param {Object} filters 
     * @returns {Array}
     * @throws {Error}
     */     
    async loadAllProducts(limit, offset, filters){
        try {
            const productsList = await this.productRepository.selectAll(limit, offset, filters)
            if (!productsList) {
                throw createError(404, 'Products not found') 
            }
            return productsList;
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT METHOD: Returns the total number of products, it can receive multiple filters like at the time like (color, category): 
     * @param {Object} filters 
     * @returns {Array}
     * @throws {Error}
     */     
    async returnTotalNumber(filters){
        try {
            const totalNumber = await this.productRepository.selectTotal(filters)
            return totalNumber;
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT METHOD: Returns a list of categories: 
     * @returns {Array}
     * @throws {Error}
     */     
    async loadAllCategories(){
        try {
            const categoriesList = await this.productRepository.selectCategories();
            if (!categoriesList) {
                throw createError(404, 'Categories not found') 
            }
            return categoriesList;
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT AND ADMIN METHOD: Returns all products from a category using a category ID: 
     * @param {number} id
     * @param {number} limit
     * @param {number} offset
     * @param {Object} filters
     * @returns {Array}
     * @throws {Error}
     */     
    async loadAllProductsByCategory(id, limit, offset, filters){
        try {
            const categoryProducts = await this.productRepository.selectByCategory(id, limit, offset ,filters)
            return categoryProducts;
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT AND ADMIN METHOD: Find a product using an object with zero or multiple conditions: 
     * @param {string} searchTerm
     * @param {Object} filters
     * @returns {Object|null}
     * @throws {Error}
     */
    async findProductsBySearch(searchTerm, filters){
        try { 
            const searchResults = await this.productRepository.selectBySearch(searchTerm, filters);
            return searchResults
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Add or remove stock to the product's inventory using the product ID and a new quantity:
     * @param {number} product_id 
     * @param {number} new_qty 
     * @returns {Object}
     * @throws {Error}
     */
    async updateStock(data){
        try {
            const { product_id, new_qty } = data  
            const stockProductUpdated = await this.productRepository.update({id: product_id, stock_available: new_qty}, 'product_id', 'product_stock')  

            const path = `/products/${stockProductUpdated.id}`; 
            await triggerRevalidationEcomerce(path); 
            
            return stockProductUpdated;
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Update the product details, using an object with the information to be changed and the id:
     * @param {number} id 
     * @param {Object} multiple_product_details (color, category_id, ammong other optional details) 
     * @returns {Object}
     * @throws {Error}
     */
    async updateProductDetails(data){
        try { 
            const updatedProduct = await this.productRepository.update(data)
            if (!updatedProduct) {
                throw createError(404, 'Product not found') 
            }
            
            // Trigger revalidation for the updated product
            const path = `/products/${updatedProduct.id}`; 
            const tag = 'products'
            await triggerRevalidationEcomerce(path, tag); 

            return updatedProduct;
        } catch (error) {
            throw error
        }
    } 

    /**
     * ADMIN METHOD: Find a all product information, the stock and purchased qty using the product ID: 
     * @param {number} id
     * @returns {Object}
     * @throws {Error}
     */
    async productPlusInfoStock(id){
        try {
            const productInfo = await this.productRepository.selectInfoWithStock(id)
            return productInfo
        } catch (error) {
            throw error;
        }
    }

    /**
     * ADMIN METHOD: Returns a list of products for the E-commerce platform: 
     * @param {number} limit
     * @param {number} offset
     * @param {string} search
     * @returns {Array}
     * @throws {Error}
     */
    async productDashboardList(limit, offset, search){
        try {
            const productsList = await this.productRepository.selectAllDashboard(limit, offset, search)
            return productsList;
        } catch (error) {
            throw error;
        }
    }

    /**
     * ADMIN METHOD: Returns the total number of products to feed the dashboard, 
     * it can receive one search condition at the time like (color, category, Id, name): 
     * @param {Object} searchTerm 
     * @returns {Array}
     * @throws {Error}
     */     
    async returnTotalDashboard(searchTerm){
        try {
            const totalNumber = await this.productRepository.selectTotalDashboard(searchTerm)
            return totalNumber;
        } catch (error) {
            throw error
        }
    }

    /**
     * ADMIN METHOD: Returns most sold products with revenew: 
     * @returns {Array}
     * @throws {Error}
     */
    async returnMostSold(){
        try {
            const mostSold = await this.productRepository.selectTopSelling()
            return mostSold;
        } catch (error) {
            throw error;
        }
    }

}