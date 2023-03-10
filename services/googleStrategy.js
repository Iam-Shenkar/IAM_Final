const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const jwt = require('jsonwebtoken');
const { Account, User } = require('../repositories/repositories.init');
const GOOGLE_CLIENT_ID = process.env.ClientId;
const GOOGLE_CLIENT_SECRET = process.env.ClientSecret;
const { runningPath } = process.env;

passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${runningPath}/auth/google/callback`,
  },
  async (request, accessToken, refreshToken, profile, done) => {
    let newFlag = 0;
    const {
      displayName: username,
      email,
    } = profile;
    const findUser = await User.retrieve({ email });
    if (!findUser) {
      await User.create({
        name: username,
        email,
        password: 'null',
        loginDate: new Date(),
        status: 'active',
      });
      await Account.create({ name: email });
      await Account.retrieve({name: email})
      newFlag = 1;
    }
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
    await User.update({ email }, { refreshToken: refToken });
    const user = await User.retrieve({ email });

    const data = {
      token,
      refToken,
      email,
      newFlag
    };
    return done(null, user, data);
  },
));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
