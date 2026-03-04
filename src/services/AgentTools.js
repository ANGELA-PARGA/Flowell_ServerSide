// src/services/AgentTools.js
import { DynamicTool } from '@langchain/core/tools';
import { createInternalServerError } from '../Utilities/errorStandard.js';

export class AgentTools {
    constructor(repositories) {
        this.userRepo = repositories.userRepository;
        this.orderRepo = repositories.orderRepository;
        this.productRepo = repositories.productRepository;
        this.cartRepo = repositories.cartRepository;
        this.vectorRepo = repositories.vectorStoreRepository;
    }

    createTools(userId, userRole) {
        const tools = [ 
            // Tool 1: Search Knowledge Base
            new DynamicTool({
                name: "search_knowledge_base",
                description: "Search the knowledge base for general information about policies, FAQ, product guides, etc. Use this for general questions about the store.",
                func: async (query) => {
                    try {
                        // Use the repository's similaritySearch method
                        const results = await this.vectorRepo.similaritySearch(query, 3);
                        
                        if (results.length === 0) {
                            return "No relevant information found in the knowledge base for that query.";
                        }
                        
                        // Format the results for the LLM
                        return results.map(doc => 
                            `Topic: ${doc.metadata.topic}\nContent: ${doc.pageContent}\nSource: ${doc.metadata.source_type}`
                        ).join('\n\n---\n\n');
                    } catch (error) {
                        console.error("Knowledge base search error:", error);
                        throw createInternalServerError('Error searching knowledge base', error);
                    }
                }
            }),

            // Tool 2: Get User Profile
            new DynamicTool({
                name: "get_user_profile",
                description: "Get the current user's profile information including name, email, addresses, and phone numbers.",
                func: async () => {
                    try {
                        const user = await this.userRepo.selectById(userId);
                        
                        return JSON.stringify({
                            user: {
                                name: `${user.first_name} ${user.last_name}`,
                                email: user.email
                            },
                            addresses: user.addresses,
                            phones: user.phones
                        }, null, 2);
                    } catch (error) {
                        throw createInternalServerError('Error retrieving user profile', error);
                    }
                }
            }),

            // Tool 3: Get User Orders
            new DynamicTool({
                name: "get_user_orders",
                description: "Get the user's order history, including status, items, and tracking information.",
                func: async () => {
                    try {
                        const orders = await this.orderRepo.findByUserId(userId);
                        
                        if (orders.length === 0) {
                            return "No orders found for this user.";
                        }
                        
                        return JSON.stringify(orders.map(order => ({
                            order_id: order.id,
                            date: order.created_at,
                            status: order.status,
                            total: order.total,
                            items: order.items,
                            tracking_number: order.tracking
                        })), null, 2);
                    } catch (error) {
                        throw createInternalServerError('Error retrieving orders', error);
                    }
                }
            }),

            // Tool 4: Search Products
            new DynamicTool({
                name: "search_products",
                description: "Search for products by name, category, or description. Returns product details including price and availability.",
                func: async (searchTerm) => {
                    try {
                        const products = await this.productRepo.selectBySearch(searchTerm, {color:'', category:''});
                        
                        if (products.length === 0) {
                            return `No products found matching "${searchTerm}".`;
                        }
                        
                        return JSON.stringify(products.map(product => ({
                            id: product.id,
                            name: product.name,
                            price: product.price_per_case,
                            quantity: product.qty_per_case,
                            category: product.category_name
                        })), null, 2);
                    } catch (error) {
                        throw createInternalServerError('Error searching products', error);
                    }
                }
            }),

            // Tool 5: Get Cart Information
            new DynamicTool({
                name: "get_cart_info",
                description: "Get the user's current cart contents including items, quantities, and total.",
                func: async () => {
                    try {
                        const cart = await this.cartRepo.selectBy(userId);
                        
                        if (!cart) {
                            return "Cart is empty.";
                        }
                        
                        return JSON.stringify({
                            id: cart.id,
                            total: cart.total,
                            total_items: cart.total_items,
                            items: cart.items
                        }, null, 2);
                    } catch (error) {
                        throw createInternalServerError('Error retrieving cart', error);
                    }
                }
            }),

            // Tool 6: Add Product to Cart (Action Tool)
            new DynamicTool({
                name: "add_to_cart",
                description: "Add a product to the user's cart. Requires product_id and quantity.",
                func: async (input) => {
                    try {
                        const params = JSON.parse(input);
                        const { product_id, quantity = 1 } = params;
                        
                        if (!product_id) {
                            return "Error: product_id is required to add to cart.";
                        }
                        
                        const result = await this.cartRepo.addProductToCart({
                            user_id: userId,
                            product_id: parseInt(product_id),
                            qty: parseInt(quantity)
                        });
                        
                        return `Successfully added ${quantity} unit(s) of product ${product_id} to cart.`;
                    } catch (error) {
                        throw createInternalServerError('Error adding to cart', error);
                    }
                }
            })
        ]

        // Add admin-only tools if user is admin
        if (userRole === 'admin') {
            tools.push(
                new DynamicTool({
                    name: "update_order_status",
                    description: "Update the status of any order. Admin only. Requires order_id and new_status.",
                    func: async (input) => {
                        try {
                            const params = JSON.parse(input);
                            const { order_id, new_status } = params;
                            
                            const result = await this.orderRepo.updateOrderStatus(order_id, new_status);
                            return `Order ${order_id} status updated to: ${new_status}, with result ${result}`;
                        } catch (error) {
                            throw createInternalServerError('Error updating order status', error);
                        }
                    }
                })
            );
        }

        return tools;
    }
}