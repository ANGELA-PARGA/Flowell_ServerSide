class CartItemsRepository {
    constructor(generalQueries, cartItemsQueries) {
        this.generalQueries = generalQueries;
        this.cartItemsQueries = cartItemsQueries;
        this.tableName = 'cart_items';
    }

    async insert(dataToInsert, tableName= this.tableName) {
        return this.generalQueries.insert(dataToInsert, tableName);
    }

    async update(dataToUpdate) {
        return this.cartItemsQueries.updateCartItems(dataToUpdate);
    }

    async selectItems(cartId) {
        return this.cartItemsQueries.selectCartItems(cartId);
    }

    async deleteItem(data, tableName= this.tableName, cond1= 'cart_id', cond2= 'product_id') {
        return this.generalQueries.deleteByDoubleCondition(data, tableName, cond1, cond2);
    }

    async deleteAll(cartId, columnName= 'cart_id', tableName= this.tableName) {
        return this.generalQueries.deleteBy(cartId, columnName, tableName);
    }
}

export default CartItemsRepository;
