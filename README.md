## **PaperTrader Live**

PaperTrader is a training tool for experiencing the stock market without any monetary risk.

**Please click this link to start the app:**
https://papertraderlive.herokuapp.com/

![Watchlist](https://i.imgur.com/kxdlxxM.png 'ScreenShot of watchlist')

![Chart](https://i.imgur.com/NLM4xne.png 'ScreenShot of stock chart')

![Portfolio](https://i.imgur.com/VCrVfQi.png 'ScreenShot of portfolio')

**Tehcnologies used:**

- MongoDB
- Express.js
- Node.js
- Google OAuth

Highlights:

- New account has pages that has special empty "greeting" messages. i.e. Portfolio page, stock page, new holdings/transactions page and new profile in watch list

- New stocks can be added by inputting correct ticker, app will fetch the ticker from yahoo finance. Stock data is processed real time. All stocks are sorted before presented.

- When deleting a stock from watchlist, it actually is an `Update` operation. Every stock has a `hide` key in the object and is set to `true` when user "deletes" it. The reason for this is if you have this stock in your portfolio, and wish to interact with it, it needs to remain on database even when removed from watchlist. When this "deleted" stock is added back by entering the ticker, the object will be found and `hide` key is changed to `true`, before saving it back to database.

- Tickers are checked for whether they are duplicated, or does not exist, before generating a new object to hold this stock.

- Portfolio names can be changed when the name box is clicked. When app detects user input, and OK button is presented and user can edit name. Delete is also available with a confirmation page to prevent accidental deletion.

- App can refresh itself(based on membership level), and if this is chosen, all input boxes's values are retained even though page is refreshed.

- Basic user level can use this for demo trading stocks, but a premium user level has access to setting custom "purchase prices" to use the app as a personal portfolio tracker, as well as having faster refresh rate (10s vs 60s)

- When stock chart is required, yahoo finance data is pulled, processed and sent to google charts with specified parameters. This is then rendered in the stock details page. The processing of data includes generating the candlesticks with wick, as well as a easy to see dotted yellow line overlay indicating the most recent price. Since there are three sections of market time, all three are combined before generating a single price. Horizontal axis adjusted for user timezone with daylight-savings.

- When buying stocks, the input values and input focus remains even during refresh by using localStorage during opening and setting variables on input change.

- When stock is bought a transaction is made with stockID recorded into selected portfolio(hence it was neccessary to retain watch list items even during a deletion)

- When accessing stocks from portfolio, 2 IDs are passed to preselect appropriate portfolio to make sure the stocks goes to correct portfolio.

- When shares of a particular stock becomes 0 in holdings, it will be removed but the gain/loss is compiled and reflected in realized P/L, while the holding's P/L is calculated seperately

- As for styling, most notable is the real time color change of positive and negative figures where applicable. Color themes and styles are of similar style to common professional trading platforms. For example, some dollar signs are omitted at certain types of numbers to save screen space.

**Future improvements:**

- Add functions to load money into account. This isn't all too exciting as the only interaction with the account capital is to block user from over buying stocks exceeding account value. This is not fun.

- Add buttons for setting different chart timeframes. (e.g. 7 day/ 1mo, 6mo etc)

- Add buttons for applying stock technical analysis (e.g. Volume, simple moving averages)
