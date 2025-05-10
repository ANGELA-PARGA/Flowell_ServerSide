class OrderedItemsRepository {
    constructor(generalQueries, orderedItemsQueries) {
        this.generalQueries = generalQueries;
        this.orderedItemsQueries = orderedItemsQueries;
        this.tableName = 'ordered_items';
    }

    async selectBy(id, columnName = 'order_id', tableName = this.tableName) {
        return this.generalQueries.selectBy(id, columnName, tableName);
    }

    async insert(dataToInsert, tableName = this.tableName) {
        return this.generalQueries.insert(dataToInsert, tableName);
    }

    async update(dataToUpdate) {
        return this.orderedItemsQueries.updateOrderedItems(dataToUpdate);
    }

    async cancelItems(dataToUpdate) {
        return this.orderedItemsQueries.cancelOrderedItems(dataToUpdate);
    }

}

export default OrderedItemsRepository;