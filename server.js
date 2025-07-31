const express = require('express');
const yahooFinance = require('yahoo-finance2').default;

yahooFinance.suppressNotices(['yahooSurvey']);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// In-memory cache object: { [ticker]: { timestamp, data } }
const cache = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache data for 5 minutes

// API route to fetch an asset quote by ticker
app.get('/api/quote', async (req, res) => {
	const ticker = req.query.ticker;
	if (!ticker) {
		return res.status(400).json({ error: 'No ticker provided' });
	}

	const cached = cache[ticker];
	const now = Date.now();

	// If data is cached and still fresh, return it
	if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
		console.log(`Cache hit for ${ticker}: $${cached.data.price}`);
		return res.json(cached.data);
	}

	try {
		// Fetch fresh data from Yahoo Finance
		const quote = await yahooFinance.quote(ticker);
		const data = {
			ticker: quote.ticker,
			price: quote.regularMarketPrice
		};

		console.log(`Fetched quote for ${ticker}: $${data.price}`);

		// Store fetched data in cache
		cache[ticker] = {
			timestamp: now,
			data
		};

		res.json(data);
	} catch (error) {
		res.status(500).json({ error: `Failed to fetch data for ${ticker}` });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
