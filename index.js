const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const Models = require("./models.js");
const { check, validationResult } = require("express-validator");

const Movie = Models.Movie;
const User = Models.User;

const app = express();
app.use(express.json());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const passport = require("passport");
require("./passport");
const cors = require("cors");
app.use(cors());

//mongo_URI=mongodb://127.0.0.1:27017/movie_api
// REPLACEMENT FOR "app.use(cors());" when you only wanna allow requests from specific origins
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "http://localhost:4200",
  "http://localhost:3000",
  "https://joyful-yeot-c8b973.netlify.app",
  "https://hostech83.github.io",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true); // Allow requests with no origin (like mobile apps or Postman)
      }
      const message = `The CORS policy for this application doesn’t allow access from origin ${origin}`;
      console.error(message); // Log blocked origin for debugging
      return callback(new Error(message), false);
    },
  })
);

console.log("CONNECTION_URI:", process.env.CONNECTION_URI); // Debugging line

mongoose
  .connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message.includes("CORS")) {
    res.status(403).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Define API routes
app.get("/", (req, res) => {
  res.send("Welcome to Moro Flix API");
});

// GET all movies
app.get(
  "/movies",
  //passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const movies = await Movie.find();
      res.status(200).json(movies);
    } catch (error) {
      next(error);
    }
  }
);

// GET a movie by title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const movie = await Movie.findOne({ title: req.params.title });
      if (!movie) return res.status(404).json({ message: "Movie not found" });
      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }
);

// GET movies by genre
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const genreName = req.params.name;
      const movies = await Movie.find({ "genre.name": genreName });
      if (!movies.length) {
        return res.status(404).json({ message: "Genre not found" });
      }
      res.status(200).json(movies.map((movie) => movie.genre));
    } catch (error) {
      next(error);
    }
  }
);

// GET directors by name
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const directorName = req.params.name;
      const movies = await Movie.find({ "director.name": directorName });
      if (!movies.length) {
        return res.status(404).json({ message: "Director not found" });
      }
      res.status(200).json(movies.map((movie) => movie.director));
    } catch (error) {
      next(error);
    }
  }
);

//GET all users
app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// Get user by username
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
/**
 * @route POST /users
 * @summary Register a new user
 * @param {string} username.body.required - Must be at least 5 characters and alphanumeric
 * @param {string} password.body.required - Required password field
 * @param {string} email.body.required - Valid email address
 * @param {string} birthday.body.required - User's date of birth
 * @returns {object} 201 - The newly created user
 * @returns {object} 400 - Validation errors
 * @returns {object} 500 - Internal server error
 */
app.post(
  "/users",
  [
    check("username", "Username is required").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - Not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
    check("birthday", "Birthday is required").not().isEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, birthday } = req.body;
    const hashPassword = User.hashPassword(password);

    const user = await Users.findOne({ username: username });

    if (user) {
      return res
        .status(409)
        .json({ errors: "Another user with the same username already exists" });
    }

    try {
      const newUser = new User({
        username,
        password: hashPassword,
        email,
        birthday,
      });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PUT /users/:username
 * @summary Update user information
 * @param {string} username.path.required - Username of the user to update
 * @returns {object} 200 - Updated user object
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Internal server error
 */
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { username: req.params.username },
        req.body,
        { new: true }
      );
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /users/:username/movies/:movieId
 * @summary Add a movie to a user's list of favorites
 * @param {string} username.path.required - Username of the user
 * @param {string} movieId.path.required - ID of the movie to add
 * @returns {object} 200 - Updated user object with added movie
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Internal server error
 */
app.post(
  "/users/:username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.favoriteMovies.includes(req.params.movieId)) {
        user.favoriteMovies.push(req.params.movieId);
        await user.save();
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /users/:username/movies/:movieId
 * @summary Remove a movie from a user's favorites
 * @param {string} username.path.required - Username of the user
 * @param {string} movieId.path.required - ID of the movie to remove
 * @returns {object} 200 - Updated user object
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Internal server error
 */
app.delete(
  "/users/:username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      if (!user) return res.status(404).json({ message: "User not found" });

      user.favoriteMovies.pull(req.params.movieId);
      await user.save();

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /users/:username
 * @summary Delete a user account
 * @param {string} username.path.required - Username of the user to delete
 * @returns {object} 200 - Confirmation message
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Internal server error
 */
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const user = await User.findOneAndDelete({
        username: req.params.username,
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ message: "User deleted" });
    } catch (error) {
      next(error);
    }
  }
);
/**
 * @route POST /login
 * @summary Authenticates user and returns a JWT token
 * @description Handled in the external "auth.js" module. The user provides a username and password,
 * and receives a signed JWT if credentials are valid.
 */
require("./auth")(app);

/**
 * @function listen
 * @summary Starts the server on the specified port
 * @param {number} port - The port number from environment or default 8080
 * @returns {void}
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
