const fetch = require('node-fetch');

module.exports = {
  getStock,
  getChartData,
};

async function getStock(stocksInput, simpleCheck) {
  // Converts into string
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
  // Fetch stock from yahoo finance
  let stocksOutput = [];
  if (tickers.length !== 0) {
    await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=${tickers}`
    )
      .then((res) => res.json())
      .then((quote) => {
        // Simple check if stock exist
        if (!simpleCheck && quote.quoteResponse.result[0]) {
          stockInfo = quote.quoteResponse.result.forEach(function (s, idx) {
            // Check for futures market type symbol
            let isFutures = s.symbol.includes('=');
            //Check and match both stocks, then apply _id and if it is hidden
            s._id = stocksInput[idx]._id;
            s.hide = stocksInput[idx].hide;
            // Switch between premarket(09:00-14:30UTC)/regularmarket(14:30-21:00UTC)/afterhours(21:00-01:00UTC)
            const hour = new Date().getUTCHours();
            const minute = new Date().getUTCMinutes();
            const minuteFraction = minute / 60;
            const hourNumber = hour + minuteFraction;
            // Check for futures first
            if (isFutures) {
              s.combinedPrice = s.regularMarketPrice;
            }
            // Premarket(09:00-14:30UTC)
            else if (hourNumber >= 9 && hourNumber < 14.5 && s.preMarketPrice) {
              s.combinedPrice = s.preMarketPrice
                ? s.preMarketPrice
                : s.postMarketPrice;
            }
            //  Regularmarket(14:30-21:00UTC)
            else if (
              hourNumber >= 14.5 &&
              hourNumber < 21 &&
              s.regularMarketPrice
            ) {
              s.combinedPrice = s.regularMarketPrice
                ? s.regularMarketPrice
                : s.postMarketPrice;
            }
            //  Afterhours(21:00-08:59UTC)
            else if (
              (hourNumber >= 21 || hourNumber < 9) &&
              s.postMarketPrice
            ) {
              s.combinedPrice = s.postMarketPrice;
            }
            // Stock went n/a when market wasn't
            else if (s.regularMarketPrice) {
              s.combinedPrice = s.regularMarketPrice;
            } else {
              s.combinedPrice = 0;
            }
            stocksOutput.push(s);
          });
        } else if (simpleCheck && quote.quoteResponse.result[0]) {
          exist = true;
        }
      });
  }
  return simpleCheck ? exist : stocksOutput;
}

async function getChartData(ticker, timeFrameMode) {
  let array = [];
  let object;
  // User specific preferred chart timeframe
  let interval, range;
  if (timeFrameMode == 1) {
    interval = '5m';
    range = '180m';
    timeAxisMode = 'time';
  } else if (timeFrameMode == 2) {
    interval = '15m';
    range = '1d';
    timeAxisMode = 'time';
  } else if (timeFrameMode == 3) {
    interval = '1h';
    range = '5d';
    timeAxisMode = 'date';
  } else if (timeFrameMode == 4) {
    interval = '1d';
    range = '40d';
    timeAxisMode = 'date';
  } else if (timeFrameMode == 5) {
    interval = '1d';
    range = '6mo';
    timeAxisMode = 'month';
  } else if (timeFrameMode == 6) {
    interval = '1wk';
    range = '2y';
    timeAxisMode = 'month';
  }
  // Fetch stock charting data from Yahoo finance
  await fetch(
    `https://query1.finance.yahoo.com/v7/finance/chart/${ticker}?range=${range}&interval=${interval}`
  )
    .then((res) => res.json())
    .then(function (data) {
      // Parse data into array for google charts
      object = data.chart.result[0];
      let timestamp = object.timestamp;
      let open = object.indicators.quote[0].open;
      let high = object.indicators.quote[0].high;
      let low = object.indicators.quote[0].low;
      let close = object.indicators.quote[0].close;
      let arrayLength = 0;
      for (i = 0; i < timestamp.length; i++) {
        // Check if any data is null
        if (timestamp[i] && low[i] && open[i] && close[i] && high[i]) {
          let row = [];
          // Date Time section
          // (Icebox)Currently for 1 minuite/ 1 hour range, need to expand for different timeframes with button selection
          // timeAxisMode == "time"
          let time = new Date(timestamp[i] * 1000);
          if (timeAxisMode == 'time') {
            // Using "gmtoffset" item from API
            let hour = time.getUTCHours() + object.meta.gmtoffset / 60 / 60;
            // Fix transition during 12am
            if (hour < 0) {
              hour += 13;
            }
            // turn 24 hour to 12
            if (hour > 12) {
              hour = hour - 12;
            }
            let minute = time.getMinutes();
            if (minute < 10) {
              minute = `0${minute}`;
            }
            if (hour < 10) {
              hour = `0${hour}`;
            }
            row.push(`${hour}:${minute}`);
          }
          // timeAxisMode == "date"
          else if (timeAxisMode == 'date') {
            let time = new Date((timestamp[i] + object.meta.gmtoffset) * 1000);
            let month = time.getUTCMonth() + 1;
            let day = time.getUTCDate();
            row.push(`${month}/${day}`);
          }
          // timeAxisMode == "month"
          else if (timeAxisMode == 'month') {
            let time = new Date((timestamp[i] + object.meta.gmtoffset) * 1000);
            let month = time.getUTCMonth() + 1;
            let year = time.getUTCFullYear();
            row.push(`${month}/${year}`);
          }
          // More timeframes with it's timeframes(Icebox)
          row.push(low[i]);
          row.push(open[i]);
          row.push(close[i]);
          row.push(high[i]);
          array.push(row);
          arrayLength++;
        }
      }
      // Allow last candle to fluctuate with moving price
      array[array.length - 1][2] = array[array.length - 2][3];
      // This is to find the last price (without undefined rows) to generate a yellow line
      array.forEach(function (row) {
        row.push(array[array.length - 1][1]);
      });
    })
    .catch((err) => console.log(err));
  return array;
}
