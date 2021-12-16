const Portfolio = require('../models/portfolio');

module.exports = {
  index,
  new: newPortfolio,
  show,
  create,
};

async function index(req, res) {
  const portfolios = await Portfolio.find({});
  //   res.render('stocks/index', { title: 'All Stocks', stocks });
  res.render('portfolios/index', { title: 'All Portfolios' });
}
function newPortfolio(req, res) {
  res.render('portfolios/new', { title: 'New Portfolio' });
}
function create(req, res) {
  const portfolio = new Portfolio(req.body);
  portfolio.save(function (err) {
    // one way to handle errors
    if (err) {
      console.log(err);
      return res.redirect('/portfolios/new');
    }
    console.log(portfolio);
    res.redirect(`/portfolio/${portfolio._id}`);
  });
}

function show(req, res) {}
