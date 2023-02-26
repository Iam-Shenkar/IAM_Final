const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  User,
  Account,
} = require('../repositories/repositories.init');
const {
  userExist,
  statusCheck,
  validPassword,
  accountStatusCheck,
} = require('../services/authService');
const {
  generatePassword,
  sendEmailPassword,
} = require('../services/authService');
const { httpError } = require('../class/httpError');
const {
  GoogleVerify,
  GoogleIsExist,
  GoogleExternalCallBack,
} = require('../services/GoogleService');

const loginControl = async (req, res, next) => {
  try {
    const user = await userExist(req.body.email);
    if (!user) throw new httpError(404, 'user not exist');
    if (user.accountId !== 'none') await accountStatusCheck(user.accountId);

    await validPassword(req.body.password, user.password);
    await statusCheck(user, 'User');
    await User.update(
      { email: user.email },
      {
        loginDate: new Date(),
        refreshToken: req.token.refreshToken,
      },
    );
    res.status(200)
      .json({ jwt: req.token.refreshToken, role: user.type, email: user.email });
  } catch (err) {
    next(err);
  }
};

const handleGoogleLogin = async (req, res, next) => {
  const user = await GoogleVerify(req.body.credentials);
  let newFlag = 0;
  if (user === undefined) {
    return res.status(402).json({ message: 'Google Verification didnt work' });
  }
  newFlag = await GoogleIsExist(user);

  const token = jwt.sign({ email: user.payload.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refToken = jwt.sign({ email: user.payload.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
  await User.update({ email: user.payload.email }, { refreshToken: refToken });
  const findUser = await GoogleExternalCallBack(user, newFlag, refToken);
  res.status(200)
    .json({ jwt: refToken, role: findUser.type, email: findUser.email });
};

const forgotPassControl = async (req, res, next) => {
  try {
    const user = await userExist(req.body.email);
    if (!user) throw new httpError(401, 'user does not exist');
    await statusCheck(user, 'User');
    const newPass = generatePassword();
    const hashedPassword = await bcrypt.hash(newPass, 12);
    await sendEmailPassword(newPass, user);
    await User.update(
      { email: user.email },
      { password: hashedPassword },
    );

    return res.status(200)
      .json({ message: 'A new password has been sent to the email' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginControl,
  forgotPassControl,
  handleGoogleLogin,
};
