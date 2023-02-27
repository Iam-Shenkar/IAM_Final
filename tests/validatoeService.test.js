const { emailValidator, PasswordValidator } = require('../middleware/validatorService'); // replace with your file path

describe('emailValidator', () => {
  test('should throw an error if email is not valid', () => {
    expect(() => emailValidator('invalidemail')).toThrow('email not valid');
  });

  test('should not throw an error if email is valid', () => {
    expect(() => emailValidator('validemail@test.com')).not.toThrow();
  });
});

describe('PasswordValidator', () => {
  test('should throw an error if password is too short', () => {
    expect(() => PasswordValidator('abc')).toThrow('Password must be at least 8 characters long');
  });

  test('should throw an error if password is too long', () => {
    expect(() => PasswordValidator('abcdefghi123456789')).toThrow('Password must be at most 20 characters long');
  });

  test('should throw an error if password does not contain a lowercase letter', () => {
    expect(() => PasswordValidator('ABC123456')).toThrow('Password must contain at least one lowercase letter');
  });

  test('should throw an error if password does not contain an uppercase letter', () => {
    expect(() => PasswordValidator('abc123456')).toThrow('Password must contain at least one uppercase letter');
  });

  test('should throw an error if password does not contain a number', () => {
    expect(() => PasswordValidator('abcDEFGHI')).toThrow('Password must contain at least one number');
  });

  test('should not throw an error if password is valid', () => {
    expect(() => PasswordValidator('ValidPassword123')).not.toThrow();
  });
});
