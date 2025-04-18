const createError = require('http-errors');
const OrderAdminModel = require('../../ClassModels/ClassAdminModels/orderAdminModel');
const {triggerRevalidationEccomerce} = require('../../Utilities/utilities');

module.exports = class OrderService {

    static async loadAllOrders(limit, offset, search){
        try {
            const ordersFound = await OrderAdminModel.loadAllOrders(limit, offset, search)
            return ordersFound
        } catch (error) {
            throw error
        }
    }

    static async loadGroupedOrders(){
        try {
            const groupedOrders = await OrderAdminModel.loadGroupedOrders()
            return groupedOrders
        } catch (error) {
            throw error
        }
    }
    
    static async updateOrderShippingInfo(dataToUpdate){
        try {        
            const orderUpdated = await OrderAdminModel.updateShippingInfo(dataToUpdate);
            if(!Object.keys(orderUpdated)?.length){
                throw createError(400, 'order not found or unable to update');                
            }
            
            // Trigger revalidation for the new product
            const path = `/account/orders/${orderUpdated.id}`; 
            const tag = `orders`
            await triggerRevalidationEccomerce(path, tag);    
            return orderUpdated; 
        } catch (error) {
            throw error
        }
    }

    static async updateOrderItemsInfo(dataToUpdate){
        try {        
            const orderUpdated = await OrderAdminModel.updateItemsInfo(dataToUpdate);
            if(!Object.keys(orderUpdated)?.length){
                throw createError(400, 'order not found or unable to update');                
            }
            // Trigger revalidation for the new product
            const path = `/account/orders/${orderUpdated.order.id}`; 
            const tag = `orders`
            await triggerRevalidationEccomerce(path, tag); 
            return orderUpdated; 
        } catch (error) {
            throw error
        }
    }

    static async shipOrder(data){
        try {        
            const orderShipped = await OrderAdminModel.shipOrder(data);
            if(!Object.keys(orderShipped)?.length){
                throw createError(400, 'order not found or unable to ship');                
            } 
            // Trigger revalidation for the new product
            const path = `/account/orders/${orderShipped.id}`; 
            const tag = `orders`
            await triggerRevalidationEccomerce(path, tag); 
            return orderShipped; 
        } catch (error) {
            throw error
        }
    }

    static async findOrder(id){
        try {
            const orderFound = await OrderAdminModel.findOrderById(id);
            if(!orderFound?.length){
                throw createError(404, 'order not found');             
            }
            return orderFound;
        } catch (error) {
            throw error
        }
    }

    static async deleteOrder(id){
        try {
            const deletedOrder = await OrderAdminModel.deleteOrder(id);
            if(!deletedOrder) {
                throw createError(400, 'order not found or unable to cancel');
            } 
            // Trigger revalidation for the new product
            const path = `/account/orders`; 
            await triggerRevalidationEccomerce(path);
            return deletedOrder  
        } catch (error) {
            throw error
        }
    }

}