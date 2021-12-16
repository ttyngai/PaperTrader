const Portfolio = require('../models/portfolio');
// const Transaction = require('../models/transaction')
module.exports = {
  index,
  new: newPortfolio,
  show,
  create,
};

async function index(req, res) {
  const portfolios = await Portfolio.find({ user: req.user });
  console.log('current user', req.user);
  //   res.render('stocks/index', { title: 'All Stocks', stocks });
  res.render('portfolios/index', { title: 'All Portfolios', portfolios });
}

function newPortfolio(req, res) {
  res.render('portfolios/new', { title: 'New Portfolio' });
}
function create(req, res) {
  // console.log(req.body);
  const portfolio = new Portfolio(req.body);
  portfolio.user = req.user._id;
  portfolio.userName = req.user.name;
  portfolio.userAvatar = req.user.avatar;
  portfolio.save(function (err) {
    // one way to handle errors
    if (err) {
      console.log(err);
      return res.redirect('/portfolios/new');
    }
    console.log(portfolio);
    res.redirect(`/portfolios/${portfolio._id}`);
  });
}

function show(req, res) {
  Portfolio.findById(req.params.id, function (err, portfolio) {
    console.log('This', req.params.id);
    console.log('This', portfolio);
    res.render(`portfolios/show`, { title: 'Portfolio:', portfolio });
  });
}
