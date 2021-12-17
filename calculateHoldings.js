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
  console.log('gathered Sum', gatheredSum);

  //   let gathered = [];
  //   //   let gathered = [{ticker:'AAPL', shares:400},{ticker:'FB', shares:200}];
  //   portfolio.transactions.forEach(function (t) {
  //     //loop through full array and each object to find ticker
  //     let idxOfTicker;
  //     let exist = false;
  //     for (i = 0; i < gathered.length; i++) {
  //       if (t.ticker == gathered[i].ticker) {
  //         exist = true;
  //         idxOfTicker = i;
  //       }
  //     }
  //     if (!exist) {
  //       let obj = { ticker: t.ticker, shares: t.shares };
  //       gathered.push(obj);
  //     } else {
  //       gathered[idxOfTicker]['shares'] += t.shares;
  //       if (gathered[idxOfTicker]['shares'] === 0) {
  //         gathered.splice(idxOfTicker, 1);
  //       }
  //     }
  //   });

  return gatheredSum;
}
