class OrderRepository {
    constructor(generalQueries, orderQueries) {
        this.generalQueries = generalQueries;
        this.orderQueries = orderQueries;
        this.tableName = 'orders';
    }

    async insert(dataToInsert) {
        return this.generalQueries.insert(dataToInsert, tableName = this.tableName);
    }

    async update(dataToUpdate) {
        return this.generalQueries.update(dataToUpdate, columnName = 'id', tableName = this.tableName);
    }

    async findByUserId(userId) {
        return this.orderQueries.selectOrderById(userId, columnName = 'user_id');
    }

    async findByOrderId(orderId) {
        return this.orderQueries.selectOrderById(orderId, columnName = 'id');
    }

    async getTotalByOrderId(orderId) {
        return this.generalQueries.calculateTotal(orderId, columnName = 'order_id', tableName = 'ordered_items');
    }

    async orderWithUserInfo(orderId) {
        return this.orderQueries.selectOrderAndUserInfo(orderId, columnName = 'id');
    }

    async selectAll(limit, offset, search) {
        return this.orderQueries.selectAllOrders(limit, offset, search);
    }

    async selectTotal(search) {
        return this.orderQueries.selectTotalOrders(search);
    }

    async selectDashboard() {
        return this.orderQueries.selectAllOrdersDashboard();
    }

    async selectByMonth() {
        return this.orderQueries.selectOrdersByMonth();
    }

    async selectByMostOrders() {
        return this.orderQueries.selectMonthWithMostOrders();
    }

}

module.exports = OrderRepository;

