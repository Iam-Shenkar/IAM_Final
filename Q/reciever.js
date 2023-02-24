const amqp = require('amqplib/callback_api');
const Logger = require('abtest-logger');
const { QUpdateAccount } = require('../services/accountService');
const { QSuspendAccount } = require('../services/accountService');

const logger = new Logger(process.env.CORE_QUEUE);

const {
  listenSubscription,
  listenSuspendedAccount,
} = process.env;

const listenToQ = () => {
  const q = 'CloudAMQP';
  logger.info(`Waiting for a message from Billing in ${q}`);

  amqp.connect(listenSubscription, (err, conn) => {
    if (err) {
      logger.error('Error connecting to RabbitMQ:', err);
      return;
    }

    conn.createChannel((error, ch) => {
      if (error) {
        logger.error('Error creating channel:', error);
        return;
      }

      ch.consume(q, (msg) => {
        try {
          const qm = JSON.parse(msg.content.toString());
          QUpdateAccount(qm);
          logger.info(`New assets came from billing to account: ${qm.accountId}`);
        } catch (e) {
          logger.error('Error handling message:', e);
        }
      }, { noAck: true });
    });
  });

  amqp.connect(listenSuspendedAccount, (err, conn) => {
    if (err) {
      logger.error('Error connecting to RabbitMQ:', err);
      return;
    }

    // eslint-disable-next-line no-shadow
    const q = 'CloudAMQP';
    conn.createChannel((error, ch) => {
      if (error) {
        logger.error('Error creating channel:', error);
        return;
      }

      ch.consume(q, (msg) => {
        try {
          const qm = JSON.parse(msg.content.toString());
          QSuspendAccount(qm);
          logger.info(`Status suspended came from billing to account: ${qm.accountId}`);
        } catch (e) {
          logger.error('Error handling message:', e);
        }
      }, { noAck: true });
    });
  });
};

module.exports = { listenToQ };
