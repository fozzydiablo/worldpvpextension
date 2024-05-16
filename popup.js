console.log('Script loaded'); // This will confirm the script is loading

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const fetchButton = document.getElementById('fetchButton');
    if (fetchButton) {
        fetchButton.addEventListener('click', function() {
            console.log('Button clicked');
            const apiKey = document.getElementById('apiKeyInput').value;
            if (apiKey) {
                loadCountryList().then(countryList => {
                    fetchTokenTransactions(apiKey, countryList);
                }).catch(error => {
                    console.error('Error loading country list:', error);
                });
            } else {
                console.error('API Key is required');
            }
        });
    } else {
        console.error('Fetch button not found');
    }
});

document.getElementById('fetchButton').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKeyInput').value;
    if (apiKey) {
        console.log('clicked');
        loadCountryList().then(countryList => {
            fetchTokenTransactions(apiKey, countryList);
        }).catch(error => {
            console.error('Error loading country list:', error);
        });
    } else {
        console.error('API Key is required');
    }
});

function loadCountryList() {
    return fetch('countrylist.json')
        .then(response => response.json())
        .then(data => {
            return data;  // Returns the country list array
        });
}

function fetchTokenTransactions(apiKey, countryList) {
    const apiUrl = `https://api.basescan.org/api?module=account&action=tokentx&address=0x0B28BDCE48a29635CD7dc3A51A66d103E564C564&page=1&offset=100&startblock=0&endblock=27025780&sort=desc&apikey=${apiKey}`;
    console.log("Fetching data from API at URL:", apiUrl);

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Data parsed to JSON", data);
            if (data.status === "1" && data.message === "OK") {
                console.log('Transactions fetched successfully.');
                let ownedTokens = data.result.filter(tx => tx.to.toLowerCase() === '0x0B28BDCE48a29635CD7dc3A51A66d103E564C564'.toLowerCase())
                                            .map(tx => tx.tokenAddress);
                let ownedCountries = countryList.filter(country => ownedTokens.includes(country.tokenAddress));
                ownedCountries.forEach(country => {
                    console.log(country.name);  // Log the name of countries for tokens owned
                });
            } else {
                console.error('Failed to fetch data:', data.message);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}
