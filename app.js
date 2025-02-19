require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const swaggerDocument = require('./swagger.json');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session'); 
const productsRouter = require('./routes/products');
const cors = require('cors');

var authRouter = require('./routes/auth'); 
var userProductsRouter = require('./routes/userProducts'); 
var ordersRouter = require('./routes/orders');
var app = express();

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'none', 
        maxAge: 24 * 60 * 60 * 1000 
    },
    proxy: true 
}));

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://marketplace-application-backend.onrender.com',
        'https://marketplace-pactos.netlify.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/api/auth', authRouter);
app.use('/api/user-products', userProductsRouter);
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
