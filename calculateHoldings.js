module.exports = {
  calculateHoldings,
};

function calculateHoldings(portfolio) {
  let gatheredSum = [];
  // New t.price is purchased price
  portfolio.transactions.forEach(function (t) {
    let purchase = t.shares * t.price;
    t.price = purchase;
  });

  //loop through full array and each object to find ticker
  portfolio.transactions.forEach(function (t) {
    let idxOfTickerSum;
    let exist = false;
    //finds whether stock already exist and remembering it's index
    for (i = 0; i < gatheredSum.length; i++) {
      if (t.ticker == gatheredSum[i].ticker) {
        // Found, sets exist and rememebers it's index
        exist = true;
        idxOfTickerSum = i;
      }
    }
    // If doens't exist, makes a new one
    if (!exist) {
      let objSum = {
        ticker: t.ticker,
        shares: t.shares,
        price: t.price,
      };
      gatheredSum.push(objSum);
    }
    // exists, combines shares and prices
    else {
      gatheredSum[idxOfTickerSum]['shares'] += t.shares;
      gatheredSum[idxOfTickerSum]['price'] += t.price;
      //if shares becomes 0, deletes stock from holdings (Why keep stocks with zero shares?)
      if (gatheredSum[idxOfTickerSum]['shares'] === 0) {
        gatheredSum.splice(idxOfTickerSum, 1);
      }
    }
  });
  // calculates average share price
  gatheredSum.forEach(function (t) {
    t.price = t.price / t.shares;
  });
  return gatheredSum;
}
