const GOOGLE_CLIENT_ID = process.env.ClientId;
const { OAuth2Client } = require('google-auth-library');
const {
  User,
  Account,
} = require('../repositories/repositories.init');
const { freePlan2Q } = require('../Q/sender');
const { statusCheck } = require('./authService');

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const GoogleVerify = async (token) => {
  try {
    const ticket = await googleClient.verify({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return undefined;
  }
};

const GoogleIsExist = async (user) => {
  const findUser = await User.retrieve({ email: user.payload.email });
  if (!findUser) {
    await User.create({
      name: user.payload.name,
      email: user.payload.email,
      password: 'null',
      loginDate: new Date(),
      status: 'active',
    });
    await Account.create({ name: user.payload.email });
    await Account.retrieve({ name: user.payload.email });
    return 1;
  }
  return 0;
};

const GoogleExternalCallBack = async (user, newFlag, refToken) => {
  const findUser = await User.retrieve({ email: user.payload.email });
  const account = await Account.retrieve({ name: findUser.email });
  if (newFlag === 1) {
    await freePlan2Q(account._id.toString());
  }
  await statusCheck(findUser, User);
  await Account.update({ _id: account._id.toString() }, { status: 'active' });
  await User.update({ email: findUser.email }, { accountId: account._id.toString(), status: 'active' });
  await User.update(
    { email: findUser.email },
    {
      loginDate: new Date(),
      refreshToken: refToken,
    },
  );
  return findUser;
};

module.exports = {
  GoogleVerify, GoogleIsExist, GoogleExternalCallBack,
};
