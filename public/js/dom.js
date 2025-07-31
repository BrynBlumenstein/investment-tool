import {
	getGrossIncome,
	getContribution,
	updateIncomeAndContribution,
	getAllocationSnapshot,
	fetchPrices
} from './data.js';

const incomeInput = document.getElementById('gross-income');
const contributionOutput = document.getElementById('contribution');
const pricesTableBody = document.getElementById('prices-table-body');
const allocationTableBody = document.getElementById('allocation-table-body');
const exportButton = document.getElementById('export-button');

export async function initializePage() {
	const prices = await fetchPrices();
	const data = getAllocationSnapshot(prices);

	createPriceTable(prices);
	createAllocationTable(data);
	initializeEventListeners(prices);
	incomeInput.disabled = false;
	exportButton.disabled = false;
}

function createPriceTable(prices) {
	pricesTableBody.innerHTML = '';

	for (const [ticker, price] of prices.entries()) {
		const row = document.createElement('tr');
		row.innerHTML = `
            <td>${ticker}</td>
            <td id="${ticker.toLowerCase()}-price">${
			price === null ? 'Error' : `$${price}`
		}</td>
        `;
		pricesTableBody.appendChild(row);
	}
}

function createAllocationTable(data) {
	allocationTableBody.innerHTML = '';

	let currentGroup = '';

	data.forEach(({ group, label, ticker, percent }) => {
		if (group !== currentGroup) {
			currentGroup = group;
			const headingRow = document.createElement('tr');
			headingRow.classList.add('group-heading');
			headingRow.innerHTML = `<td colspan="5">${group}</td>`;
			allocationTableBody.append(headingRow);
		}

		const row = document.createElement('tr');
		row.innerHTML = `
            <td>${percent}% ${label} (${ticker})</td>
            <td id="${ticker}-target" class="target"></td>
            <td id="${ticker}-shares" class="shares"></td>
            <td id="${ticker}-actual" class="actual"></td>
            <td id="${ticker}-delta" class="delta"></td>
        `;
		allocationTableBody.appendChild(row);
	});

	updateAllocationTable(data);
}

function updateAllocationTable(data) {
	data.forEach(({ ticker, target, shares, actual, delta }) => {
		const targetCell = document.getElementById(`${ticker}-target`);
		const sharesCell = document.getElementById(`${ticker}-shares`);
		const actualCell = document.getElementById(`${ticker}-actual`);
		const deltaCell = document.getElementById(`${ticker}-delta`);

		targetCell.textContent = `$${target.toFixed(2)}`;
		sharesCell.textContent = `${
			shares === null ? 'Error' : shares.toFixed(3)
		}`;
		actualCell.textContent = `${
			actual === null ? 'Error' : '$' + actual.toFixed(2)
		}`;
		deltaCell.textContent = `${
			delta === null ? 'Error' : '$' + delta.toFixed(2)
		}`;
	});
}

function initializeEventListeners(prices) {
	incomeInput.addEventListener('input', (event) =>
		handleIncomeInput(event, prices)
	);
	exportButton.addEventListener('click', () => handleExportClick(prices));
}

async function handleIncomeInput(event, prices) {
	updateIncomeAndContribution(parseFloat(event.target.value));
	const contribution = getContribution();
	contributionOutput.textContent = `$${contribution.toFixed(2)}`;

	const data = getAllocationSnapshot(prices);
	updateAllocationTable(data);
}

function handleExportClick(prices) {
	const wb = XLSX.utils.book_new();
	const filename = `allocation-${
		new Date().toISOString().split('T')[0]
	}.xlsx`;

	addSummarySheet(wb);
	addPricesSheet(wb, prices);
	addAllocationSheet(wb, prices);
	XLSX.writeFile(wb, filename);
}

function addSummarySheet(wb) {
	const infoSheet = XLSX.utils.aoa_to_sheet([
		['Gross Income', getGrossIncome().toFixed(2)],
		['Contribution', getContribution().toFixed(2)]
	]);
	XLSX.utils.book_append_sheet(wb, infoSheet, 'Summary');
}

function addPricesSheet(wb, prices) {
	const pricesData = [['Ticker', 'Price']];
	for (const [ticker, price] of prices.entries()) {
		pricesData.push([ticker, price === null ? 'Error' : price]);
	}
	const pricesSheet = XLSX.utils.aoa_to_sheet(pricesData);
	XLSX.utils.book_append_sheet(wb, pricesSheet, 'Prices');
}

function addAllocationSheet(wb, prices) {
	const allocationData = [['Asset', 'Target', 'Shares', 'Actual', 'Delta']];
	for (const row of getAllocationSnapshot(prices)) {
		const label = `${row.percent}% ${row.label} (${row.ticker})`;
		const target = row.target.toFixed(2);
		const shares = row.shares === null ? 'Error' : row.shares.toFixed(3);
		const actual = row.actual === null ? 'Error' : row.actual.toFixed(2);
		const delta = row.delta === null ? 'Error' : row.delta.toFixed(2);
		allocationData.push([label, target, shares, actual, delta]);
	}
	const allocationSheet = XLSX.utils.aoa_to_sheet(allocationData);
	XLSX.utils.book_append_sheet(wb, allocationSheet, 'Allocation');
}
