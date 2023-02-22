const express = require('express');

const authRouter = new express.Router();
const passport = require('passport');

const loginController = require('../controllers/loginController');
const { generateToken } = require('../middleware/authenticate');
const registerController = require('../controllers/registerController');
const logoutController = require('../controllers/logoutController');
const googleController = require('../controllers/googleController');
const linkedinController = require('../controllers/linkedinController');

authRouter.post('/logout', logoutController.logout);

authRouter.post('/login', generateToken, loginController.loginControl);
authRouter.put('/login/password', loginController.forgotPassControl);

authRouter.post('/register', registerController.handleRegister);
authRouter.post('/register/code', registerController.handleConfirmCode);
authRouter.get('/:accountId/users/:email/confirmation', registerController.confirmationUser);

authRouter.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), googleController.handleGoogleCallBack);
authRouter.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile', 'w_member_social'] }));
authRouter.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/error' }), linkedinController.handleLinkedinCallBack);

module.exports = { authRouter };
