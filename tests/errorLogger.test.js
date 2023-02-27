const { logger } = require('../middleware/errorLogger');
const { createLogger, transports } = require('winston');
const { File } = transports;

describe('errorLogger', () => {
  test('creates a logger with a file transport', () => {
    const expectedConfig = {
      transports: [
        new File({
          filename: 'log/error.log',
        }),
      ],
    };

    expect(logger).toBeInstanceOf(createLogger().constructor);
    expect(logger.transports).toHaveLength(1);
    expect(logger.transports[0]).toEqual(expectedConfig.transports[0]);
  });
});
