class CartRepository {
    constructor(generalQueries, cartQueries) {
        this.generalQueries = generalQueries;
        this.cartQueries = cartQueries;
        this.tableName = 'cart';
    }

    async insert(dataToInsert) {
        return this.generalQueries.insert(dataToInsert, tableName= this.tableName);
    }

    async update(dataToUpdate) {
        return this.generalQueries.update(dataToUpdate, columnName= 'id', tableName= this.tableName);
    }

    async selectBy(userId) {
        return this.cartQueries.selectCartInfo(userId);
    }

    async getTotalByCartId(cartId) {
        return this.generalQueries.calculateTotal(cartId, columnName= 'cart_id', tableName= 'cart_items');
    }

    async getTotalItems(cartId) {
        return this.generalQueries.calculateTotalItems(cartId, columnName= 'cart_id', tableName='cart_items');
    }
}

module.exports = CartRepository;
