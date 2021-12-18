const fetch = require('node-fetch');

module.exports = {
  getStock,
  getOneStock,
  getStockNoId,
  checkStock,
};

async function getStock(array, stocksFound) {
  let tickers = array.toString();
  let stocks = [];
  if (tickers.length !== 0) {
    // if there is a username, we will make a request!
    await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${tickers}`
    )
      .then((res) => res.json())
      .then((quote) => {
        stockInfo = quote.quoteResponse.result.forEach(function (s, idx) {
          s._id = stocksFound[idx]._id;
          s.hide = stocksFound[idx].hide;
          stocks.push(s);
        });
      })
      .catch((err) => console.log(err));
  }
  return stocks;
}

async function checkStock(ticker) {
  let exist;

  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${ticker}`
  )
    .then((res) => res.json())
    .then((quote) => {
      if (quote.quoteResponse.result.length !== 0) {
        exist = quote.quoteResponse.result[0].regularMarketPrice;
      }
    })
    .catch((err) => console.log(err));
  return exist;
}
async function getOneStock(ticker) {
  let stock = [];
  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${ticker}`
  )
    .then((res) => res.json())
    .then((quote) => (exist = quote.quoteResponse.result[0]))
    .catch((err) => console.log(err));

  stock.push(exist);
  return stock;
}
async function getStockNoId(ticker) {
  let stock = [];
  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${ticker}`
  )
    .then((res) => res.json())
    .then((quote) => (exist = quote.quoteResponse.result))
    .catch((err) => console.log(err));
  stock.push(exist);
  return stock;
}
