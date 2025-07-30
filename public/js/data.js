const ROTH_CONTRIBUTION_PERCENT = 15;

// Pinwheel portfolio asset allocation
const allocationConfig = Object.freeze([
	{
		group: 'Domestic',
		label: 'Total Stock Market',
		ticker: 'FSKAX',
		percent: 15
	},
	{
		group: 'Domestic',
		label: 'Small Cap Value',
		ticker: 'FISVX',
		percent: 10
	},
	{
		group: 'International',
		label: 'World Stock Market',
		ticker: 'FTIHX',
		percent: 15
	},
	{
		group: 'International',
		label: 'Emerging Markets',
		ticker: 'FPADX',
		percent: 10
	},
	{
		group: 'Bonds',
		label: 'Intermediate Term Bonds',
		ticker: 'FUAMX',
		percent: 15
	},
	{
		group: 'Bonds',
		label: 'Tbills / Cash',
		ticker: 'VBIL',
		percent: 10
	},
	{
		group: 'Real Assets',
		label: 'REITs',
		ticker: 'FSRNX',
		percent: 15
	},
	{
		group: 'Real Assets',
		label: 'Gold',
		ticker: 'IAUM',
		percent: 10
	}
]);

const tickers = allocationConfig.map((item) => item.ticker);

let grossIncome = 0;
let rothContribution = 0;

export function getRothContribution() {
	return rothContribution;
}

export function updateIncomeAndContribution(value) {
	grossIncome = Number.isFinite(value) ? value : 0;
	rothContribution = grossIncome * (ROTH_CONTRIBUTION_PERCENT / 100);
}

export function getAllocationSnapshot(prices) {
	const targets = calculateTargets();
	const shareCounts = calculateShareCounts(targets, prices);
	const actuals = calculateActuals(prices);
	const deltas = calculateDeltas(targets, actuals);

	return allocationConfig.map((item, i) => ({
		...item,
		target: targets[i],
		shares: shareCounts[i],
		actual: actuals[i],
		delta: deltas[i]
	}));
}

export async function fetchPrices() {
	const prices = new Map();

	for (const ticker of tickers) {
		try {
			const res = await fetch(`api/quote?ticker=${ticker}`);
			const data = await res.json();
			if (data.error || typeof data.price !== 'number') {
				prices.set(ticker, null);
			} else {
				prices.set(ticker, data.price);
			}
		} catch (error) {
			prices.set(ticker, null);
		}
	}

	return prices;
}

function calculateTargets() {
	return allocationConfig.map(
		({ percent }) => (percent / 100) * rothContribution
	);
}

function calculateShareCounts(targets, prices) {
	return allocationConfig.map((item, i) => {
		const price = prices.get(item.ticker);

		if (price === null) {
			return null;
		}

		return targets[i] / price;
	});
}

function calculateActuals(prices) {
	return allocationConfig.map((item) => {
		const price = prices.get(item.ticker);

		if (price === null) {
			return null;
		}

		// TODO (Optional): Replace with actual calculation logic
		return 0;
	});
}

function calculateDeltas(targets, actuals) {
	return targets.map((target, i) => {
		const actual = actuals[i];

		if (actual === null) {
			return null;
		}

		return target - actual;
	});
}
