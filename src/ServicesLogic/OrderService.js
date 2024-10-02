const createError = require('http-errors');
const OrderModel = require('../ClassModels/orderModel');

module.exports = class OrderService {
    
    async createNewOrder(orderData){
        try {
            const orderInstance = new OrderModel(orderData);
            const newOrder = await orderInstance.createOrder();
            if(!Object.keys(newOrder)?.length){
                throw createError(400, 'unable to create the new order');                
            }            
            return newOrder;            
        } catch (error) {
            throw createError(500, 'Error on server while creating the order', error.stack, error);            
        }
    }

    // This method expects an object with an order ID and an array with the modified items [{product_id, qty}]
    static async updateOrderItemsInfo(dataToUpdate){
        try {
            const orderUpdated = await OrderModel.updateItemsInfo(dataToUpdate);
            if(!Object.keys(orderUpdated)?.length){
                throw createError(400, 'order not found or unable to update');                
            } 
            return orderUpdated;                    
        } catch (error) {
            throw createError(500, 'Error on server while updating the order', error.stack, error);            
        }
    }

    // This method expects an object with an order ID and one of the following: 
    // {delivery_date, shipping_address_id, contact_info_id }
    static async updateOrderShippingInfo(dataToUpdate){
        try {        
            const orderUpdated = await OrderModel.updateShippingInfo(dataToUpdate);
            if(!Object.keys(orderUpdated)?.length){
                throw createError(400, 'order not found or unable to update');                
            } 
            return orderUpdated; 
        } catch (error) {
            throw createError(500, 'Error on server while updating the order', error.stack, error);            
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
            throw createError(500, 'Error on server while searching the order', error.stack, error);            
        }
    }

    static async deleteOrder(id){
        try {
            const deletedOrder = await OrderModel.deleteOrder(id);
            if(!deletedOrder) {
                throw createError(400, 'order not found or unable to delete');
            } 
            return {message: 'Order succesfully deleted', status:204};  
        } catch (error) {
            throw createError(500, 'Error on server while deleting the order', error.stack, error);            
        }
    }

}
