const { Account } = require('../repositories/repositories.init');
const accountService = require('../services/accountService');
const { httpError } = require('../class/httpError');

describe('isFeatureExists', () => {
  it('returns true if the feature exists in the account features', async () => {
    const accountId = 'testAccountId';
    const feature = 'testFeature';
    const mockAccount = {
      assets: {
        features: [feature],
      },
    };
    jest.spyOn(Account, 'retrieve').mockResolvedValue(mockAccount);

    const result = await accountService.isFeatureExists(accountId, feature);

    expect(Account.retrieve).toHaveBeenCalledWith({ _id: accountId });
    expect(result).toBe(true);
  });

  it('returns false if the feature does not exist in the account features', async () => {
    const accountId = 'testAccountId';
    const feature = 'testFeature';
    const mockAccount = {
      assets: {
        features: ['anotherFeature'],
      },
    };
    jest.spyOn(Account, 'retrieve').mockResolvedValue(mockAccount);

    const result = await accountService.isFeatureExists(accountId, feature);

    expect(Account.retrieve).toHaveBeenCalledWith({ _id: accountId });
    expect(result).toBe(false);
  });
});
//
// describe('updateWithFeatures', () => {
//   it('updates the account with the new feature', async () => {
//     const accountId = 'testAccountId';
//     const mockAccount = {
//       assets: {
//         features: [],
//       },
//     };
//     const data = { name: 'Test Account', email: 'test@example.com' };
//     const feature = 'testFeature';
//     const expectedUpdate = {
//       _id: accountId,
//       ...data,
//       $push: { 'assets.features': feature },
//     };
//     jest.spyOn(Account, 'update').mockResolvedValue(mockAccount);
//
//     await accountService.updateWithFeatures(accountId, data, feature);
//
//     expect(Account.update).toHaveBeenCalledWith(expectedUpdate);
//   });
// });
describe('editAuthorization'), () => {

}
