class OrderRepository {
    constructor(generalQueries, orderQueries) {
        this.generalQueries = generalQueries;
        this.orderQueries = orderQueries;
        this.tableName = 'orders';
    }

    async insert(dataToInsert, tableName = this.tableName) {
        return this.generalQueries.insert(dataToInsert, tableName);
    }

    async update(dataToUpdate, columnName = 'id', tableName = this.tableName) {
        return this.generalQueries.update(dataToUpdate, columnName, tableName);
    }

    async findByUserId(userId, columnName = 'user_id') {
        return this.orderQueries.selectOrderById(userId, columnName);
    }

    async findByOrderId(orderId, columnName = 'id') {
        return this.orderQueries.selectOrderById(orderId, columnName);
    }

    async getTotalByOrderId(orderId, columnName = 'order_id', tableName = 'ordered_items') {
        return this.generalQueries.calculateTotal(orderId, columnName, tableName);
    }

    async orderWithUserInfo(orderId, columnName = 'id') {
        return this.orderQueries.selectOrderAndUserInfo(orderId, columnName);
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

export default OrderRepository;

