const Portfolio = require('../models/portfolio');
const calculateHoldings = require('../calculateHoldings');
const StockPrice = require('../stockPrice');
// const Transaction = require('../models/transaction')
module.exports = {
  index,
  new: newPortfolio,
  show,
  create,
  delete: deletePortfolio,
  edit,
  update,
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
  Portfolio.findById(req.params.id, async function (err, portfolio) {
    let holdings = calculateHoldings.calculateHoldings(portfolio);

    let tickers = [];
    holdings.forEach(function (s) {
      tickers.push(s.ticker, holdings);
    });
    console.log('check holdings', holdings);
    let prices = [];
    if (holdings[0]) {
      prices = await StockPrice.getStockNoId(tickers);
      prices[0].forEach(function (p, idx) {
        p.shares = holdings[idx].shares;
        p.price = holdings[idx].price;
      });
    }
    res.render(`portfolios/show`, {
      title: 'Portfolio:',
      portfolio,
      // holdings,
      prices,
    });
  });
}

function edit(req, res) {
  console.log('Edit page!');
  Portfolio.findById({ _id: req.params.id }, function (err, portfolio) {
    res.render('portfolios/edit', { title: 'Edit portfolio', portfolio });
  });
}

function update(req, res) {
  console.log('update page!');
  Portfolio.findById({ _id: req.params.id }, function (err, portfolio) {
    portfolio.name = req.body.name;
    portfolio.save();
    res.redirect(`/portfolios/${req.params.id}`);
  });
}
function deletePortfolio(req, res) {
  console.log('delete!');
  Portfolio.findByIdAndDelete({ _id: req.params.id }, function (err) {
    res.redirect('/portfolios');
  });
}
