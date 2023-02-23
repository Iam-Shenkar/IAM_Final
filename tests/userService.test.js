// const { User } = require('../repositories/repositories.init');
// const { updateName } = require('../services/userService');
// const { httpError } = require('../class/httpError');
//
// describe('updateName', () => {
//   test('update user name if email matches', async () => {
//     const userEmail = 'test@example.com';
//     const userData = { name: 'Test User', email: userEmail };
//     const user = { email: userEmail, status: 'active' };
//     const expectedUpdate = { email: userEmail, name: userData.name };
//
//     jest.spyOn(User, 'update').mockResolvedValue(true);
//
//     await updateName(user, userData);
//
//     expect(User.update).toHaveBeenCalledWith({ email: user.email }, expectedUpdate);
//   });
//   //
//   // test('should throw a 400 error if the email does not match', async () => {
//   //   const userEmail = 'test@example.com';
//   //   const userData = { name: 'Test User', email: 'wrong@example.com' };
//   //   const user = { email: userEmail, status: 'active' };
//   //
//   //   await expect(updateName(user, userData)).rejects.toThrow(httpError(400, 'you cant update this user'));
//   // });
//   //
//   // test('should throw a 400 error if the user is not active', async () => {
//   //   const userEmail = 'test@example.com';
//   //   const userData = { name: 'Test User', email: userEmail };
//   //   const user = { email: userEmail, status: 'closed' };
//   //
//   //   await expect(updateName(user, userData)).rejects.toThrow(httpError(400, 'user is closed'));
//   // });
// });
