const amqp = require('amqplib/callback_api');
const { QUpdateAccount } = require('../services/accountService');
const { QSuspendAccount } = require('../services/accountService');

const {
  listenSubscription,
  listenSuspendedAccount,
} = process.env;

const listenToQ = () => {
  const q = 'CloudAMQP';
  console.log('Waiting for a message from Billing in %s', q);

  amqp.connect(listenSubscription, (err, conn) => {
    if (err) {
      console.error('Error connecting to RabbitMQ:', err);
      return;
    }

    conn.createChannel((error, ch) => {
      if (error) {
        console.error('Error creating channel:', error);
        return;
      }

      ch.consume(q, (msg) => {
        try {
          const qm = JSON.parse(msg.content.toString());
          QUpdateAccount(qm);
          console.log(`New assets came from billing to account: ${qm.accountId}`);
        } catch (e) {
          console.error('Error handling message:', e);
        }
      }, { noAck: true });
    });
  });

  amqp.connect(listenSuspendedAccount, (err, conn) => {
    if (err) {
      console.error('Error connecting to RabbitMQ:', err);
      return;
    }

    // eslint-disable-next-line no-shadow
    const q = 'CloudAMQP';
    conn.createChannel((error, ch) => {
      if (error) {
        console.error('Error creating channel:', error);
        return;
      }

      ch.consume(q, (msg) => {
        try {
          const qm = JSON.parse(msg.content.toString());
          QSuspendAccount(qm);
          console.log(`Status suspended came from billing to account: ${qm.accountId}`);
        } catch (e) {
          console.error('Error handling message:', e);
        }
      }, { noAck: true });
    });
  });
};

module.exports = { listenToQ };
