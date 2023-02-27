const errorHandler = require('../middleware/errorHandler');
const { logger } = require('../middleware/errorLogger');

describe('errorHandler', () => {
  let error, req, res, next;

  beforeEach(() => {
    error = new Error('test error');
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    logger.error = jest.fn();
  });

  test('handles error and sends response', () => {
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'test error' });

    expect(logger.error).toHaveBeenCalledWith({
      code: 500,
      message: 'test error',
      date: expect.any(String),
    });
  });

  test('handles error with custom status code and message', () => {
    error.statusCode = 404;
    error.message = 'not found';

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'not found' });

    expect(logger.error).toHaveBeenCalledWith({
      code: 404,
      message: 'not found',
      date: expect.any(String),
    });
  });
});
