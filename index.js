const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Custom middleware to log the request URL and time
let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};

let requestTime = (req, res, next) => {
  req.requestTime = Date.now();
  next();
};

app.use(myLogger);
app.use(requestTime);

// Top movies data
let topMovies = [
  {
    title: "Inception",
    director: "Christopher Nolan",
  },
  {
    title: "The Matrix",
    director: "Lana Wachowski, Lilly Wachowski",
  },
  {
    title: "The Godfather",
    director: "Francis Ford Coppola",
  },
];

// Routes
app.get("/", (req, res) => {
  let responseText = "Welcome to my movies club!";
  responseText +=
    "<small>Requested at: " +
    new Date(req.requestTime).toLocaleString() +
    "</small>";
  res.send(responseText);
});

app.get("/documentation", (req, res) => {
  res.sendFile("documentation.html", { root: __dirname + "/public" });
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/secreturl", (req, res) => {
  let responseText = "This is a secret url with super top-secret content.";
  responseText +=
    "<small>Requested at: " +
    new Date(req.requestTime).toLocaleString() +
    "</small>";
  res.send(responseText);
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
