const User = require('../models/user');

module.exports = {
  premium,
};

function premium(req, res) {
  User.findById({ _id: req.user.id }, function (err, user) {
    user.premium = !user.premium;
    user.save();
    res.redirect('back');
  });
}
