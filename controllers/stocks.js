const Stock = require('../models/stock');
const Portfolio = require('../models/portfolio');
const StockPrice = require('../stockPrice');

module.exports = {
  index,
  show,
  create,
  hide,
};

async function index(req, res) {
  // pass in array of tickers

  Stock.find({ user: req.user }, async function (err, stocksFound) {
    // Sort alphabetically
    stocksFound.sort(function (a, b) {
      if (a.ticker > b.ticker) return 1;
      if (a.ticker < b.ticker) return -1;
    });

    // Check if all are hidden(empty), allow watchlist to show "No symbols added"
    let listNotEmpty = false;
    stocksFound.forEach(function (s) {
      if (!s.hide) {
        listNotEmpty = true;
      }
    });

    console.log('stocksFound to be sent to getStock', stocksFound);
    const stocks = await StockPrice.getStock(stocksFound);
    res.render('stocks/index', { title: 'Stocks', stocks, listNotEmpty, req });
  });
}

function hide(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    stock.hide = true;
    stock.save();
    res.redirect('/stocks');
  });
}

async function show(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    //Protect route unless from logged in user
    if (!stock.user.equals(req.user._id)) {
      return res.redirect('/stocks');
    }
    let preselectPortfolio = 0;
    if (req.params.portfolioId) {
      preselectPortfolio = req.params.portfolioId;
    }
    Portfolio.find({ user: req.user._id }, async function (err, portfolios) {
      let ticker = [];
      let obj = {};
      obj['ticker'] = stock.ticker;
      ticker.push(obj);
      const quote = await StockPrice.getStock(ticker);
      //Get charting data
      const chartParsed = await StockPrice.getChartData(stock.ticker, 1, 61);
      res.render('stocks/show', {
        title: 'Stocks',
        stock,
        portfolios,
        quote,
        req,
        chartParsed,
        preselectPortfolio,
      });
    });
  });
}
async function create(req, res) {
  let check;
  req.body.ticker = req.body.ticker.toUpperCase();
  // Check stock exist
  let ticker = [];
  let obj = {};
  obj['ticker'] = req.body.ticker;
  ticker.push(obj);
  check = await StockPrice.getStock(ticker, true);
  console.log('checking', check);
  // Check stock duplicate
  const duplicate = await Stock.findOne({
    $and: [{ ticker: req.body.ticker }, { user: req.user._id }],
  }).catch((err) => console.log('Duplicate Error', err));
  if (check && !duplicate) {
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
  //If duplicated, sets hide to false
  if (duplicate) {
    Stock.findOne(
      {
        $and: [{ ticker: req.body.ticker }, { user: req.user._id }],
      },
      function (err, stock) {
        stock.hide = false;
        stock.save();
        res.redirect(`/stocks`);
      }
    );
  }
}
