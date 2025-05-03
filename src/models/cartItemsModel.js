module.exports = class CartItemModel {
    constructor(data) {
        this.cart_id = data.cart_id;
        this.product_id = data.product_id;
        this.qty = data.qty;
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
    }
}