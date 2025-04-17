const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Models = require("./models");
const passportJWT = require("passport-jwt");
const User = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwtSecret = process.env.JWT_SECRET; // Use the JWT secret from environment variable

// LocalStrategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, callback) => {
      try {
        const user = await User.findOne({ username: username });

        if (!user) {
          return callback({ message: "Incorrect username" }, false);
        }
        if (!user.validatePassword(password)) {
          return callback({ message: "Incorrect password" }, false);
        }
        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    }
  )
);

// JWTStrategy for verifying JWT tokens
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret, // Make sure to use the secret key here
    },
    (jwtPayload, callback) => {
      return User.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
