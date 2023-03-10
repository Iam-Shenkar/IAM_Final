const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');

const { userRole } = require('../middleware/validatorService');
const { sendEmail } = require('../sendEmail/sendEmail');
const { httpError } = require('../class/httpError');

const {
  User,
  oneTimePass,
} = require('../repositories/repositories.init');

const createOneTimePass = async (email) => {
  const sendCode = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  if (!sendCode) throw new httpError(400, 'No new OTP created');
  const newOneTimePass = {
    email,
    code: sendCode,
    creationDate: new Date(),
  };
  if (!newOneTimePass) throw new httpError(400, 'No new OTP created');

  await oneTimePass.create(newOneTimePass);
  return newOneTimePass;
};

const existCode = async (email) => {
  const userEmail = email.toLowerCase();
  const userCode = await oneTimePass.retrieve({ email: userEmail });
  return userCode;
};

const deleteFormOTP = async (data) => {
  const email = data.toLowerCase();
  if (await existCode(email)) {
    const deletedOTP = await oneTimePass.delete({ email });
    if (!deletedOTP) throw new httpError(400, 'Failed to delete OTP');
  }
};

const otpCompare = async (UserCode, userCode) => {
  if (userCode !== UserCode) throw new httpError(400, 'Incorrect code');
};

const sendEmailOneTimePass = async (user, newCode) => {
  const mailData = {
    path: '/sendEmail/oneTimePass.ejs',
    subject: 'Please Verify you Account',
    email: user.email,
  };
  const details = {
    name: `${user.name}`,
    code: `${newCode.code}`,
  };
  await sendEmail(mailData, details);
};

const createUser = async (user) => {
  const hashPassword = await bcrypt.hash(user.password, 12);
  let newUser = {};
  if (userRole(user.email) !== 'admin') {
    newUser = {
      name: user.name,
      email: user.email,
      accountId: 'none',
      password: hashPassword,
    };
    console.log(newUser);
  } else {
    newUser = {
      name: user.name,
      email: user.email,
      type: 'admin',
      accountId: 'none',
      password: hashPassword,
    };
  }
  await User.create(newUser);
};

const codeTime = async (user, timeCode) => {
  const time = Math.abs(new Date().getMinutes() - user.creationDate.getMinutes());
  return time < timeCode;
};

module.exports = {
  codeTime,
  sendEmailOneTimePass,
  createUser,
  otpCompare,
  deleteFormOTP,
  existCode,
  createOneTimePass,
};
