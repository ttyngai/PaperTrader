var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var methodOverride = require('method-override');
const isLoggedIn = require('./config/auth');

var indexRouter = require('./routes/index');
var portfoliosRouter = require('./routes/portfolios');
var stocksRouter = require('./routes/stocks');
var transactionsRouter = require('./routes/transactions');

// This will load our env variables
require('dotenv').config();

// This will connect us to the database
require('./config/database');

// require the passport module
require('./config/passport');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(methodOverride('_method'));
//express session middleware needs to be after cookieParser
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  // add req.user to res.locals
  res.locals.user = req.user;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/portfolios', isLoggedIn, portfoliosRouter);
app.use('/stocks', isLoggedIn, stocksRouter);
app.use('/', isLoggedIn, transactionsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
