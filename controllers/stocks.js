const Stock = require('../models/stock');
const Portfolio = require('../models/portfolio');

module.exports = {
  index,
  show,
  create,
};

async function index(req, res) {
  console.log('index');

  const stocks = await Stock.find({ user: req.user });

  res.render('stocks/index', { title: 'stocks', stocks });
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
  console.log('create Stock', req.body);
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
