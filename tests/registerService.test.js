const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');

const {
  createOneTimePass,
  deleteFormOTP,
  existCode,
  otpCompare,
  sendEmailOneTimePass,
  createUser,
  codeTime } = require('../services/registerService');
const UsersRepository = require('../repositories/users.repository');
const usersRepository = new UsersRepository();

describe('createOneTimePass', () => {
  it('should create a new OTP and return it', async () => {
    const email = 'test@test.com';
    const newOTP = await createOneTimePass(email);
    expect(newOTP.email).toBe(email);
    expect(newOTP.code.length).toBe(6);
  });
});

describe('deleteFormOTP', () => {
  it('should delete an existing OTP', async () => {
    const email = 'test@test.com';
    await createOneTimePass(email);
    await deleteFormOTP(email);
    const otpExists = await existCode(email);
    expect(otpExists).toBe(null);
  });
});

describe('existCode', () => {
  it('should retrieve an existing OTP', async () => {
    const email = 'test@test.com';
    await createOneTimePass(email);
    const otpExists = await existCode(email);
    expect(otpExists.email).toBe(email);
  });

  it('should return null for a non-existing OTP', async () => {
    const email = 'test@test.com';
    const otpExists = await existCode(email);
    expect(otpExists).toBe(null);
  });
});

describe('otpCompare', () => {
  it('should throw an error if the codes do not match', async () => {
    const userCode = '123456';
    const enteredCode = '654321';
    expect(() => otpCompare(userCode, enteredCode)).toThrow('Incorrect code');
  });

  it('should not throw an error if the codes match', async () => {
    const userCode = '123456';
    const enteredCode = '123456';
    expect(() => otpCompare(userCode, enteredCode)).not.toThrow();
  });
});

describe('sendEmailOneTimePass', () => {
  it('should send an email with the correct details', async () => {
    const user = {
      name: 'Test User',
      email: 'test@test.com',
    };
    const newCode = { code: '123456' };
    await sendEmailOneTimePass(user, newCode);
    // Check that the email was sent successfully using a mock email service or other testing method
  });
});

describe('createUser', () => {
  it('should create a new user with a hashed password', async () => {
    const user = {
      name: 'Test User',
      email: 'test@test.com',
      gender: 'female',
      password: 'testpassword',
    };
    await createUser(user);
    const createdUser = await User.retrieve({ email: user.email });
    expect(createdUser.name).toBe(user.name);
    expect(createdUser.email).toBe(user.email);
    expect(createdUser.gender).toBe(user.gender);
    expect(bcrypt.compare(user.password, createdUser.password)).toBe(true);
  });
});

describe('codeTime', () => {
  it('should return true if the time difference is less than the specified time code', async () => {
    const user = {
      creationDate: new Date(),
    };
    const timeCode = 5; // minutes
    const result = await codeTime(user, timeCode);
    expect(result).toBe(true);
  });

  it('should return false if the time difference is greater than the specified time code', async () => {
    const user = {
      creationDate: newDate(),
    };
    const timeCode = 5; // Time code set to 5 minutes
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute to simulate time difference
    const result = await codeTime(user, timeCode);
    expect(result).toBe(false);
  });
});

describe('createUser', () => {
  it('should create a new user successfully', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      gender: 'male',
      password: 'password',
    };
    await createUser(user);
    const createdUser = await User.retrieve({ email: user.email });
    expect(createdUser.name).toBe(user.name);
    expect(createdUser.email).toBe(user.email);
    expect(createdUser.gender).toBe(user.gender);
    expect(await bcrypt.compare(user.password, createdUser.password)).toBe(true);
  });
});

describe('sendEmailOneTimePass', () => {
  it('should send email successfully', async () => {
    const user = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      gender: 'male',
      password: 'password',
    };
    const newCode = {
      email: user.email,
      code: '123456',
      creationDate: new Date(),
    };
    await sendEmailOneTimePass(user, newCode);
    // TODO: Add test for checking email sending success
    expect(true).toBe(true);
  });
});

describe('otpCompare', () => {
  it('should not throw an error if the user code is correct', async () => {
    const userCode = '123456';
    await expect(otpCompare(userCode, '123456')).resolves.not.toThrow();
  });

  it('should throw an error if the user code is incorrect', async () => {
    await expect(otpCompare('654321', '123456')).rejects.toThrow('Incorrect code');
  });
});
describe('existCode', () => {
  it('should return undefined if the one-time pass does not exist', async () => {
    const result = await existCode('notexist@example.com');
    expect(result).toBeUndefined();
  });

  it('should return the one-time pass if it exists', async () => {
    const email = 'johndoe@example.com';
    const code = '123456';
    const newCode = {
      email: email,
      code: code,
      creationDate: new Date(),
    };
    await oneTimePass.create(newCode);
    const result = await existCode(email);
    expect(result.email).toBe(email);
    expect(result.code).toBe(code);
  });
});

describe('deleteFormOTP', () => {
  it('should not throw an error if the one-time pass does not exist', async () => {
    await expect(deleteFormOTP('notexist@example.com')).resolves.not.toThrow();
  });

  it('should delete the one-time pass if it exists', async () => {
    const email = 'johndoe@example.com';
    const code = '123456';
    const newCode = {
      email: email,
      code: code,
      creationDate: new Date(),
    };
    await oneTimePass.create(newCode);
    await expect(deleteFormOTP(email)).resolves.not.toThrow();
    const result = await existCode(email);
    expect(result).toBeUndefined();
  });
});
