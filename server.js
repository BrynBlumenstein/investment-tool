const express = require('express');
const yahooFinance = require('yahoo-finance2').default;

yahooFinance.suppressNotices(['yahooSurvey']);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const cache = {};
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

app.get('/api/quote', async (req, res) => {
	const symbol = req.query.symbol?.toUpperCase();
	if (!symbol) {
		return res.status(400).json({ error: 'No symbol provided' });
	}

    const cached = cache[symbol];
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
        console.log(`Cache hit for ${symbol}: $${cached.data.price}`);
        return res.json(cached.data);
    }

	try {
		const quote = await yahooFinance.quote(symbol);
		const data = {
			symbol: quote.symbol,
			price: quote.regularMarketPrice
		};

        console.log(`Fetched quote for ${symbol}: $${data.price}`);

        cache[symbol] = {
            timestamp: now,
            data
        }

        res.json(data);
	} catch (error) {
		res.status(500).json({ error: `Failed to fetch data for ${symbol}` });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
