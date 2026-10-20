
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'book-review-dev-secret';

// Check whether a username is already registered
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
  return users.some(
    user =>
      user.username === username &&
      user.password === password
  );
};

// Task 8: Login as a registered user
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const token = jwt.sign(
    { username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken: token,
    username
  };

  return res.status(200).json({
    message: 'User successfully logged in',
    token
  });
});

// Middleware: verify that the user is logged in
regd_users.use('/auth', (req, res, next) => {
  const sessionToken = req.session?.authorization?.accessToken;

  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  const token = bearerToken || sessionToken;

  if (!token) {
    return res.status(401).json({
      message: 'Please login first'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token'
    });
  }
});

// Task 9: Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review || req.body?.review;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'Review cannot be empty'
    });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  const alreadyReviewed = Object.prototype.hasOwnProperty.call(
    books[isbn].reviews,
    req.username
  );

  books[isbn].reviews[req.username] = review.trim();

  return res.status(200).json({
    message: alreadyReviewed
      ? 'Book review updated successfully'
      : 'Book review added successfully',
    reviews: books[isbn].reviews
  });
});

// Task 10: Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (
    !books[isbn].reviews ||
    !Object.prototype.hasOwnProperty.call(
      books[isbn].reviews,
      req.username
    )
  ) {
    return res.status(404).json({
      message: 'You have not reviewed this book'
    });
  }

  delete books[isbn].reviews[req.username];

  return res.status(200).json({
    message: 'Book review deleted successfully',
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
