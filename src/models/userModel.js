export default class UserModel {
    constructor(data){
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.role = data.role;
    }
}
    
    