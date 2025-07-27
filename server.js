const express = require('express');
const yahooFinance = require('yahoo-finance2').default;

// suppress survey notice from Yahoo Finance
yahooFinance.suppressNotices(['yahooSurvey']);

const app = express();
const PORT = process.env.PORT || 3000;

// serve static files from the "public" directory (HTML, CSS, JS)
app.use(express.static('public'));

// in-memory cache object: { [symbol]: { timestamp, data } }
const cache = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache data for 5 minutes

// API route to fetch a stock/ETF quote by symbol
app.get('/api/quote', async (req, res) => {
	const symbol = req.query.symbol;
	if (!symbol) {
		// if no symbol is provided, return a 400 Bad Request
		return res.status(400).json({ error: 'No symbol provided' });
	}

	const cached = cache[symbol];
	const now = Date.now();

	// if data is cached and still fresh, return it
	if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
		console.log(`Cache hit for ${symbol}: $${cached.data.price}`);
		return res.json(cached.data);
	}

	try {
		// fetch fresh data from Yahoo Finance
		const quote = await yahooFinance.quote(symbol);
		const data = {
			symbol: quote.symbol,
			price: quote.regularMarketPrice
		};

		console.log(`Fetched quote for ${symbol}: $${data.price}`);

		// store fetched data in cache
		cache[symbol] = {
			timestamp: now,
			data
		};

		res.json(data);
	} catch (error) {
		// handle errors (e.g., network issues or invalid symbol)
		res.status(500).json({ error: `Failed to fetch data for ${symbol}` });
	}
});

// start the server
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
