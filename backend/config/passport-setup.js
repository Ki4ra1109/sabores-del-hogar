const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    (accessToken, refreshToken, profile, done) => {
      const userProfile = {
        id: profile.id,
        nombre: profile.name.givenName,
        apellido: profile.name.familyName,
        email: profile.emails[0].value,
      };

      done(null, userProfile);
    }
  )
);