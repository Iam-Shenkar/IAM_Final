const amqp = require('amqplib/callback_api');

const { amqpCreateFreePlan } = process.env;
const { amqpSuspendedAccount } = process.env;

const freePlan2Q = async (accountId) => {
  try {
    amqp.connect(amqpCreateFreePlan, (err, conn) => {
      conn.createChannel(async (error, ch) => {
        const q = 'CloudAMQP';
        const freePlan = {
          accountId,
        };
        const stringMsg = JSON.stringify(freePlan);
        ch.assertQueue(q, { durable: false });
        await ch.sendToQueue(q, Buffer.from(stringMsg));
      });
    });
  } catch (error) {
    console.error(`Error while sending message to amqpCreateFreePlan: ${error}`);
  }
};

const newStatus2Q = async (accountId, status) => {
  try {
    amqp.connect(amqpSuspendedAccount, (err, conn) => {
      conn.createChannel(async (error, ch) => {
        const q = 'CloudAMQP';
        const suspendedAccount = {
          accountId,
          subscription: {
            status,
          },
        };
        const stringMsg = JSON.stringify(suspendedAccount);
        ch.assertQueue(q, { durable: false });
        await ch.sendToQueue(q, Buffer.from(stringMsg));
      });
    });
  } catch (error) {
    console.error(`Error while sending message to amqpSuspendedAccount: ${error}`);
  }
};

module.exports = {
  freePlan2Q,
  newStatus2Q,
};
