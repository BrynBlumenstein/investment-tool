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

export function getGrossIncome() {
	return grossIncome;
}

export function getRothContribution() {
	return rothContribution;
}

export function updateIncomeAndContribution(value) {
	grossIncome = Number.isFinite(value) ? parseFloat(value.toFixed(2)) : 0;
	rothContribution = parseFloat(
		(grossIncome * (ROTH_CONTRIBUTION_PERCENT / 100)).toFixed(2)
	);
}

export function getAllocationSnapshot(prices) {
	const targets = calculateTargets();
	const shareCounts = calculateShareCounts(targets, prices);
	const actuals = calculateActuals(shareCounts, prices);
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
	return allocationConfig.map(({ percent }) =>
		parseFloat(((percent / 100) * rothContribution).toFixed(2))
	);
}

function calculateShareCounts(targets, prices) {
	return allocationConfig.map((item, i) => {
		const price = prices.get(item.ticker);

		if (price === null) {
			return null;
		}

		return parseFloat((targets[i] / price).toFixed(3));
	});
}

function calculateActuals(shareCounts, prices) {
	return allocationConfig.map((item, i) => {
		const price = prices.get(item.ticker);
		const shares = shareCounts[i];

		if (price === null) {
			return null;
		}

		return parseFloat((shares * price).toFixed(2));
	});
}

function calculateDeltas(targets, actuals) {
	return targets.map((target, i) => {
		const actual = actuals[i];

		if (actual === null) {
			return null;
		}

		return parseFloat((target - actual).toFixed(2));
	});
}
