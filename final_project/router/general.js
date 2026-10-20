
const express = require('express');
const axios = require('axios');

const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Task 7: Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'User already exists!'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered. Now you can login'
  });
});

// Task 2: Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Task 3: Get book details by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (!Object.prototype.hasOwnProperty.call(books, isbn)) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  return res.status(200).json(books[isbn]);
});

// Task 4: Get books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const matchingBooks = Object.fromEntries(
    Object.entries(books).filter(
      ([isbn, book]) =>
        book.author.toLowerCase().includes(author)
    )
  );

  return res.status(200).json(matchingBooks);
});

// Task 5: Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const matchingBooks = Object.fromEntries(
    Object.entries(books).filter(
      ([isbn, book]) =>
        book.title.toLowerCase().includes(title)
    )
  );

  return res.status(200).json(matchingBooks);
});

// Task 6: Get book reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  return res.status(200).json(book.reviews);
});

// Task 11: Async/Await with Axios
// These functions demonstrate asynchronous book retrieval.

const API_URL = 'http://localhost:5000';

// Retrieve all books asynchronously
async function getAllBooks() {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving books:', error.message);
    throw error;
  }
}

// Retrieve a book by ISBN asynchronously
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(
      `${API_URL}/isbn/${encodeURIComponent(isbn)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error retrieving book by ISBN:', error.message);
    throw error;
  }
}

// Retrieve books by author asynchronously
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(
      `${API_URL}/author/${encodeURIComponent(author)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error retrieving books by author:', error.message);
    throw error;
  }
}

// Retrieve books by title asynchronously
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(
      `${API_URL}/title/${encodeURIComponent(title)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error retrieving books by title:', error.message);
    throw error;
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
