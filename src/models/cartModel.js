export default class CartModel {    
    /**
     * Instantiate a cart using data object with the following properties: 
     * @param {number} user_id
     * @param {string} created_at
     * @param {string} updated_at
     * @param {number} total
     * @param {number} total_items
     * @returns {Object}
     * @throws {Error}
     */
    constructor(data) {
        this.user_id = data.user_id;
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
        this.total = 0;
        this.total_items = 0;
    }
    
}