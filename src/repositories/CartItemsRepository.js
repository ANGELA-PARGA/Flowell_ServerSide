class CartItemsRepository {
    constructor(generalQueries, cartItemsQueries) {
        this.generalQueries = generalQueries;
        this.cartItemsQueries = cartItemsQueries;
        this.tableName = 'cart_items';
    }

    async insert(dataToInsert) {
        return this.generalQueries.insert(dataToInsert, tableName= this.tableName);
    }

    async update(dataToUpdate) {
        return this.generalQueries.updateCartItems(dataToUpdate);
    }

    async selectItems(cartId) {
        return this.cartItemsQueries.selectCartItems(cartId);
    }

    async deleteItem(data) {
        return this.generalQueries.deleteByDoubleCondition(data, tableName= this.tableName, cond1= 'cart_id', cond2= 'product_id');
    }

    async deleteAll(cartId) {
        return this.generalQueries.deleteBy(cartId, columnName= 'cart_id', tableName= this.tableName);
    }
}

module.exports = CartItemsRepository;
