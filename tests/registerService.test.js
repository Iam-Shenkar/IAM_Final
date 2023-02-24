const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const { oneTimePass } = require('../repositories/repositories.init');
const { httpError } = require('../class/httpError');
const { sendEmail } = require('../sendEmail/sendEmail');
const { User } = require('../repositories/repositories.init');
const registerService = require('../services/registerService');
const {
  createOneTimePass,
  existCode,
  deleteFormOTP,
  otpCompare,
  codeTime,
  createUser,
  sendEmailOneTimePass,
} = require('../services/registerService');

jest.mock('otp-generator');

describe('createOneTimePass', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should generate and save an OTP for the given email', async () => {
    // Arrange
    const email = 'test@example.com';
    const expectedOTP = '123456';
    const expectedOneTimePass = {
      email,
      code: expectedOTP,
      creationDate: expect.any(Date),
    };
    otpGenerator.generate.mockReturnValueOnce(expectedOTP);
    oneTimePass.create = jest.fn()
      .mockResolvedValueOnce(expectedOneTimePass);

    // Act
    const result = await createOneTimePass(email);

    // Assert
    expect(result)
      .toEqual(expectedOneTimePass);
    expect(otpGenerator.generate)
      .toHaveBeenCalledWith(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    expect(oneTimePass.create)
      .toHaveBeenCalledWith(expectedOneTimePass);
  });

  it('should throw an error if no new OTP is created', async () => {
    // Arrange
    const email = 'test@example.com';
    otpGenerator.generate.mockReturnValueOnce(null);

    // Act and assert
    await expect(createOneTimePass(email))
      .rejects
      .toThrow('No new OTP created');
    expect(oneTimePass.create)
      .not
      .toHaveBeenCalled();
  });
});

jest.mock('../repositories/repositories.init');

describe('existCode', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the user code if it exists', async () => {
    const email = 'test@test.com';
    const expectedCode = '123456';
    oneTimePass.retrieve.mockResolvedValueOnce(expectedCode);

    const result = await existCode(email);

    expect(oneTimePass.retrieve)
      .toHaveBeenCalledTimes(1);
    expect(oneTimePass.retrieve)
      .toHaveBeenCalledWith({ email: email.toLowerCase() });
    expect(result)
      .toBe(expectedCode);
  });

  it('should return null if the user code does not exist', async () => {
    const email = 'test@test.com';
    oneTimePass.retrieve.mockResolvedValueOnce(null);

    const result = await existCode(email);

    expect(oneTimePass.retrieve)
      .toHaveBeenCalledTimes(1);
    expect(oneTimePass.retrieve)
      .toHaveBeenCalledWith({ email: email.toLowerCase() });
    expect(result)
      .toBeNull();
  });
});

describe('deleteFormOTP', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the user OTP if it exists', async () => {
    const email = 'test@test.com';
    const code = '123456';
    oneTimePass.retrieve.mockResolvedValueOnce(code);
    oneTimePass.delete.mockResolvedValueOnce(true);

    await deleteFormOTP(email);

    expect(oneTimePass.retrieve)
      .toHaveBeenCalledTimes(1);
    expect(oneTimePass.retrieve)
      .toHaveBeenCalledWith({ email: email.toLowerCase() });
    expect(oneTimePass.delete)
      .toHaveBeenCalledTimes(1);
    expect(oneTimePass.delete)
      .toHaveBeenCalledWith({ email: email.toLowerCase() });
  });

  it('should not delete the user OTP if it does not exist', async () => {
    const email = 'test@test.com';
    oneTimePass.retrieve.mockResolvedValueOnce(null);

    await deleteFormOTP(email);

    expect(oneTimePass.retrieve)
      .toHaveBeenCalledTimes(1);
    expect(oneTimePass.retrieve)
      .toHaveBeenCalledWith({ email: email.toLowerCase() });
    expect(oneTimePass.delete)
      .not
      .toHaveBeenCalled();
  });

  it('should throw an error if OTP deletion fails', async () => {
    const email = 'test@test.com';
    const code = '123456';
    oneTimePass.retrieve.mockResolvedValueOnce(code);
    oneTimePass.delete.mockResolvedValueOnce(false);

    await expect(deleteFormOTP(email))
      .rejects
      .toThrow(httpError);

    expect(oneTimePass.retrieve)
      .toHaveBeenCalledTimes(1);
    expect(oneTimePass.retrieve)
      .toHaveBeenCalledWith({ email: email.toLowerCase() });
    expect(oneTimePass.delete)
      .toHaveBeenCalledTimes(1);
    expect(oneTimePass.delete)
      .toHaveBeenCalledWith({ email: email.toLowerCase() });
  });
});

describe('otpCompare', () => {
  it('should not throw an error when the user code is correct', async () => {
    const userCode = '123456';
    await expect(otpCompare(userCode, userCode))
      .resolves
      .toBeUndefined();
  });

  it('should throw an error when the user code is incorrect', async () => {
    const userCode = '123456';
    const wrongCode = '654321';
    await expect(otpCompare(userCode, wrongCode))
      .rejects
      .toThrow(httpError);
  });
});

jest.mock('../sendEmail/sendEmail');

describe('sendEmailOneTimePass', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendEmail with the correct arguments', async () => {
    const user = {
      name: 'John',
      email: 'john@example.com',
    };
    const newCode = {
      code: '123456',
    };
    await sendEmailOneTimePass(user, newCode);
    expect(sendEmail)
      .toHaveBeenCalledWith(
        {
          path: '/sendEmail/oneTimePass.ejs',
          subject: 'Please Verify you Account',
          email: user.email,
        },
        {
          name: user.name,
          code: newCode.code,
        }
      );
  });
});

describe('createUser', () => {
  it('should create a new user', async () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      gender: 'male',
      password: 'password',
    };

    // Update the mock for bcrypt.hash to use jest.fn()
    bcrypt.hash = jest.fn()
      .mockResolvedValueOnce('hashedPassword');

    await registerService.createUser(user);

    expect(bcrypt.hash)
      .toHaveBeenCalledWith('password', 12);
    expect(User.create)
      .toHaveBeenCalledWith({
        name: user.name,
        email: user.email,
        gender: user.gender,
        accountId: 'none',
        password: 'hashedPassword', // assert the hashed password is used
      });
  });
});

test('returns true if time difference is less than code time', async () => {
  const user = { creationDate: new Date() }; // current date and time
  const timeCode = 10; // 10 minutes
  const result = await codeTime(user, timeCode);
  expect(result)
    .toBe(true);
});

test('returns false if time difference is greater than code time', async () => {
  const user = { creationDate: new Date('2022-02-24T12:00:00Z') }; // fixed date and time
  const timeCode = 10; // 10 minutes
  const result = await codeTime(user, timeCode);
  expect(result)
    .toBe(false);
});

describe('otpCompare', () => {
  it('should throw an error when the code is incorrect', async () => {
    const UserCode = '123456';
    const userCode = '654321';

    await expect(otpCompare(UserCode, userCode))
      .rejects
      .toThrow(httpError);
  });

  it('should not throw an error when the code is correct', async () => {
    const UserCode = '123456';
    const userCode = '123456';

    await expect(otpCompare(UserCode, userCode))
      .resolves
      .not
      .toThrow();
  });
});
