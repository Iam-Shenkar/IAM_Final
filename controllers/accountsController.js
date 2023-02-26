const axios = require('axios');
const {
  sendInvitation,
  inviteAuthorization,
  inviteNewUser,
  editAuthorization,
  isFeatureExists,
  suspendAccount,
  unSuspendAccount,
  updateWithFeatures,
} = require('../services/accountService');
const {
  Account,
  User,
} = require('../repositories/repositories.init');
const {
  getSeats,
  setSeats,
} = require('../services/assetsService');
const { httpError } = require('../class/httpError');

const inviteUser = async (req, res, next) => {
  try {
    const manager = req.user;
    console.log(manager);
    const {
      accountId,
      email,
    } = req.params;
    const account = await Account.retrieve({ _id: accountId });
    const invitedUser = await User.retrieve({ email });
    const seats = await getSeats(account._id);
    if (seats.data.seats < 1) throw new httpError(400, 'There is not enough seats');
    if (invitedUser) {
      inviteAuthorization(account, invitedUser);
      await sendInvitation(manager, invitedUser);
    } else {
      await inviteNewUser(req.user.name, accountId, email);
    }
    await setSeats(account._id, 1);
    res.status(200)
      .json({ message: 'user invited' });
  } catch (err) {
    next(err);
  }
};

const getAccount = async (req, res, next) => {
  try {
    if (req.params.id === 'none') throw new httpError(404, 'The admin does not have an account');
    const acc = await Account.retrieve({ _id: req.params.id });
    if (!acc) throw new httpError(404, 'account doesnt exist');
    if (acc.status === 'closed') throw new httpError(400, 'account disabled');

    const users = await User.find({ accountId: req.params.id });
    const outputArray = users.reduce((accumulator, currentValue) => [...accumulator,
      {
        Name: currentValue.name,
        email: currentValue.email,
        Role: currentValue.type,
        Status: currentValue.status,
        Edit: '',
      }], []);
    const { features } = acc.assets;
    const asset = {
      // eslint-disable-next-line max-len
      Plan: acc.plan,
      Seats: acc.assets.seats,
      usedSeats: acc.assets.usedSeats,
      remainSeats: acc.assets.seats - acc.assets.usedSeats,
      Credits: acc.assets.credits,
      Features: features,
      accountId: req.params.id,
      name: acc.name,
      status: acc.status,
      togglex: acc.toggle,
    };
    const merged = { ...outputArray, ...asset };

    res.status(200)
      .json(merged);
  } catch (err) {
    next(err);
  }
};

const exlusiveORinclusive = async (req, res, next) => {
  try {
    const {
      accountId,
    } = req.params;
    const response = await axios.get(`https://ab-test-bvtg.onrender.com/experiments/allowChangeAttribute/${accountId}`);
    const { data } = response;
    if (data === true) {
      const account = await Account.retrieve({ _id: accountId });
      const { toggle } = account;
      if (toggle === 'inclusive') {
        await Account.update({ _id: account._id.toString() }, { toggle: 'exclusive' });
      } else {
        await Account.update({ _id: account._id.toString() }, { toggle: 'inclusive' });
      }
    } else {
      throw new httpError(400, 'You can’t switch to exclusive mode because not all your experiments are terminated.');
    }
    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500)
      .send('Server Error');
  }
};

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({});
    const outputArray = [];
    for (let i = 0; i < accounts.length; i += 1) {
      const account = {
        id: accounts[i]._id,
        Name: accounts[i].name,
        Plan: accounts[i].plan,
        Credits: accounts[i].assets.credits,
        Users: accounts[i].assets.usedSeats,
        Status: accounts[i].status,
        Edit: '',
      };
      outputArray.push(account);
    }
    res.status(200)
      .json(outputArray);
  } catch (err) {
    next(err);
  }
};

const editAccount = async (req, res, next) => {
  try {
    if (!req.body || !req.params.id) throw new httpError(400, 'bad Request');
    const acc = await editAuthorization(req.params.id); // check account's status
    const {
      params: { id },
      body,
    } = req;
    if (body.status === 'suspended' && acc.status !== 'suspended') {
      await suspendAccount(acc, body);
      return res.status(200)
        .json({ message: 'account suspended!' });
    }
    if (body.status === 'active' && acc.status !== 'active') {
      await unSuspendAccount(acc, body);
    }

    const isExist = await isFeatureExists(acc._id, body.features);
    const data = {
      'assets.credits': parseInt(acc.assets.credits, 10) + parseInt(body.credits, 10),
      'assets.seats': parseInt(acc.assets.seats, 10) + parseInt(body.seats, 10),
      plan: body.plan,
      status: body.status,
    };

    let updatedAccount;
    if (!isExist) {
      updatedAccount = await updateWithFeatures(id, data, body.features);
    } else {
      updatedAccount = await Account.update({ _id: id }, { ...data });
    }
    if (!updatedAccount) throw new httpError(400, 'Not updated');
    return res.status(200)
      .json({ message: 'account updated!' });
  } catch (err) {
    next(err);
  }
};

// change account status to closed
const disableAccount = async (req, res, next) => {
  try {
    if (!req.params) throw new httpError(400, 'Bad request');
    const acc = await editAuthorization(req.params.id);
    await User.deleteMany({
      accountId: req.params.id,
      type: { $ne: 'manager' },
    });
    await Account.update({ _id: acc._id }, { status: 'closed' });
    await User.update({ accountId: req.params.id }, { status: 'closed' });

    return res.status(200)
      .json({ message: 'account disabled' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  inviteUser,
  Account,
  getAccount,
  getAccounts,
  exlusiveORinclusive,
  editAccount,
  disableAccount,
  isFeatureExists,
};
