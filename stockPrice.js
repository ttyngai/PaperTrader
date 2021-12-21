const fetch = require('node-fetch');

module.exports = {
  getStock,
  getOneStock,
  getStockNoId,
  checkStock,
  getChartData,
};

async function getStock(array, stocksFound) {
  let tickers = array.toString();
  let stocks = [];
  if (tickers.length !== 0) {
    await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${tickers}`
    )
      .then((res) => res.json())
      .then((quote) => {
        stockInfo = quote.quoteResponse.result.forEach(function (s, idx) {
          s._id = stocksFound[idx]._id;
          s.hide = stocksFound[idx].hide;
          // Switch between premarket(09:00-14:30UTC)/regularmarket(14:30-21:00UTC)/afterhours(21:00-01:00UTC)
          const hour = new Date().getUTCHours();
          const minute = new Date().getUTCMinutes();
          const minuteFraction = minute / 60;
          const hourNumber = hour + minuteFraction;
          // premarket(09:00-14:30UTC)
          if (hourNumber >= 9 && hourNumber < 14.5) {
            s.preRegAfterCombinedPrice = s.preMarketPrice;
          }
          //  regularmarket(14:30-21:00UTC)
          else if (hourNumber >= 14.5 && hourNumber < 21) {
            s.preRegAfterCombinedPrice = s.regularMarketPrice;
          }
          //  afterhours(21:00-08:59UTC)
          else if (hourNumber >= 21 || hourNumber < 9) {
            s.preRegAfterCombinedPrice = s.postMarketPrice;
          }
          stocks.push(s);
        });
      })
      .catch((err) => console.log(err));
  }
  console.log(stocks);
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
async function getChartData(ticker, candleTime, howManyCandles) {
  let array = [];
  let object;
  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/chart/${ticker}?range=${howManyCandles}m&interval=${candleTime}m&indicators=quote&includeTimestamps=true`
  )
    .then((res) => res.json())
    .then(function (data) {
      object = data.chart.result[0];
      let timestamp = object.timestamp;
      let open = object.indicators.quote[0].open;
      let high = object.indicators.quote[0].high;
      let low = object.indicators.quote[0].low;
      let close = object.indicators.quote[0].close;
      for (i = 0; i < howManyCandles; i++) {
        if (timestamp[i] && low[i] && open[i] && close[i] && high[i]) {
          let bar = [];
          let time = new Date(timestamp[i] * 1000);
          let hour = time.getHours();
          let minute = time.getMinutes();
          if (minute < 10) {
            minute = `0${minute}`;
          }
          if (hour < 10) {
            hour = `0${hour}`;
          }
          let newTime = `${hour}:${minute}`;
          bar.push(newTime);
          bar.push(low[i]);
          bar.push(open[i]);
          bar.push(close[i]);
          bar.push(high[i]);
          bar.push(open[howManyCandles - 1]);
          array.push(bar);
        }
      }
      let arrayDataLength = array.length;
      for (i = 0; i < 5; i++) {
        let bar = [];
        let time = new Date(
          (timestamp[arrayDataLength - 1] + 60 * (i + 1)) * 1000
        );
        let hour = time.getHours();
        let minute = time.getMinutes();
        if (minute < 10) {
          minute = `0${minute}`;
        }
        if (hour < 10) {
          hour = `0${hour}`;
        }
        let newTime = `${hour}:${minute}`;
        let lastDots;
        if (close[howManyCandles - 1] > open[howManyCandles - 1]) {
          lastDots = 0.001;
        } else {
          lastDots = -0.001;
        }
        bar.push(newTime);
        bar.push(open[howManyCandles - 1]);
        bar.push(open[howManyCandles - 1]);
        bar.push(open[howManyCandles - 1] + lastDots);
        bar.push(open[howManyCandles - 1]);
        bar.push(open[howManyCandles - 1]);
        array.push(bar);
      }
    })
    .catch((err) => console.log(err));
  // for testing undefined charts
  // console.log(array);

  return array;
}
