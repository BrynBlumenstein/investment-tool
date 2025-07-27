document.addEventListener('DOMContentLoaded', async () => {
	const symbols = [
		'bil',
		'fisvx',
		'fpadx',
		'fskax',
		'fsrnx',
		'ftihx',
		'fuamx',
		'iau',
		'iaum',
		'vbil' /* ,
		'fakesymbol' */
	];

	const pricesTableBody = document.getElementById('prices-table-body');

	symbols.forEach(async (symbol) => {
		const res = await fetch(`api/quote?symbol=${symbol}`);
		const data = await res.json();

		const row = document.createElement('tr');

		if (data.error) {
			console.log(data.error);
			row.innerHTML = `<td>${symbol.toUpperCase()}</td><td>Error</td>`;
		} else {
			row.innerHTML = `<td>${data.symbol}</td><td>$${data.price}</td>`;
		}

		pricesTableBody.appendChild(row);
	});
});
