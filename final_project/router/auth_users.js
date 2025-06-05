const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
}


//only registered users can login
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;

  // Ensure session authorization exists
  if (!req.session.authorization) {
    return res.status(403).json({ message: "Unauthorized access. Please log in." });
  }

  const username = req.session.authorization.username; // Retrieve username from session

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content required" });
  }

  // Add or modify the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Ensure session authorization exists
  if (!req.session.authorization) {
    return res.status(403).json({ message: "Unauthorized access. Please log in." });
  }

  const username = req.session.authorization.username; // Retrieve username from session
  const bookId = parseInt(isbn); // Convert to number to match books database

  // Check if book exists
  if (!books[bookId]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure reviews exist and that the user has reviewed this book
  if (!books[bookId].reviews || !books[bookId].reviews[username]) {
    return res.status(404).json({ message: "You haven't reviewed this book" });
  }

  // Delete the user's review
  delete books[bookId].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully", reviews: books[bookId].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
