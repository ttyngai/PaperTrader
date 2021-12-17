const fetch = require('node-fetch');

module.exports = {
  getStock,
  getOneStock,
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

          //   let stockInfo = {
          //     ticker: s.symbol,
          //     bid: s.bid,
          //     ask: s.ask,
          //     open: s.regularMarketOpen,
          //     change: s.regularMarketChangePercent,
          //     _id: stocksFound[idx]._id,
          //   };
          stocks.push(s);
        });
      });
  }
  console.log('long asnwer', stockInfo);
  return stocks;
}

async function checkStock(ticker) {
  let exist;
  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${ticker}`
  )
    .then((res) => res.json())
    .then((quote) => (exist = quote.quoteResponse.result[0].bid));
  return exist;
}
// async function getOneStock(ticker) {
//   let stockInfo = {};
//   await fetch(
//     `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${ticker}`
//   )
//     .then((res) => res.json())
//     .then((quote) => (stockInfo = quote.quoteResponse.result[0]));

//   return stockInfo;
// }
async function getOneStock(ticker) {
  let stock = [];
  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${ticker}`
  )
    .then((res) => res.json())
    .then((quote) => (exist = quote.quoteResponse.result[0]));
  stock.push(exist);
  return stock;
}
