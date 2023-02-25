const { User, Account } = require('../repositories/repositories.init');
const bcrypt = require('bcrypt');
const {validPassword, userExist} = require("../services/authService");

jest.mock('../repositories/repositories.init');

describe('userExist', () => {
    test('should return null when user does not exist', async () => {
        User.retrieve.mockResolvedValueOnce(null);

        const userEmail = 'nonexistent@example.com';
        const result = await userExist(userEmail);

        expect(result).toBeNull();
        expect(User.retrieve).toHaveBeenCalledWith({ email: userEmail.toLowerCase() });
    });

    test('should return the user when user exists', async () => {
        const existingUser = { id: 1, email: 'existing@example.com', name: 'Existing User' };
        User.retrieve.mockResolvedValueOnce(existingUser);

        const userEmail = 'existing@example.com';
        const result = await userExist(userEmail);

        expect(result).toEqual(existingUser);
        expect(User.retrieve).toHaveBeenCalledWith({ email: userEmail.toLowerCase() });
    });
});
