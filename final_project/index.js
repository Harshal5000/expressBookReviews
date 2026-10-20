
const express = require('express');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

// Parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure sessions for registered users
app.use(
  '/customer',
  session({
    secret: process.env.SESSION_SECRET || 'fingerprint_customer',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// Authentication is handled by the JWT middleware
// inside router/auth_users.js for /auth routes.

// Registered-user routes
app.use('/customer', customer_routes);

// Public book-search and registration routes
app.use('/', genl_routes);

// Handle unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Book Review API running at http://localhost:${PORT}`);
});
