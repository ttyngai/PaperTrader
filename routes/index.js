var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/', function (req, res, next) {
  res.redirect('/portfolios');
});

// Google OAuth login
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

//Google OAuth callback route
router.get(
  '/oauth2callback',
  passport.authenticate('google', {
    successRedirect: '/portfolios',
    failureRedirect: '/portfolios',
  })
);

// OAuth logout route
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/portfolios');
});

module.exports = router;
