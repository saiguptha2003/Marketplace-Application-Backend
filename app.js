require('dotenv').config(); // Load environment variables from .env file

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); // Import express-session
const productsRouter = require('./routes/products');
const cors = require('cors'); // Import the cors package

var authRouter = require('./routes/auth'); // Import the auth routes
var userProductsRouter = require('./routes/userProducts'); // Update the import statement
var ordersRouter = require('./routes/orders');
var app = express();

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// CORS options
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://marketplace-application-backend.onrender.com',
        'https://marketplace-pactos.netlify.app'  // Add the Netlify frontend URL
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Use CORS middleware with options
app.use(cors(corsOptions));

app.use('/api/auth', authRouter);
app.use('/api/user-products', userProductsRouter); // Use the user products routes under /api/user-products
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      details: res.locals.error
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
