
const UserModel = require('../src/ClassModels/userModel');

jest.mock('../src/Utilities/utilities', () => ({
    hashPassword: jest.fn((password) => `hashed_${password}`),
    verifyResource: jest.fn((resource)=> 'users_addresses')
}));

jest.mock('../src/DBQueries/generalQueries', () => ({
    insertQuery: jest.fn((info) => ({id:1, ...info})),
    updateQuery: jest.fn((infoToUpdate) => {
        const storedUserInfo = {
            id: 1,
            password: 'hashed_password'
        }
        const storedUserAddress = {
            id: 1,                
            address:'25 ST EIGHT AVENUE',
            city:'NEW YORK',
            state:'NEW YORK',
            zip_code: 29568
        }
        if(infoToUpdate.password){
            storedUserInfo.password = infoToUpdate.password; 
            return storedUserInfo;
        }
        if(infoToUpdate.address){
            storedUserAddress.address = infoToUpdate.address
            return storedUserAddress;
        }        
    }),
    standardSelectQuery: jest.fn((email) => {
        const userStored = {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: 'hashed_password',
            created: '2024-04-04T15:22:34.388Z',
            modified: '2024-04-04T15:22:34.390Z'
        }
        if (email === userStored.email) {
            return userStored;
        } else {
            return {}; 
        }
    }),
    deleteDoubleConditionQuery: jest.fn(({data}) => {
        return true
    })
}))

jest.mock('../src/DBQueries/userQueries', () => ({
    selectAllUserInfoQuery: jest.fn((user_id) => {
        const userStored = {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            password: 'hashed_password',
            created: '2024-04-04T15:22:34.388Z',
            modified: '2024-04-04T15:22:34.390Z',
            addresses: [{
                id: 1,                
                address:'25 ST EIGHT AVENUE',
                city:'NEW YORK',
                state:'NEW YORK',
                zip_code: 29568
            }],
            phones: [{
                id: 1,
                phone: '323-333-4811'
            }]
        }
        if (user_id === userStored.id) {
            return userStored;
        } else {
            return {}; 
        }
    })
}))

const {hashPassword, verifyResource} = require('../src/Utilities/utilities');
const {insertQuery, updateQuery, standardSelectQuery, deleteDoubleConditionQuery} = require('../src/DBQueries/generalQueries');
const {selectAllUserInfoQuery} = require('../src/DBQueries/userQueries');


describe('UserModel', function() {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('createUser', function() {
        it('should create a new user and store it on the DB', async function() {
            //setup
            const userData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password'
            };
    
            const userModel = new UserModel(userData);
            const newUser = await userModel.createUser(userData);

            //verify            
            expect(userModel).toBeInstanceOf(UserModel);
            expect(userModel).toHaveProperty('created');
            expect(userModel).toHaveProperty('modified');
            expect(hashPassword).toHaveBeenCalledWith(userData.password);

            expect(insertQuery).toHaveBeenCalledWith({
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                created: newUser.created,
                modified: newUser.modified,
                password: newUser.password
            }, 'users');

            expect(newUser).toHaveProperty('id');            
            expect(newUser).toEqual(expect.objectContaining({
                id: expect.any(Number),
                created: expect.stringContaining(newUser.created),
                modified:  expect.stringContaining(newUser.modified),
                first_name: expect.stringContaining(newUser.first_name),
                last_name: expect.stringContaining(newUser.last_name),
                email: expect.stringContaining(newUser.email),
                password: expect.stringContaining(newUser.password)
            }));
        });
        it('should throw an error if insertQuery fails', async () => {
            insertQuery.mockRejectedValueOnce(new Error('error on server while creating the user'));
            
            // Setup
            const userData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'password'
            };

            const userModel = new UserModel(userData);

            // Verify
            await expect(userModel.createUser(userData)).rejects.toThrow('error on server while creating the user');
        });
    });
    describe('updateUserPassword', function() {
        it('should update the user password information on the DB', async function() {
            const userNewPassword = {
                id: 1,
                password: "newpassword"
            };
            const updatedUser = await UserModel.updateUserPassword(userNewPassword);
    
            expect(hashPassword).toHaveBeenCalledWith(userNewPassword.password);
    
            expect(updateQuery).toHaveBeenCalledWith({
                id: userNewPassword.id,
                password: updatedUser.password
            }, 'id', 'users');
    
            expect(updatedUser).toEqual(expect.objectContaining({
                id: userNewPassword.id,
                password: updatedUser.password
            }));
        });
    });
    describe('updateUserInfo', function() {
        it('should update the user information on the DB', async function() {
            const userInfo = {
                id: 1,
                resource: "address_inf",
                address:'123 ST FIFTH AVENUE',
            };
            
            const updatedUser = await UserModel.updateUserInfo(userInfo);
            const tableName = verifyResource(userInfo.resource)
    
            expect(verifyResource).toHaveBeenCalledWith(userInfo.resource);
    
            expect(updateQuery).toHaveBeenCalledWith({
                id: userInfo.id,
                address: userInfo.address,
                city: userInfo.city,
                state: userInfo.state,
                zip_code: userInfo.zip_code
            }, 'id', tableName);
    
            expect(updatedUser).toEqual(expect.objectContaining({
                id: userInfo.id,
                address: updatedUser.address,
                city: updatedUser.city,
                state: updatedUser.state,
                zip_code: updatedUser.zip_code
            }));           
        });
    });
    describe('addNewUserInfo', function() {
        it('should add new user information on the DB', async function() {
            const userNewInfo = {
                user_id: 1,
                resource: "address_inf",
                address:'123 SPLENDID AVENUE',
                city:'MIAMI',
                state:'FLORIDA',
                zip_code: 32323
            };
            
            const newUserInfo = await UserModel.addNewUserInfo(userNewInfo);
            const tableName = verifyResource(userNewInfo.resource)
    
            expect(verifyResource).toHaveBeenCalledWith(userNewInfo.resource);
            expect(newUserInfo).toHaveProperty('created');
            expect(newUserInfo).toHaveProperty('modified');

            expect(insertQuery).toHaveBeenCalledWith({
                user_id: userNewInfo.user_id,
                address: userNewInfo.address,
                city: userNewInfo.city,
                state: userNewInfo.state,
                zip_code: userNewInfo.zip_code,
                created: newUserInfo.created,
                modified: newUserInfo.modified
            }, tableName);
            
            expect(newUserInfo).toHaveProperty('id');
            expect(newUserInfo).toEqual(expect.objectContaining({
                id: expect.any(Number),
                user_id: newUserInfo.user_id,
                address: newUserInfo.address,
                city: newUserInfo.city,
                state: newUserInfo.state,
                zip_code: newUserInfo.zip_code,
                created: newUserInfo.created,
                modified: newUserInfo.modified
            }));      
        });
    });
    describe('findUserByEmail', function() {
        it('should find an user on the DB using the email', async function() {
            const email = 'john.doe@example.com'
            const userFound = await UserModel.findUserByEmail(email);

            expect(standardSelectQuery).toHaveBeenCalledWith(email, 'users', 'email');
            expect(userFound).toEqual(expect.objectContaining({
                id: expect.any(Number),
                first_name: expect.stringContaining(userFound.first_name),
                last_name: expect.stringContaining(userFound.last_name),
                email: expect.stringContaining(userFound.email),
                password: expect.stringContaining(userFound.password),
                created: expect.stringContaining(userFound.created),
                modified: expect.stringContaining(userFound.modified)
            }));             
        });
    });
    describe('findAllUserInfoById', function() {
        it('should find all user information stored on the DB usign an ID', async function() {
            const user_id = 1;
            const userFound = await UserModel.findAllUserInfoById(user_id);

            expect(selectAllUserInfoQuery).toHaveBeenCalledWith(user_id);            
            expect(userFound).toEqual(expect.objectContaining({
                id: expect.any(Number),
                first_name: expect.stringContaining(userFound.first_name),
                last_name: expect.stringContaining(userFound.last_name),
                email: expect.stringContaining(userFound.email),
                password: expect.stringContaining(userFound.password),
                created: expect.stringContaining(userFound.created),
                modified: expect.stringContaining(userFound.modified),
                addresses: expect.arrayContaining(userFound.addresses),
                phones: expect.arrayContaining(userFound.phones),
            }));  
        });
    });
    describe('deleteUserInfo', function() {
        it('should delete user information stored on the DB', async function() {
            const infoToDelete = {
                resource: 'address_inf',
                id: 1,
                user_id: 1
            }
            const { id, user_id, resource } = infoToDelete            
            const userDeleted = await UserModel.deleteUserInfo({param1:id, param2:user_id, resource:resource});
            const tableName = verifyResource(resource)
        
            expect(deleteDoubleConditionQuery).toHaveBeenCalledWith({param1:id, param2:user_id}, tableName, 'id', 'user_id');     
            expect(verifyResource).toHaveBeenCalledWith(infoToDelete.resource);
            expect(userDeleted).toBeTruthy(); 
        });
    });
});

