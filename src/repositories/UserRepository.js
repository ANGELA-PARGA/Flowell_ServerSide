class UserRepository {
    constructor(generalQueries, userQueries) {
        this.generalQueries = generalQueries;
        this.userQueries = userQueries;
        this.tableName = 'users';
    }

    async insert(dataToInsert) {
        return this.generalQueries.insert(dataToInsert, tableName = this.tableName);
    }

    async update(dataToUpdate) {
        return this.generalQueries.update(dataToUpdate, columnName = 'id', tableName = this.tableName);
    }

    async select(data) {
        return this.generalQueries.selectBy(data, columnName = 'id', tableName = this.tableName);
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

    async deleteInfo(data) {
        return this.generalQueries.deleteByDoubleCondition(data, tableName = this.tableName, cond1 = 'id', cond2 = 'user_id');
    }

}

module.exports = UserRepository;
