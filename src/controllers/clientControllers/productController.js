import { productService, cartService } from '../../config/container.js';

class ProductController {
    /**
     * Get all products with pagination and filtering
     */
    async getAllProducts(req, res, next) {
        try {
            const limit = 6;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const { color, category } = req.query;

            const bestProducts = await productService.loadAllProducts(limit, offset, { color, category });
            const totalProducts = await productService.returnTotalNumber({ color, category });

            res.status(200).json({
                status: 'success',
                code: 200,
                products_and_categories: bestProducts,
                pagination: {
                    limit,
                    page,
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts: totalProducts
                },
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Search products by term with filtering
     */
    async searchProducts(req, res, next) {
        try {
            const data = req.query.term;
            const { color, category } = req.query;      
            const response = await productService.findProductsBySearch(data, { color, category });

            res.status(200).json({
                status: 'success',
                code: 200,
                product_found: response,
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Get all product categories
     */
    async getAllCategories(req, res, next) {
        try {        
            const allCategories = await productService.loadAllCategories();
            res.status(200).json({
                status: 'success',
                code: 200,
                products_and_categories: allCategories,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Get products by category with pagination and filtering
     */
    async getProductsByCategory(req, res, next) {
        try {
            const limit = 6;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;
            const categoryId = parseInt(req.params.categoryId, 10);

            const { color } = req.query;

            const response = await productService.loadAllProductsByCategory(categoryId, limit, offset, { color });
            const totalProducts = await productService.returnTotalNumber({ color, categoryId });

            res.status(200).json({
                status: 'success',
                code: 200,
                products_by_category: response, 
                pagination: {
                    limit,
                    page,
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts: totalProducts
                },
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Get specific product by ID
     */
    async getProductById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await productService.loadSpecificProduct(id);
            res.status(200).json({
                status: 'success',
                code: 200,
                product_found: response 
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Add product to cart
     */
    async addToCart(req, res, next) {
        try {
            const cart_info = await cartService.getCartInfo(req.user.id);
            const cart_id = cart_info.id;
            const data = req.body;
            const response = await cartService.addProductToCart({ cart_id, ...data, user_id: req.user.id });
            console.log('response in controller', response)
            res.status(200).json({
                status: 'success',
                code: 200,
                cart: response 
            });
        } catch (err) {
            next(err);
        }        
    }
}

export default new ProductController();