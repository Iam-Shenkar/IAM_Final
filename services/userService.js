const { httpError } = require('../class/httpError');
const { User } = require('../repositories/repositories.init');

const updateName = async (user, data) => {
  if (user.email !== data.email) throw new httpError(400, 'you cant update this user');
  if (user.status !== 'active') throw new httpError(400, 'user is closed');
  await User.update({ email: user.email }, { name: data.name });
};

const deleteAuthorization = (user, account, data) => {
  if (user.email === data.email) throw new httpError(400, 'Cant delete yourself');
  if (!account && user.accountId !== 'none') throw new httpError(400, 'Account not exist');
  if (user.accountId !== data.accountId || data.type !== 'admin') throw new httpError(400, 'It is not possible to delete a user who is not in your account');
};

module.exports = {
  updateName,
  deleteAuthorization,
};
