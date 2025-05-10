class ProductRepository {
    constructor(generalQueries, productQueries) {
        this.generalQueries = generalQueries;
        this.productQueries = productQueries;
        this.tableName = 'products';
    }

    async insert(dataToInsert, tableName= this.tableName) {
        return this.generalQueries.insert(dataToInsert, tableName);
    }

    async update(dataToUpdate, columnName = 'id', tableName= this.tableName) {
        return this.generalQueries.update(dataToUpdate, columnName, tableName);
    }

    async selectById(productId) {
        return this.productQueries.selectAllInfo(productId);
    }

    async selectAll(limit, offset, filters) {
        return this.productQueries.selectAllProducts(limit, offset, filters);
    }

    async selectTotal(filters) {
        return this.productQueries.selectTotalProducts(filters);
    }

    async selectCategories() {
        return this.productQueries.selectAllCategories();
    }

    async selectByCategory(id, limit, offset, filters) {
        return this.productQueries.selectByCategory(id, limit, offset, filters);
    }

    async selectBySearch(searchTerm, filters) {
        return this.productQueries.selectBySearch(searchTerm, filters);
    }

    async selectAllDashboard(limit, offset, search) {
        return this.productQueries.selectAllDashboard(limit, offset, search);
    }

    async selectTotalDashboard(searchTerm) {
        return this.productQueries.selectTotalDashboard(searchTerm);
    }

    async selectInfoWithStock(parameter) {
        return this.productQueries.selectInfoWithStock(parameter);
    }

    async selectTopSelling() {
        return this.productQueries.selectTopSelling();
    }
}

export default ProductRepository;
