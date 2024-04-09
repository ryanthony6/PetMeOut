const {Router} = require('express')
const router = Router()
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const UserData = require("../../models/userData");
const GoogleData = require("../../models/googleData");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await UserData.findOne({ email });

        if (!user) {
          return done(null, false, {
            message: "Email not found or incorrect password",
          });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, {
            message: "Email not found or incorrect password",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserData.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true
    },

    async function (req, accessToken, refreshToken, profile, done) {
      try {
        const user = await GoogleData.findOne({ googleId: profile.id });

        if (user) {
          console.log("User authenticated successfully:", user);
          // Tandai pengguna sebagai terautentikasi
          return done(null, user);
        } else {
          const newUser = new GoogleData({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            isAdmin: false,
          });
          console.log("New user registered and authenticated:", user);
          // Tandai pengguna sebagai terautentikasi
          return done(null, newUser);
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;