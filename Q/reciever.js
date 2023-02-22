const amqp = require('amqplib/callback_api');

const { QUpdateAccount } = require('../services/accountService');
const { QSuspendAccount } = require('../services/accountService');

const { listenSubscription } = process.env;
const { listenSuspendedAccount } = process.env;

const listenToQ = () => {
  const q = 'CloudAMQP';
  console.log('waiting for a message from Billing in %s', q);
  amqp.connect(listenSubscription, (err, conn) => {
    conn.createChannel((error, ch) => {
      ch.consume(q, (msg) => {
        const qm = (JSON.parse(msg.content.toString()));
        QUpdateAccount(qm);
        console.log(`new assets came from billing to account: ${qm.accountId}`);
      }, { noAck: true });
    });
  });

  amqp.connect(listenSuspendedAccount, (err, conn) => {
    // eslint-disable-next-line no-shadow
    const q = 'CloudAMQP';
    conn.createChannel((error, ch) => {
      ch.consume(q, (msg) => {
        const qm = (JSON.parse(msg.content.toString()));
        QSuspendAccount(qm);
        console.log(`status suspended came from billing to account: ${qm.accountId}`);
      }, { noAck: true });
    });
  });
};

module.exports = { listenToQ };
