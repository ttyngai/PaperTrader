const Stock = require('../models/stock');
const Portfolio = require('../models/portfolio');
const StockPrice = require('../stockPrice');
module.exports = {
  index,
  show,
  create,
};

async function index(req, res) {
  // pass in array of tickers
  let tickers = [];

  Stock.find({ user: req.user }, async function (err, stocksFound) {
    stocksFound.forEach(function (s) {
      tickers.push(s.ticker);
    });
    stocksToRender = stocksFound;
    const stocks = await StockPrice.getStock(tickers, stocksFound);

    res.render('stocks/index', { title: 'stocks', stocks });
  });
}

function show(req, res) {
  console.log('Show Stock');
  Stock.findById(req.params.id, function (err, stock) {
    Portfolio.find({ user: req.user._id }, function (err, portfolios) {
      res.render('stocks/show', { title: 'Stock Details', stock, portfolios });
    });
  });
}
function create(req, res) {
  // Check stock

  const stock = new Stock(req.body);
  stock.user = req.user._id;
  stock.save(function (err) {
    if (err) {
      console.log(err);
      return res.redirect('/stocks');
    }
    res.redirect(`/stocks`);
  });
}
