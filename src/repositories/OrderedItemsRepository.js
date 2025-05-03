class OrderedItemsRepository {
    constructor(generalQueries, orderedItemsQueries) {
        this.generalQueries = generalQueries;
        this.orderedItemsQueries = orderedItemsQueries;
        this.tableName = 'ordered_items';
    }

    async selectBy(id) {
        return this.generalQueries.selectBy(id, columnName = 'order_id', tableName = this.tableName);
    }

    async insert(dataToInsert) {
        return this.generalQueries.insert(dataToInsert, tableName = this.tableName);
    }

    async update(dataToUpdate) {
        return this.orderedItemsQueries.updateOrderedItems(dataToUpdate);
    }

    async cancelItems(dataToUpdate) {
        return this.orderedItemsQueries.cancelOrderedItems(dataToUpdate);
    }

}

module.exports = OrderedItemsRepository;