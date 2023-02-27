import jest from 'jest';

const jwt = require('jsonwebtoken');
const { User } = require('../repositories/repositories.init');
const { generateToken } = require('../middleware/authenticate');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
jest.mock('../repositories/repositories.init', () => ({
  User: {
    findOne: jest.fn(),
  },
}));

describe('generateToken', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
      },
    };
    res = {
      cookie: jest.fn(),
      set: jest.fn(),
      status: jest.fn(() => ({
        send: jest.fn(),
      })),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should generate access and refresh tokens and set them in the response headers and cookies', async () => {
    jwt.sign.mockReturnValueOnce('access-token');
    jwt.sign.mockReturnValueOnce('refresh-token');

    await generateToken(req, res, next);

    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(jwt.sign).toHaveBeenCalledWith({ email: 'test@example.com' }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
    expect(jwt.sign).toHaveBeenCalledWith({ email: 'test@example.com' }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    expect(res.cookie).toHaveBeenCalledTimes(1);
    expect(res.cookie).toHaveBeenCalledWith('jwt', 'refresh-token', {
      httpOnly: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    expect(res.set).toHaveBeenCalledTimes(1);
    expect(res.set).toHaveBeenCalledWith({ authorization: 'Bearer access-token' });

    expect(req.token).toEqual({
      refreshToken: 'refresh-token',
      accessToken: 'Bearer access-token',
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return a 401 response if an error occurs', async () => {
    jwt.sign.mockImplementationOnce(() => {
      throw new Error();
    });

    await generateToken(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status().send).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.set).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
