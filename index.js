const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");

const app = express();

// Middleware
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Sample Data
let movies = [
  {
    title: "Inception",
    description: "A thief who steals corporate secrets...",
    genre: { name: "Sci-Fi", description: "Science Fiction" },
    director: {
      name: "Christopher Nolan",
      bio: "British-American film director...",
      birthYear: 1970,
    },
    imageURL: "https://example.com/inception.jpg",
    featured: true,
  },
  {
    title: "The Matrix",
    description: "A computer hacker learns from mysterious rebels...",
    genre: { name: "Sci-Fi", description: "Science Fiction" },
    director: {
      name: "Lana Wachowski",
      bio: "American film director...",
      birthYear: 1965,
    },
    imageURL: "https://example.com/matrix.jpg",
    featured: true,
  },
  // Add more movies as needed
];

let users = [
  {
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    favoriteMovies: [],
  },
  // Add more users as needed
];

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Movie API!");
});

app.get("/movies", (req, res) => {
  res.json(movies);
});

app.get("/movies/:title", (req, res) => {
  const movie = movies.find((m) => m.title === req.params.title);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send("Movie not found");
  }
});

app.get("/genres/:name", (req, res) => {
  const genre = movies.find((m) => m.genre.name === req.params.name)?.genre;
  if (genre) {
    res.json(genre);
  } else {
    res.status(404).send("Genre not found");
  }
});

app.get("/directors/:name", (req, res) => {
  const director = movies.find(
    (m) => m.director.name === req.params.name
  )?.director;
  if (director) {
    res.json(director);
  } else {
    res.status(404).send("Director not found");
  }
});

// Define the missing GET /users endpoint
app.get("/users", (req, res) => {
  res.json(users);
});

app.post(
  "/users",
  [
    check("username")
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 characters long"),
    check("email").isEmail().withMessage("Invalid email format"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(422).json({ errors: errors.array() });
    }

    const newUser = req.body;
    console.log("New user data:", newUser);
    users.push(newUser);
    res.status(201).send("User registered");
  }
);

app.put("/users/:username", (req, res) => {
  const user = users.find((u) => u.username === req.params.username);
  if (user) {
    Object.assign(user, req.body);
    res.send("User info updated");
  } else {
    res.status(404).send("User not found");
  }
});

app.post("/users/:username/movies/:movieTitle", (req, res) => {
  const user = users.find((u) => u.username === req.params.username);
  if (user) {
    user.favoriteMovies.push(req.params.movieTitle);
    res.send("Movie added to favorites");
  } else {
    res.status(404).send("User not found");
  }
});

app.delete("/users/:username/movies/:movieTitle", (req, res) => {
  const user = users.find((u) => u.username === req.params.username);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== req.params.movieTitle
    );
    res.send("Movie removed from favorites");
  } else {
    res.status(404).send("User not found");
  }
});

app.delete("/users/:username", (req, res) => {
  users = users.filter((u) => u.username !== req.params.username);
  res.send("User deregistered");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}.`);
});
