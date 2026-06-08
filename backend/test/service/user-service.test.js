const UserService = require('../../src/services/user-service');
const UserRepository = require('../../src/repository/userRepository.js');
describe('UserService Unit Tes', () => {
    let userService;
    beforeEach(() => {
        userService = new UserService();

    });
    
    describe('signUp',  () => {
        test('should successfully sign up a user', async () => {
            const mockUserData = {
                email: 'I5BZP@example.com',
                password: 'password123',
                name: 'John Doe'
            };
            jest.spyOn(userService.userRepository, 'create').mockResolvedValue({ id: 1, ...mockUserData });
            const result = await userService.signup(mockUserData);
            expect(result).toEqual({ id: 1, ...mockUserData });
            expect(userService.userRepository.create).toHaveBeenCalledWith(mockUserData);
            expect(userService.userRepository.create).toHaveBeenCalledTimes(1);
        });
        test('should throw an error if user creation fails', async () => {
            const mockUserData = {
                email: 'I5BZP@example.com',
                password: 'password123',
                name: 'John Doe'
            };
            jest.spyOn(userService.userRepository, 'create').mockRejectedValue(new Error('User creation failed'));
            await expect(userService.signup(mockUserData)).rejects.toThrow('User creation failed');
            
            expect(userService.userRepository.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('signIn', () => {
        test('should successfully sign in a user', async () => {
            //Arrange
            const mockUserData = {
                email: 'I5BZP@example.com',
                password: 'password123',
                comparePassword: jest.fn().mockResolvedValue(true),
                generateJWT: jest.fn().mockResolvedValue('mockToken')
            };
            jest.spyOn(userService, 'signin').mockResolvedValue(mockUserData);

            //Act
            const result = await userService.signin({ email: 'I5BZP@example.com', password: 'password123' });

            //Assert
            expect(result).toEqual(mockUserData);
            expect(userService.signin).toHaveBeenCalledWith({ email: 'I5BZP@example.com', password: 'password123' });
            expect(userService.signin).toHaveBeenCalledTimes(1);
        });

        test('should throw an error if user is not found', async () => {
            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(null);
            await expect(userService.signin({ email: 'I5BZP@example.com', password: 'password123' })).rejects.toThrow('User not found');
        });

        test('should throw an error if password is incorrect', async () => {
            const mockUserData = {
                email: 'I5BZP@example.com',
                password: 'password123',
                comparePassword: jest.fn().mockResolvedValue(false),
            };
            jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(mockUserData);
            await expect(userService.signin({ email: 'I5BZP@example.com', password: 'wrongPassword' })).rejects.toThrow('Invalid password');
        });
    });

    describe('createProfile', () => {
        test('should successfully create a user profile', async () => {
            const mockUserId = '12345';
            const mockData = { name: 'John Doe', bio: 'Software Developer' };
            const mockUpdatedUser = { id: mockUserId, ...mockData };
            jest.spyOn(userService.userRepository, 'update').mockResolvedValue(mockUpdatedUser);
            const result = await userService.createProfile(mockUserId, mockData);
            expect(result).toEqual(mockUpdatedUser);
            expect(userService.userRepository.update).toHaveBeenCalledWith(mockUserId, mockData);
            expect(userService.userRepository.update).toHaveBeenCalledTimes(1);
        });
        test('should throw an error if profile creation fails', async () => {
            const mockUserId = '12345';
            const mockData = { name: 'John Doe', bio: 'Software Developer' };
            jest.spyOn(userService.userRepository, 'update').mockRejectedValue(new Error('Profile creation failed'));
            await expect(userService.createProfile(mockUserId, mockData)).rejects.toThrow('Profile creation failed');
            expect(userService.userRepository.update).toHaveBeenCalledWith(mockUserId, mockData);
            expect(userService.userRepository.update).toHaveBeenCalledTimes(1);
        }); 
    });
});
