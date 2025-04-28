Project Name:

# Moro-Flix API

Brief Description:
Moro-Flix is a RESTful API that serves as the backend for a movie database application. It provides endpoints for managing user data and movie information, including the ability to register users, authenticate, and perform CRUD (Create, Read, Update, Delete) operations on movies and user data. The API is built using Node.js, Express, and MongoDB, with Mongoose as the ODM (Object Data Modeling) library. Authentication is handled via JSON Web Tokens (JWT).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Prerequisites](#prerequisites)
5. [Setup & Installation](#setup--installation)
6. [Environment Variables](#environment-variables)
7. [Running the Server](#running-the-server)
8. [API Endpoints](#api-endpoints)
9. [JSDoc API Docs](#jsdoc-api-docs)
10. [Author](#author)

---

## Project Overview

MyFlix API powers a minimal movie database and user system:

- **Movies**: store and retrieve details—title, description, genre, director, actors, poster, featured flag.
- **Users**: register/login, update profile, manage a list of favorite movies.
- **Security**: password hashing (bcrypt), JWT tokens (jsonwebtoken), authentication via Passport (local + JWT strategies).
- **Validation**: request-body validation with express-validator.
- **CORS**: configurable origins whitelist.

---

## Features

- **User Registration & Login**
- **JWT-protected routes** for viewing single movies, genres, directors, and user details.
- **Public routes** for listing all movies and registering new users.
- **CRUD** for users: update profile, add/remove favorite movies, delete account.
- **Robust error handling** (validation, CORS, database errors).
- **Auto-generated API docs** via JSDoc.

---

## Technologies Used

- **Node.js** – JavaScript runtime
- **Express** – Web framework
- **MongoDB** – NoSQL database
- **Mongoose** – MongoDB object modeling
- **Passport.js** – Authentication middleware
- **jsonwebtoken** – JWT creation & verification
- **bcrypt / bcryptjs** – Password hashing
- **express-validator** – Request input validation
- **cors** – Cross-origin resource sharing
- **morgan** – HTTP request logging
- **dotenv** – Environment variable loading
- **JSDoc** – Auto-generated API documentation

---

## Prerequisites

- [Node.js](https://nodejs.org/) v14+
- [MongoDB](https://www.mongodb.com/) running locally or in the cloud

---

## Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/hostech83/myflix-api.git
   cd myflix-api
   Install dependencies
   ```

bash
Copy code
npm install
Configure environment (see next section)

# Environment Variables

Create a file named .env in the project root with:

dotenv
Copy code
PORT=8080
CONNECTION_URI=mongodb://127.0.0.1:27017/movie_api
JWT_SECRET=your_super_secret_key
Running the Server
Start

bash
Copy code
npm start
Listens on http://localhost:${PORT} (default 8080).

Logging
HTTP requests are logged with Morgan in “common” format.

Error handling

Validation errors → 400

CORS violations → 403

Other server/database errors → 500

# Usage

See the API documentation for detailed info.

# API Endpoints

Authentication
POST /login
Authenticate with { username, password } → returns { user, token }

Movies (public)
GET /movies
List all movies

GET /movies/:title
Get movie by title (JWT required)

Genres & Directors
GET /genres/:name
Genre info (JWT required)

GET /directors/:name
Director info (JWT required)

Users
POST /users
Register new user

GET /users
List all users

GET /users/:username
Get user profile (JWT required)

PUT /users/:username
Update user info (JWT required)

DELETE /users/:username
Delete account (JWT required)

Favorites
POST /users/:username/movies/:movieId
Add to favorites (JWT required)

DELETE /users/:username/movies/:movieId
Remove from favorites (JWT required)

# JSDoc API Docs

Generate and browse up-to-date docs:

bash
Copy code
npm install --save-dev jsdoc
npx jsdoc -c jsdoc.js
Open the HTML files in the docs/ folder.

# Author

Houssni Msehel
