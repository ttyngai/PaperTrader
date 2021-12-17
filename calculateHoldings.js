module.exports = {
  calculateHoldings,
};

function calculateHoldings(portfolio) {
  //loop through array to add transaction $
  let newTransactions = JSON.parse(JSON.stringify(portfolio.transactions));

  let gatheredSum = [];
  newTransactions.forEach(function (t) {
    let purchase = t.shares * t.price;
    t.price = purchase;
  });
  newTransactions.forEach(function (t) {
    //loop through full array and each object to find ticker
    let idxOfTickerSum;
    let existSum = false;
    for (i = 0; i < gatheredSum.length; i++) {
      if (t.ticker == gatheredSum[i].ticker) {
        existSum = true;
        idxOfTickerSum = i;
      }
    }
    if (!existSum) {
      let objSum = { ticker: t.ticker, shares: t.shares, price: t.price };
      gatheredSum.push(objSum);
    } else {
      gatheredSum[idxOfTickerSum]['shares'] += t.shares;
      gatheredSum[idxOfTickerSum]['price'] += t.price;
      if (gatheredSum[idxOfTickerSum]['shares'] === 0) {
        gatheredSum.splice(idxOfTickerSum, 1);
      }
    }
  });
  gatheredSum.forEach(function (t) {
    t.price = t.price / t.shares;
  });
  return gatheredSum;
}
