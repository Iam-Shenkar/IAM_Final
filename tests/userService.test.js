const { httpError } = require('../class/httpError');
const { User } = require('../repositories/repositories.init');
const { updateName, adminUpdateUser, deleteAuthorization } = require('../services/userService');

describe('updateName', () => {
  it('should update the user name', async () => {
    const mockUser = {
      email: 'roey@test.com',
      name: 'roey test',
      status: 'active',
    };

    const mockData = {
      email: 'roey@test.com',
      name: 'roey test',
    };

    User.update = jest.fn().mockResolvedValueOnce({});

    await updateName(mockUser, mockData);

    expect(User.update).toHaveBeenCalledTimes(1);
    expect(User.update).toHaveBeenCalledWith({ email: 'roey@test.com' }, { name: 'roey test' });
  });

  it('should throw an error if user email is different from data email', async () => {
    const mockUser = {
      email: 'roey1@test.com',
      name: 'roey test',
      status: 'active',
    };

    const mockData = {
      email: 'roey2@test.com',
      name: 'roey test',
    };

    await expect(updateName(mockUser, mockData)).rejects.toThrow(httpError);
  });

  it('should throw an error if user status is not active', async () => {
    const mockUser = {
      email: 'roey@test.com',
      name: 'roey test',
      status: 'closed',
    };

    const mockData = {
      email: 'roey@test.com',
      name: 'roey test',
    };

    await expect(updateName(mockUser, mockData)).rejects.toThrow(httpError);
  });
});

/* ====================================================================================*/

describe('adminUpdateUser', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = {
      email: 'user@test.com',
      name: 'test user',
      status: 'active',
      role: 'manager',
    };

    User.retrieve = jest.fn().mockResolvedValue(mockUser);
    User.update = jest.fn().mockResolvedValue({});
  });

  it('should update the user data when status is active and role is not manager', async () => {
    const mockData = {
      email: 'user@test.com',
      name: 'updated user name',
      status: 'active',
    };

    await adminUpdateUser(mockData);

    expect(User.retrieve).toHaveBeenCalledTimes(1);
    expect(User.retrieve).toHaveBeenCalledWith({ email: mockData.email });
    expect(User.update).toHaveBeenCalledTimes(1);
    expect(User.update).toHaveBeenCalledWith({ email: mockUser.email }, { name: mockData.name, status: mockData.status });
  });

  it('should update the user data and suspend the user when status is suspended', async () => {
    const mockData = {
      email: 'user@test.com',
      name: 'updated user name',
      status: 'suspended',
      suspensionTime: 5,
    };

    await adminUpdateUser(mockData);

    expect(User.retrieve).toHaveBeenCalledTimes(1);
    expect(User.retrieve).toHaveBeenCalledWith({ email: mockData.email });
    expect(User.update).toHaveBeenCalledTimes(1);
    expect(User.update).toHaveBeenCalledWith(
      { email: mockUser.email },
      {
        name: mockData.name, status: mockData.status, suspensionTime: mockData.suspensionTime, suspensionDate: expect.any(Date),
      },
    );
  });

  it('should throw an error when the user is a manager and the status is closed', async () => {
    const mockData = {
      email: 'user@test.com',
      name: 'updated user name',
      status: 'closed',
    };
    mockUser.role = 'manager';

    await expect(adminUpdateUser(mockData)).rejects.toThrow(httpError);
    expect(User.retrieve).toHaveBeenCalledTimes(1);
    expect(User.retrieve).toHaveBeenCalledWith({ email: mockData.email });
    expect(User.update).not.toHaveBeenCalled();
  });
});

/* ===============================================================================*/

describe('deleteAuthorization', () => {
  const user = { email: 'user@example.com', accountId: 1, type: 'user' };
  const account = { id: 1 };
  const adminUser = { email: 'admin@example.com', accountId: 1, type: 'admin' };
  const otherAccountUser = { email: 'other@example.com', accountId: 2, type: 'user' };

  test('throws error when trying to delete yourself', () => {
    const data = { email: 'user@example.com' };
    expect(() => deleteAuthorization(user, account, data)).toThrow(new httpError(400, 'Cant delete yourself'));
  });

  test('throws error when account does not exist', () => {
    const data = { email: 'other@example.com', accountId: 1, type: 'user' };
    expect(() => deleteAuthorization(user, undefined, data)).toThrow(new httpError(400, 'Account not exist'));
  });

  test('throws error when trying to delete a non-admin user from same account', () => {
    const data = { email: 'other@example.com', accountId: 1, type: 'user' };
    expect(() => deleteAuthorization(user, account, data)).toThrow(new httpError(400, 'It is not possible to delete a user who is not in your account'));
  });

  test('throws error when not a user trying to delete a user', () => {
    const data = { email: 'other@example.com', accountId: 2, type: 'user' };
    expect(() => deleteAuthorization(adminUser, account, data)).toThrow(new httpError(400, 'It is not possible to delete a user who is not in your account'));
  });

  test('throws error when admin user tries to delete a user in a different account', () => {
    const data = { email: 'other@example.com', accountId: 2, type: 'user' };
    expect(() => deleteAuthorization(adminUser, account, data)).toThrow(new httpError(400, 'It is not possible to delete a user who is not in your account'));
  });
});
