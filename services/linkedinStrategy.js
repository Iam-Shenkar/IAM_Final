const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const Logger = require('abtest-logger');
const {
  User,
  Account,
} = require('../repositories/repositories.init');
const {freePlan2Q} = require("../Q/sender");

const logger = new Logger(process.env.CORE_QUEUE);

const {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  runningPath,
} = process.env;

logger.info('LinkedIn authentication flow started...');

passport.use(new LinkedInStrategy({
  clientID: LINKEDIN_CLIENT_ID,
  clientSecret: LINKEDIN_CLIENT_SECRET,
  callbackURL: `${runningPath}/auth/linkedin/callback`,
  scope: ['r_emailaddress', 'r_liteprofile', 'w_member_social'],
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  // Extract user information from profile
  const _user = {
    linkedinId: profile.id,
    displayName: profile.displayName,
    email: profile.emails[0].value,
  };
  const { email } = _user;
  const findUser = await User.retrieve({ email });
  if (!findUser) {
    await User.create({
      name: _user.displayName,
      email: _user.email,
      password: 'null',
      loginDate: new Date(),
      status: 'active',
    });
    await Account.create({ name: _user.email });
    const account = await Account.retrieve({name: email});
    await freePlan2Q(account._id.toString());
  }

  const token = jwt.sign({ email: _user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refToken = jwt.sign({ email: _user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
  await User.update({ email: _user.email }, { refreshToken: refToken });
  const user = await User.retrieve({ email: _user.email });
  const data = {
    token,
    refToken,
    email,
  };
  return done(null, user, data);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
