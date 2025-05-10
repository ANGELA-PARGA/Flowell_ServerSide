class UserRepository {
    constructor(generalQueries, userQueries) {
        this.generalQueries = generalQueries;
        this.userQueries = userQueries;
        this.tableName = 'users';
    }

    async insert(dataToInsert, tableName = this.tableName) {
        return this.generalQueries.insert(dataToInsert, tableName);
    }

    async update(dataToUpdate, columnName = 'id', tableName = this.tableName) {
        return this.generalQueries.update(dataToUpdate, columnName, tableName);
    }

    async select(data,  columnName = 'id', tableName = this.tableName) {
        return this.generalQueries.selectBy(data, columnName, tableName);
    }

    async selectById(userId) {
        return this.userQueries.selectAllUserInfo(userId);
    }

    async selectAll(limit, offset, searchTerm) {
        return this.userQueries.selectAllUsers(limit, offset, searchTerm);
    }

    async selectTotal(searchTerm) {
        return this.userQueries.selectTotalUsers(searchTerm);
    }

    async deleteInfo(data, tableName = this.tableName, cond1 = 'id', cond2 = 'user_id') {
        return this.generalQueries.deleteByDoubleCondition(data, tableName, cond1, cond2);
    }

}
export default UserRepository;
