module.exports = {
  calculateHoldings,
};

function calculateHoldings(portfolio) {
  let gathered = [];
  //   let gathered = [{ticker:'AAPL', shares:400},{ticker:'FB', shares:200}];
  portfolio.transactions.forEach(function (t) {
    //loop through full array and each object to find ticker
    let idxOfTicker;
    let exist = false;
    for (i = 0; i < gathered.length; i++) {
      if (t.ticker == gathered[i].ticker) {
        exist = true;
        idxOfTicker = i;
      }
    }
    if (!exist) {
      let obj = { ticker: t.ticker, shares: t.shares };
      gathered.push(obj);
    } else {
      gathered[idxOfTicker]['shares'] += t.shares;
      if (gathered[idxOfTicker]['shares'] === 0) {
        console.log('remove this', gathered[idxOfTicker], idxOfTicker);
        gathered.splice(idxOfTicker, 1);
      }
    }
  });
  console.log(gathered);
  return gathered;
}
