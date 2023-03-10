const bcrypt = require('bcrypt');
const jwtDecode = require('jsonwebtoken');
// const { cookie } = require('express-validator');
const cookies = require('cookie-parser');
const {
  Account,
  User,
} = require('../repositories/repositories.init');

const {
  updateName,
  adminUpdateUser,
  deleteAuthorization,
} = require('../services/userService');
const { validPassword } = require('../services/authService');
const { setSeatsAdmin } = require('../services/assetsService');
const { httpError } = require('../class/httpError');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});

    const outputArray = users.reduce((accumulator, currentValue) => [
      ...accumulator,
      {
        id: currentValue._id,
        Name: currentValue.name,
        email: currentValue.email,
        Role: currentValue.type,
        Status: currentValue.status,
        Edit: '',
      },
    ], []);
    res.status(200)
      .json(outputArray);
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    let accountName = 'none';
    const user = await User.retrieve({ email: req.params.email });
    if (user.type !== 'admin') {
      const account = await Account.retrieve({ _id: user.accountId });
      accountName = account.name;
    }
    const del = {
      name: user.name,
      email: user.email,
      role: user.type,
      status: user.status,
      account: accountName,
    };
    res.status(200)
      .json(del);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { user } = req;
    const data = req.body;
    await updateName(user, data);
    return res.status(200)
      .json({ message: 'user update' });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.retrieve({ _id: req.params.id });
    let account;
    if (user.accountId === 'none') account = 'none';
    if (user.accountId !== 'none') account = await Account.retrieve({ _id: user.accountId });
    deleteAuthorization(user, account, req.user);

    if (account.plan === 'free' && user.type === 'manager') {
      await Account.update({ _id: account._id }, { status: 'closed' });
      await User.update({ email: user.email }, { status: 'closed' });
    } else {
      await User.delete({ email: user.email });
      await setSeatsAdmin(user.accountId, -1);
    }
    res.send();
  } catch (e) {
    next(e);
  }
};

const updatePass = async (req, res, next) => {
  try {
    const user = await User.retrieve({ email: req.body.email });
    await validPassword(req.body.password, user.password);
    const newPass = await bcrypt.hash(req.body.newPassword, 12);
    await User.update({ email: user.email }, { password: newPass });
    res.status(200)
      .json('Password Updated');
  } catch (e) {
    res.status(403)
      .json(e.message);
  }
};

const getRole = async (req, res) => {
  const jwt = req.headers.authorization;
  // const jwt = req.body.email;
  console.log(`jwt : ${jwt}`);
  const decoded = jwtDecode.decode(jwt);
  console.log(`decoded: ${decoded.email}`);
  const user = await User.retrieve({ email: decoded.email });
  if (!user) {
    throw new httpError(404, 'User was not found');
  } else {
    return res.status(200)
      .json({ role: user.type });
  }
};

module.exports = {
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  updatePass,
  getRole,
};
