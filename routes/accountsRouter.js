const express = require('express');

const accountsRouter = new express.Router();
const accountController = require('../controllers/accountsController');
const { checkPermissionAdmin } = require('../middleware/validatorService');

accountsRouter.get('/list', checkPermissionAdmin, accountController.getAccounts);
accountsRouter.post('/:accountId/link/:email', accountController.inviteUser);
accountsRouter.get('/:id/', accountController.getAccount);
accountsRouter.put('/:id', checkPermissionAdmin, accountController.editAccount);
accountsRouter.put('/status/:id', checkPermissionAdmin, accountController.disableAccount);

module.exports = { accountsRouter };
