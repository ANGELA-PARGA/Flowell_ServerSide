const createError = require('http-errors');
const OrderModel = require('../../ClassModels/ClassClientModels/orderModel');
const {triggerRevalidationDashboard} = require('../../Utilities/utilities');

module.exports = class OrderService {
    
    static async createNewOrder(orderData){
        try {
            const newOrder = await OrderModel.createOrder(orderData);
            if(!Object.keys(newOrder)?.length){
                throw createError(400, 'unable to create the new order');                
            }
            // Trigger revalidation for the new order
            const path = `/admin_panel/orders`;
            await triggerRevalidationDashboard(path);            
            return newOrder;            
        } catch (error) {
            throw error
        }
    }


    static async updateOrderShippingInfo(dataToUpdate){
        try {        
            const orderUpdated = await OrderModel.updateShippingInfo(dataToUpdate);
            if(!Object.keys(orderUpdated)?.length){
                throw createError(400, 'order not found or unable to update');                
            }
            // Trigger revalidation for the new order
            const path = `/admin_panel/orders/${orderUpdated.id}`;
            const tag = `orders`
            await triggerRevalidationDashboard(path, tag);            
            return orderUpdated; 
        } catch (error) {
            throw error
        }
    }

    //data is an object with possibly one of two properties {id, user_id}
    static async findOrder(data){
        try {
            const { id, user_id } = data;
            let ordersFound;
            if(id){
                ordersFound = await OrderModel.findOrderById(id);                
            }
            if(user_id){
                ordersFound = await OrderModel.findOrdersByUserId(user_id);
            }

            if(!ordersFound?.length){
                ordersFound = []               
            }
            return ordersFound;
        } catch (error) {
            throw error
        }
    }

    static async deleteOrder(id){
        try {
            const deletedOrder = await OrderModel.deleteOrder(id);
            if(!deletedOrder) {
                throw createError(400, 'order not found or unable to cancel');
            }
            // Trigger revalidation for the new order
            const path = `/admin_panel/orders`;
            await triggerRevalidationDashboard(path);  
            return deletedOrder  
        } catch (error) {
            throw error
        }
    }

}
