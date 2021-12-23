const fetch = require('node-fetch');

module.exports = {
  getStock,
  getChartData,
};

async function getStock(stocksInput, simpleCheck) {
  // If single stock, convert into string
  let tickers;
  let tickersString = [];
  let exist = false;
  if (typeof stocksInput !== 'string') {
    // push to single string for one call
    stocksInput.forEach(function (s) {
      tickersString.push(s.ticker);
    });
    tickers = tickersString.toString();
  } else {
    tickers = stocksInput;
  }
  let stocksOutput = [];
  if (tickers.length !== 0) {
    await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${tickers}`
    )
      .then((res) => res.json())
      .then((quote) => {
        //below
        // simple check if stock exist

        if (!simpleCheck && quote.quoteResponse.result[0]) {
          stockInfo = quote.quoteResponse.result.forEach(function (s, idx) {
            //Check and match both stocks
            s._id = stocksInput[idx]._id;
            s.hide = stocksInput[idx].hide;
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
            stocksOutput.push(s);
          });
        } else if (simpleCheck && quote.quoteResponse.result[0]) {
          exist = true;
        }
      });
  }
  console.log('simple check?', simpleCheck);
  console.log('exist?', exist);
  return simpleCheck ? exist : stocksOutput;
}

async function getChartData(ticker, candleTime, howManyCandles) {
  let array = [];
  let object;
  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/chart/${ticker}?range=${howManyCandles}m&interval=${candleTime}m`
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
        // below checks for null data
        if (timestamp[i] && low[i] && open[i] && close[i] && high[i]) {
          let bar = [];
          let time = new Date(timestamp[i] * 1000);
          // For user current timezone
          let offset = new Date().getTimezoneOffset() / 60;
          let hour = time.getUTCHours() - offset;
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
          //
          console.log('last candle check', open[howManyCandles - 1]);
        }
      }
    })
    .catch((err) => console.log(err));
  // for testing undefined charts
  console.log(array);

  return array;
}
