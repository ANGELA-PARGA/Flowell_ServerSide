import OrderedItem from '../models/orderedItemModel.js';

export default class OrderedItemsService {
    /**
     * This class is responsible for handling the business logic related to ordered items (products in an order).
     * It creates, updates, cancels, and retrieves ordered items from the database.
     * It uses the OrderedItemsRepository to perform database operations.
     * @param {OrderedItemsRepository} orderedItemsRepository - The repository for ordered items-related database operations.
     */
    constructor(orderedItemsRepository) {
        this.orderedItemsRepository = orderedItemsRepository
    }

    /**
     * Create an ordered item using data object with the following properties: 
     * @param {number} order_id
     * @param {number} product_id
     * @param {number} qty 
     * @returns {Object}
     * @throws {Error}
     */
    async createOrderedItems(data){
        try {
            const orderedItem = new OrderedItem(data);               
            const newOrderedItem = await this.orderedItemsRepository.insert(orderedItem)
            return newOrderedItem;
        } catch(error) {
            throw error
        }
    }
    
    /**
     * Find all items ordered using the order id: 
     * @param {number} order_id
     * @returns {Object}
     * @throws {Error}
     */
    async findAllItemsByOrderId(order_id){
        try {
            const foundItems = await this.orderedItemsRepository.selectBy(order_id);
            return foundItems;
        } catch (error) {
            throw error
        }
    }

    /**
     * cancel items ordered using the order id: 
     * @param {number} order_id
     * @returns {Object}
     * @throws {Error}
     */
    async cancelOrderedItems(order_id){
        try {            
            const cancelledItems = await this.orderedItemsRepository.cancelItems(order_id);
            return cancelledItems;
        } catch (error) {
            throw error
        }
    }

    /**
     * update items ordered using the order id, the product id and the new qty: 
     * @param {number} order_id
     * @param {number} product_id
     * @param {number} qty
     * @returns {Object}
     * @throws {Error}
     */
    async updateOrderedItems(data){
        try {             
            const updatedOrderedItem = await this.orderedItemsRepository.update(data)
            return updatedOrderedItem;
        } catch(error) {
            throw error
        }
    }
    
}