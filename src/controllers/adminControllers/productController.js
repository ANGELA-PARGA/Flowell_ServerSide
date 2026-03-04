import upload from '../../config/multer.js';
import uploadImage from '../../config/cloudinary.js';
import { productService } from '../../config/container.js';

class ProductAdminController {
    /**
     * Get all products for admin dashboard
     */
    async getAllProducts(req, res, next) {
        try {
            const limit = 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;
            const search = req.query.term;

            const bestProducts = await productService.loadAllProducts(limit, offset, search);
            const totalProducts = await productService.returnTotalDashboard(search);

            res.status(200).json({
                status: 'success',
                message: 'Products and categories retrieved successfully',
                code: 200,
                products: bestProducts,
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
     * Get dashboard products (most sold)
     */
    async getDashboardProducts(req, res, next) {
        try {
            const products = await productService.returnMostSold();

            res.status(200).json({
                status: 'success',
                message: 'The 3 most sold products retrieved successfully',
                code: 200,
                products: products, 
            });
        } catch(err) {
            next(err);
        }
    }

    /**
     * Search products for admin
     */
    async searchProducts(req, res, next) {
        try {
            const data = req.query.term;
            const { color, category } = req.query;      

            const response = await productService.findProductsBySearch(data, {color, category});

            res.status(200).json({
                status: 'success',
                message: 'Product(s) by search term retrieved successfully',
                code: 200,
                product_found: response,
            });
        } catch(err) {
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
                message: 'Product retrieved successfully',
                code: 200,
                product_found: response 
            });
        } catch(err) {
            next(err);
        }
    }

    /**
     * Create new product with images
     */
    async createProduct(req, res, next) {
        try {          
            // Extract text fields
            const data = req.body;

            // Upload images to Cloudinary using the buffer
            const imageUrls = await Promise.all(req.files.map(async (file) => {
                const buffer = file.buffer; 
                return await uploadImage(`data:image/jpeg;base64,${buffer.toString('base64')}`);
            }));
            
            // Save product data + image URLs in the DB
            const newProduct = await productService.createNewProduct({
                ...data,
                images_urls: imageUrls
            });

            res.status(200).json({
                status: 'success',
                message: 'Product created successfully',
                code: 200,
                new_product: newProduct 
            });
        } catch(err) {
            next(err);
        }        
    }

    /**
     * Update product details
     */
    async updateProductDetails(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const details = req.body;
            const response = await productService.updateProductDetails({id, ...details});
            
            res.status(200).json({
                status: 'success',
                message: 'Product details updated successfully',
                code: 200,
                product_updated: response 
            });
        } catch(err) {
            next(err);
        }
    }

    /**
     * Update product stock
     */
    async updateProductStock(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const stock = req.body.stock;
            const response = await productService.updateStock({product_id: id, new_qty: stock});
            
            res.status(200).json({
                status: 'success',
                message: 'Product stock updated successfully',
                code: 200,
                product_updated: response 
            });
        } catch(err) {
            next(err);
        }
    }
}

export default new ProductAdminController();