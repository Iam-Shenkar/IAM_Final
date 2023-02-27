const express = require('express');

const usersRouter = new express.Router();
const usersController = require('../controllers/usersController');
const { checkPermissionAdmin, checkPermission } = require('../middleware/validatorService');
const { validation } = require('../middleware/validator');

usersRouter.get('/role', usersController.getRole);
usersRouter.get('/list', checkPermissionAdmin, usersController.getUsers);
usersRouter.get('/:email', usersController.getUser);
usersRouter.put('/pass', validation, usersController.updatePass);
usersRouter.put('/:email', checkPermission, usersController.updateUser);
usersRouter.delete('/:id', checkPermission, usersController.deleteUser);

module.exports = { usersRouter };
