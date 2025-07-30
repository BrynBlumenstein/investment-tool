import {
	getRothContribution,
	updateIncomeAndContribution,
	getAllocationSnapshot,
	fetchPrices
} from './data.js';

const incomeInput = document.getElementById('gross-income');
const contributionOutput = document.getElementById('roth-contribution');
const priceTableBody = document.getElementById('price-table-body');
const allocationTableBody = document.getElementById('allocation-table-body');

export async function initializePage() {
	const prices = await fetchPrices();
	const data = getAllocationSnapshot(prices);

	createPriceTable(prices);
	createAllocationTable(data);
	initializeEventListeners(prices);
	incomeInput.disabled = false;
}

function createPriceTable(prices) {
	priceTableBody.innerHTML = '';

	for (const [ticker, price] of prices.entries()) {
		const row = document.createElement('tr');
		row.innerHTML = `
            <td>${ticker}</td>
            <td id="${ticker.toLowerCase()}-price">${
			price === null ? 'Error' : `$${price.toFixed(2)}`
		}</td>
        `;
		priceTableBody.appendChild(row);
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
	incomeInput.addEventListener('input', async (event) => {
		updateIncomeAndContribution(parseFloat(event.target.value));
		const contribution = getRothContribution();
		contributionOutput.textContent = `$${contribution.toFixed(2)}`;

		const data = getAllocationSnapshot(prices);
		updateAllocationTable(data);
	});
}
