const fetch = require('node-fetch');

module.exports = {
  getStock,
  getChartData,
};

async function getStock(stocksInput, simpleCheck) {
  // Converts into string
  let tickers;
  const tickersString = [];
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
  const stocksOutput = [];
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
            const isFutures = s.symbol.includes('=');
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
            // If none found use basic price
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
  const array = [];
  let numOfDisplayedCandles;
  let object;
  let dateMatchCount = 0;
  // User specific preferred chart timeframe
  let interval, range;
  if (timeFrameMode == 1) {
    interval = '5m';
    range = '1395m';
    numOfDisplayedCandles = 79;
    timeAxisMode = 'time';
  } else if (timeFrameMode == 2) {
    interval = '30m';
    range = '140h';
    numOfDisplayedCandles = 78;
    timeAxisMode = 'date';
  } else if (timeFrameMode == 3) {
    interval = '1h';
    range = '270h';
    numOfDisplayedCandles = 140;
    timeAxisMode = 'date';
  } else if (timeFrameMode == 4) {
    interval = '1d';
    range = '284d';
    numOfDisplayedCandles = 84;
    timeAxisMode = 'date';
  } else if (timeFrameMode == 5) {
    interval = '1wk';
    range = '304wk';
    numOfDisplayedCandles = 104;
    timeAxisMode = 'month';
  } else if (timeFrameMode == 6) {
    interval = '1mo';
    range = '296mo';
    numOfDisplayedCandles = 96;
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
      const timestamp = object.timestamp;
      const open = object.indicators.quote[0].open;
      const high = object.indicators.quote[0].high;
      const low = object.indicators.quote[0].low;
      const close = object.indicators.quote[0].close;
      const volume = object.indicators.quote[0].volume;
      let lastDate = new Date(
        timestamp[timestamp.length - 1] * 1000
      ).getUTCDate();
      let arrayLength = 0;
      for (i = 0; i < timestamp.length; i++) {
        // Check if any data is null
        if (timestamp[i] && low[i] && open[i] && close[i] && high[i]) {
          const row = [];
          // Date Time section
          // Using "gmtoffset" item from API
          const time = new Date((timestamp[i] + object.meta.gmtoffset) * 1000);
          let hour = time.getUTCHours();
          let minute = time.getMinutes();
          // Fix transition during 12am
          if (hour < 0) {
            hour += 13;
          }
          // turn 24 hour to 12
          if (hour > 12) {
            hour = hour - 12;
          }

          if (minute < 10) {
            minute = `0${minute}`;
          }
          if (hour < 10) {
            hour = `0${hour}`;
          }
          const month = time.getUTCMonth() + 1;
          const day = time.getUTCDate();
          const year = time.getUTCFullYear();
          // Used for 1 day mode only
          if (day == lastDate) {
            dateMatchCount++;
          }
          // timeAxisMode == "time"
          if (timeAxisMode == 'time') {
            row.push(`${hour}:${minute}`);
          }
          // timeAxisMode == "date"
          else if (timeAxisMode == 'date') {
            row.push(`${month}/${day}`);
          }
          // timeAxisMode == "month"
          else if (timeAxisMode == 'month') {
            row.push(`${month}/${year}`);
          }
          // More timeframes with it's timeframes(Icebox)
          row.push(low[i]);
          row.push(open[i]);
          row.push(close[i]);
          row.push(high[i]);
          row.push(volume[i]);
          array.push(row);
          arrayLength++;
        }
      }
      // Allow last candle to fluctuate with moving price
      array[array.length - 1][2] = array[array.length - 2][3];
      // This is to find the last price (without undefined rows) to generate a yellow line
      array.forEach(function (row) {
        row.push(array[array.length - 1][3]);
      });
      // Simple Moving Average 9:
      simpleMovingAvg(array, 9);
      // Simple Moving Average 21:
      simpleMovingAvg(array, 21);
      // Simple Moving Average 50:
      simpleMovingAvg(array, 50);
      // Simple Moving Average 200:
      simpleMovingAvg(array, 200);
      // Timestamp
    })
    .catch((err) => console.log(err));
  // Take the lastest 'numOfDisplayedCandles' for the most updated
  if (timeFrameMode == 1) {
    // For 1 day modes, only send candles that match latest date
    // Limit max frame for 140, especially for futures which continues to print afterhours
    if (dateMatchCount > 140) {
      return array.slice(array.length - 140);
    } else {
      return array.slice(array.length - dateMatchCount);
    }
  } else {
    // If data doesn't go back that far, will display all available candles
    if (array.length < numOfDisplayedCandles) {
      numOfDisplayedCandles = array.length;
    }
    return array.slice(array.length - numOfDisplayedCandles);
  }
}

// Simple moving avg
function simpleMovingAvg(array, num) {
  let avg = array[0][3];
  array.forEach(function (row, idx) {
    if (idx > 0 && idx < num) {
      avg = (avg * idx + array[idx][3]) / (idx + 1);
    } else if (idx >= num) {
      // Adding num previous array[i][3]s together
      avg = array[idx - num][3];
      for (i = idx - (num - 1); i < idx; i++) {
        avg += array[i][3];
      }
      // Taking average
      avg /= num;
    }
    row.push(avg);
  });
}
