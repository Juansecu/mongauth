require('dotenv').config();

var path = require('path');

var cookieParser = require('cookie-parser');
var express = require('express');
var createError = require('http-errors');
const mongoose = require('mongoose');
var logger = require('morgan');

var authRouter = require('./routes/auth.router');
var indexRouter = require('./routes/index');
var ordersRouter = require('./routes/orders.router');
var productsRouter = require('./routes/products.router');
var usersRouter = require('./routes/users.router');

var app = express();

let connection;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ------ DATABASE CONNECTION ------
mongoose
    .connect(process.env.CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() =>
        console.log('Connection to database has been established successfully!')
    )
    .catch(console.error);

connection = mongoose.connection;

connection.on('error', () => console.log('Error connection to database.'));
connection.once('open', () => console.log('Connected to database.'));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404, 'The endpoint does not exist.'));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        errorCode: err.status || 500,
        message: res.locals.message
    });
});

module.exports = app;
