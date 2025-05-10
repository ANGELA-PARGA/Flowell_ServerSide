class CartRepository {
    constructor(generalQueries, cartQueries) {
        this.generalQueries = generalQueries;
        this.cartQueries = cartQueries;
        this.tableName = 'carts';
    }

    async insert(dataToInsert, tableName= this.tableName) {
        return this.generalQueries.insert(dataToInsert, tableName);
    }

    async update(dataToUpdate, columnName= 'id', tableName= this.tableName) {
        return this.generalQueries.update(dataToUpdate, columnName, tableName);
    }

    async selectBy(userId) {
        return this.cartQueries.selectCartInfo(userId);
    }

    async getTotalByCartId(cartId, columnName= 'cart_id', tableName= 'cart_items') {
        return this.generalQueries.calculateTotal(cartId, columnName, tableName);
    }

    async getTotalItems(cartId, columnName= 'cart_id', tableName='cart_items') {
        return this.generalQueries.calculateTotalItems(cartId, columnName, tableName);
    }
}

export default CartRepository;
