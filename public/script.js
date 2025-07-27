document.addEventListener('DOMContentLoaded', async () => {
	const symbols = [
		'BIL',
		'FISVX',
		'FPADX',
		'FSKAX',
		'FSRNX',
		'FTIHX',
		'FUAMX',
		'IAU',
		'IAUM',
		'VBIL' /* ,
		'FAKESYMBOL' // used to test error handling */
	];

	const pricesTableBody = document.getElementById('prices-table-body');

	// loop through each symbol and fetch its quote
	symbols.forEach(async (symbol) => {
		try {
			const res = await fetch(`api/quote?symbol=${symbol}`);
			const data = await res.json();

			const row = document.createElement('tr');

			if (data.error) {
				// handle errors returned from the API
				console.error(`Error fetching ${symbol}: ${data.error}`);
				row.innerHTML = `<td>${symbol}</td><td>Error</td>`;
			} else {
				// successful quote
				row.innerHTML = `<td>${data.symbol}</td><td>$${data.price}</td>`;
			}

			pricesTableBody.appendChild(row);
		} catch (error) {
			// handle network or unexpected failures
			console.error(`Fetch failed for ${symbol}: ${error.message}`);
		}
	});
});
