export default class OrderedItemModel {    
    /**
     * Create an ordered item using data object with the following properties: 
     * @param {number} order_id
     * @param {number} product_id
     * @param {number} qty 
     * @returns {Object}
     * @throws {Error}
     */
    constructor(data) {
        this.order_id = data.order_id;
        this.product_id = data.product_id;
        this.qty = data.qty;
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }
    
}