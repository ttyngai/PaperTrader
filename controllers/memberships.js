const User = require('../models/user');
module.exports = {
  premium,
};
function premium(req, res) {
  User.findById({ _id: req.user.id }, function (err, user) {
    user.premium = !user.premium;
    user.save();
    // Delay since sometimes basic user button doesn't register
    setTimeout(function () {
      res.redirect('back');
    }, 50);
  });
}
