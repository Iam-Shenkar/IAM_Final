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

jest.mock('../services/accountService');

describe('setSeats', () => {
  beforeEach(() => {
    accountService.Account.update.mockReset();
  });

  it('should update used seats and return remaining seats', async () => {
    const account = new Account({ assets: { usedSeats: 2, seats: 10 } });
    const user = new User({ accountId: account._id });
    const accountId = account._id;

    accountService.getAccountByAccountId.mockResolvedValue(account);
    accountService.getAssetsByAccountId.mockResolvedValue({ usedSeats: account.assets.usedSeats, seats: account.assets.seats });
    accountService.getSeats.mockResolvedValue({ data: { seats: 10 } });
    accountService.Account.update.mockResolvedValue({ nModified: 1 });

    const result = await setSeats(accountId, 3);

    expect(accountService.getAccountByAccountId).toHaveBeenCalledWith(accountId);
    expect(accountService.getAssetsByAccountId).toHaveBeenCalledWith(accountId);
    expect(accountService.getSeats).toHaveBeenCalledWith(accountId);
    expect(accountService.Account.update).toHaveBeenCalledWith({ _id: account._id }, { 'assets.usedSeats': 5 });

    expect(result.status).toBe(200);
    expect(result.message).toBe('OK, used seats has been updated: 5');
    expect(result.data.seats).toBe(5);
  });

  it('should return error message when no available seats', async () => {
    const account = new Account({ assets: { usedSeats: 2, seats: 10 } });
    const user = new User({ accountId: account._id });
    const accountId = account._id;

    accountService.getAccountByAccountId.mockResolvedValue(account);
    accountService.getAssetsByAccountId.mockResolvedValue({ usedSeats: account.assets.usedSeats, seats: account.assets.seats });
    accountService.getSeats.mockResolvedValue({ data: { seats: 2 } });

    const result = await setSeats(accountId, 9);

    expect(accountService.getAccountByAccountId).toHaveBeenCalledWith(accountId);
    expect(accountService.getAssetsByAccountId).toHaveBeenCalledWith(accountId);
    expect(accountService.getSeats).toHaveBeenCalledWith(accountId);

    expect(result.status).toBe(400);
    expect(result.message).toBe('ERROR, no available seats');
    expect(result.data.seats).toBe(-1);
  });
});
