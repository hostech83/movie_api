const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const Models = require("./models.js");

const Movie = Models.Movie;
const User = Models.User;

const app = express();
app.use(express.json());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to MongoDB
const mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/movie_api";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Connection error", err);
  });

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Define API routes

// GET all movies
app.get("/movies", async (req, res, next) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
});

// GET a movie by title
app.get("/movies/:title", async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ title: req.params.title });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
});

// GET movies by genre
app.get("/genres/:name", async (req, res, next) => {
  try {
    const genreName = req.params.name;
    console.log(`Searching for movies in genre: ${genreName}`);

    const movies = await Movie.find({ "genre.name": genreName });
    if (!movies.length) {
      console.log("No movies found for genre:", genreName);
      return res.status(404).json({ message: "Genre not found" });
    }

    console.log(`Found ${movies.length} movies for genre: ${genreName}`);
    res.status(200).json(movies.map((movie) => movie.genre));
  } catch (error) {
    console.error("Error fetching movies for genre:", error);
    next(error);
  }
});

// GET directors by name
app.get("/directors/:name", async (req, res, next) => {
  try {
    const directorName = req.params.name;
    console.log(`Searching for movies by director: ${directorName}`);

    const movies = await Movie.find({ "director.name": directorName });
    if (!movies.length) {
      console.log("No movies found for director:", directorName);
      return res.status(404).json({ message: "Director not found" });
    }

    console.log(`Found ${movies.length} movies for director: ${directorName}`);
    res.status(200).json(movies.map((movie) => movie.director));
  } catch (error) {
    console.error("Error fetching movies for director:", error);
    next(error);
  }
});

// GET all users
app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// POST a new user
app.post("/users", async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// PUT to update user info
app.put("/users/:username", async (req, res, next) => {
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
});

// POST to add a movie to the user's favorites
app.post("/users/:username/movies/:movieId", async (req, res, next) => {
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
});

// DELETE a movie from the user's favorites
app.delete("/users/:username/movies/:movieId", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favoriteMovies.pull(req.params.movieId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE a user
app.delete("/users/:username", async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}.`);
});
