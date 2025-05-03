module.exports = class Order {    
    /**
     * Create an order using data object with the following properties [the property items is used by another class]:
     * @param {object} data
     * @param {number} user_id
     * @param {number} total
     * @param {Date} delivery_date
     * @param {string} address
     * @param {string} city
     * @param {string} state
     * @param {string} zip_code
     * @param {string} phone
     * @param {Date} created_at
     * @param {Date} updated_at
     */
    constructor(data) {
        this.user_id = data.user_id;
        this.total = data.total;
        this.status = data.status || 'PENDING'; 
        this.delivery_date = data.delivery_date;
        this.address = data.address;
        this.city = data.city;
        this.state = data.state;
        this.zip_code = data.zip_code;
        this.phone = data.phone;
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }
}