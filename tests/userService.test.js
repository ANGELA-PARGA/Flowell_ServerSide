const createError = require('http-errors');
const UserService = require('../src/ServicesLogic/UserService');
const UserModel = require('../src/ClassModels/userModel');

jest.mock('../src/ClassModels/userModel');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserInfo', () => {
        it('should return user info when user is found', async () => {
            const userFound = {
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
            };
            
            UserModel.findAllUserInfoById.mockResolvedValueOnce(userFound);
            const userInfo = await UserService.getUserInfo(1);
            expect(userInfo).toEqual(userFound);
        });

        it('should throw 404 error when user is not found', async () => {
            UserModel.findAllUserInfoById.mockResolvedValueOnce({});

            await expect(UserService.getUserInfo(1)).rejects.toThrow(createError(404, 'User Not Found'));
        });

        it('should throw 500 error when an error occurs', async () => {
            UserModel.findAllUserInfoById.mockRejectedValueOnce(new Error('Error on server while searching the user'));

            await expect(UserService.getUserInfo(1)).rejects.toThrow(createError(500, 'Error on server while searching the user'));
        });
    });
    describe('updateUserInfo', () => {
        it('should update the user info', async () => {
            const infoToUpdate = {
                id: 1,
                address:'123 ST FIFTH AVENUE',
                resource: 'address_inf'
            };

            const expectedResult = {
                id: 1,                
                address: infoToUpdate.address,
                city:'NEW YORK',
                state:'NEW YORK',
                zip_code: 29568
            }
            
            UserModel.updateUserInfo.mockResolvedValueOnce(expectedResult);
            const userUpdated = await UserService.updateUserInfo(infoToUpdate);
            expect(userUpdated).toEqual(expectedResult);
        });

        it('should throw 400 error when user is not updated', async () => {
            const infoToUpdate = {
                id: 1,
                address:'123 ST FIFTH AVENUE',
                resource: 'address_inf'
            };
            UserModel.updateUserInfo.mockResolvedValueOnce({});

            await expect(UserService.updateUserInfo(infoToUpdate)).rejects.toThrow(createError(400, 'unable to update the user or user not found'));
        });

        it('should throw 500 error when an error occurs', async () => {
            const infoToUpdate = {
                id: 1,
                address:'123 ST FIFTH AVENUE',
                resource: 'address_inf'
            };
            UserModel.updateUserInfo.mockRejectedValueOnce(new Error('Error on server while updating the user'));

            await expect(UserService.updateUserInfo(infoToUpdate)).rejects.toThrow(createError(500, 'Error on server while updating the user'));
        });
    });
    describe('updateUserPassword', () => {
        it('should update the user password', async () => {
            const passwordToUpdate = {
                id: 1,
                password:'hashed_newPassword'
            };
            const expectedResult = {
                id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: passwordToUpdate.password,
                created: '2024-04-04T15:22:34.388Z',
                modified: '2024-04-04T15:22:34.390Z',
            }
            
            UserModel.updateUserPassword.mockResolvedValueOnce(expectedResult);
            const userUpdated = await UserService.updateUserPassword(passwordToUpdate);
            expect(userUpdated).toEqual(expectedResult);
        });

        it('should throw 400 error when user is not updated', async () => {
            const passwordToUpdate = {
                id: 1,
                password:'hashed_newPassword'
            };
            UserModel.updateUserPassword.mockResolvedValueOnce({});

            await expect(UserService.updateUserPassword(passwordToUpdate)).rejects.toThrow(createError(400, 'unable to update the user password or user not found'));
        });

        it('should throw 500 error when an error occurs', async () => {
            const infoToUpdate = {
                id: 1,
                address:'123 ST FIFTH AVENUE',
                resource: 'address_inf'
            };
            UserModel.updateUserPassword.mockRejectedValueOnce(new Error('Error on server while updating the user password'));

            await expect(UserService.updateUserPassword(infoToUpdate)).rejects.toThrow(createError(500, 'Error on server while updating the user password'));
        });
    });
    describe('addUserInfo', () => {
        it('should add new user information', async () => {
            const infoToAdd = {
                user_id: 1,
                resource: 'address_inf',
                address: '123 ST FIFTH AVENUE',
                city:'NEW YORK',
                state:'NEW YORK',
                zip_code: 29568
            };
            const expectedResult = {
                id: 1,
                user_id: 1,
                address: '123 ST FIFTH AVENUE',
                city:'NEW YORK',
                state:'NEW YORK',
                zip_code: 29568,
                created: '2024-04-04T15:22:34.388Z',
                modified: '2024-04-04T15:22:34.390Z',
            }
            
            UserModel.addNewUserInfo.mockResolvedValueOnce(expectedResult);
            const userUpdated = await UserService.addUserInfo(infoToAdd);
            expect(userUpdated).toEqual(expectedResult);
        });

        it('should throw 400 error when user information is not added', async () => {
            const infoToAdd = {
                user_id: 1,
                resource: 'address_inf',
                address: '123 ST FIFTH AVENUE',
                city:'NEW YORK',
                state:'NEW YORK',
                zip_code: 29568
            };
            UserModel.addNewUserInfo.mockResolvedValueOnce({});

            await expect(UserService.addUserInfo(infoToAdd)).rejects.toThrow(createError(400, 'unable to add new user information'));
        });

        it('should throw 500 error when an error occurs', async () => {
            const infoToAdd = {
                user_id: 1,
                resource: 'address_inf',
                address: '123 ST FIFTH AVENUE',
                city:'NEW YORK',
                state:'NEW YORK',
                zip_code: 29568
            };
            UserModel.addNewUserInfo.mockRejectedValueOnce(new Error('Error on server while adding new user information'));

            await expect(UserService.addUserInfo(infoToAdd)).rejects.toThrow(createError(500, 'Error on server while adding new user information'));
        });
    });
    describe('deleteUserInfo', () => {
        it('should delete user information', async () => {
            const infoToDelete = {
                id: 1,
                resource: 'address_inf',
                user_id: 1
            };
            const expectedResult = {
                message: 'the user information was succesfully deleted', 
                status: 204
            }
            
            UserModel.deleteUserInfo.mockResolvedValueOnce(true);
            const userDeleted = await UserService.deleteUserInfo(infoToDelete);
            expect(userDeleted).toEqual(expectedResult);
        });

        it('should throw 400 error when user information is not deleted', async () => {
            const infoToDelete = {
                id: 1,
                resource: 'address_inf',
                user_id: 1
            };
            UserModel.deleteUserInfo.mockResolvedValueOnce(false);

            await expect(UserService.deleteUserInfo(infoToDelete)).rejects.toThrow(createError(400, 'unable to delete the user information, or user information not found'));
        });

        it('should throw 500 error when an error occurs', async () => {
            const infoToDelete = {
                id: 1,
                resource: 'address_inf',
                user_id: 1
            };
            UserModel.deleteUserInfo.mockRejectedValueOnce(new Error('Error on server while deleting the user info'));

            await expect(UserService.deleteUserInfo(infoToDelete)).rejects.toThrow(createError(500, 'Error on server while deleting the user info'));
        });
    });
});
