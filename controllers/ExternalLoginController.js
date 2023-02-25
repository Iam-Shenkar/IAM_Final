const {
  User,
  Account,
} = require('../repositories/repositories.init');
const {statusCheck} = require("../services/authService");
const {freePlan2Q} = require("../Q/sender");

const handleExternalCallBack = async (req, res) => {
  const findUser = await User.retrieve({ email: req.authInfo.email });
  const account = await Account.retrieve({ name: findUser.email });
  if(req.authInfo.newFlag === 1){
    await freePlan2Q(account._id.toString());
  }
  await statusCheck(findUser, User)
  await Account.update({ _id: account._id.toString() }, { status: 'active' });
  await User.update({ email: findUser.email }, { accountId: account._id.toString(), status: 'active' });
  // cookies
  res.cookie('jwt', req.authInfo.refToken, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  await User.update(
    { email: findUser.email },
    {
      loginDate: new Date(),
      refreshToken: req.authInfo.refToken,
    },
  );
  res.cookie('email', findUser.email);
  res.cookie('name', findUser.name);
  res.cookie('role', findUser.type);
  res.cookie('account', findUser.accountId);
  res.redirect('/');
};

module.exports = { handleExternalCallBack };
