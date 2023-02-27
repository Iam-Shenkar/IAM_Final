const { Account, User } = require('../repositories/repositories.init');
const accountService = require('../services/accountService');
const { httpError } = require('../class/httpError');
const assetsService = require('../services/assetsService');
const { getAccountByAccountId, setSeats } = require('../services/assetsService');

describe('getAccountByAccountId', () => {
  it('should throw an error if accountId is not provided', async () => {
    await expect(getAccountByAccountId())
      .rejects
      .toThrow(httpError);
  });

  it('should throw an error if couldn\'t find account', async () => {
    const fakeAccountId = 'fakeAccountId';
    jest.spyOn(Account, 'retrieve')
      .mockImplementation(() => null);

    await expect(getAccountByAccountId(fakeAccountId))
      .rejects
      .toThrow(httpError);
  });

  it('should return account when account is found', async () => {
    const fakeAccountId = 'fakeAccountId';
    const fakeAccount = { _id: fakeAccountId };
    jest.spyOn(Account, 'retrieve')
      .mockImplementation(() => fakeAccount);

    const result = await assetsService.getAccountByAccountId(fakeAccountId);

    expect(result)
      .toEqual(fakeAccount);
  });
});
