//test
document.addEventListener('DOMContentLoaded', function() {
    const fetchButton = document.getElementById('fetchButton');
    const helloButton = document.getElementById('helloButton'); // Get the new button

    if (fetchButton) {
        fetchButton.addEventListener('click', function() {
            console.log('Fetch button clicked'); // Existing functionality
            // Your existing fetch code here
        });
    }

    if (helloButton) {
        helloButton.addEventListener('click', function() {
            console.log('Hello World'); // Log "Hello World" to the console
        });
    }
});

document.getElementById('fetchButton').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKeyInput').value;
    const address = document.getElementById('addressInput').value;
    if (apiKey && address) {
        loadCountryList().then(countryList => {
            fetchTokenTransactions(apiKey, address, countryList);
        }).catch(error => {
            console.error('Failed to load country list:', error);
        });
    } else {
        console.error('API Key and Wallet Address are required');
    }
});


function loadCountryList() {
    return fetch('countrylist.json')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded country list:', data);  // Confirm the data is loaded correctly
            return data;
        });
}

function fetchTokenTransactions(apiKey, address, countryList) {
    const apiUrl = `https://api.basescan.org/api?module=account&action=tokentx&address=${address}&page=1&offset=500&startblock=0&endblock=27025780&sort=desc&apikey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);
            if (data.status === "1" && data.message === "OK" && data.result) {
                let transactionsWithAddresses = data.result.filter(tx => tx.to && tx.contractAddress);
                console.log("Transactions with addresses:", transactionsWithAddresses);

                let ownedTokens = transactionsWithAddresses
                    .filter(tx => tx.to.toLowerCase() === address.toLowerCase())
                    .map(tx => tx.contractAddress.toLowerCase());

                console.log("Filtered Owned Tokens:", ownedTokens);

                let ownedCountries = countryList.filter(country => country.tokenAddress && ownedTokens.includes(country.tokenAddress.toLowerCase()));
                console.log("Owned Countries:", ownedCountries);

                let ownedCountrySymbols = ownedCountries.map(country => country.symbol);
                console.log("Owned country symbols:", ownedCountrySymbols);

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs.length === 0) {
                        console.error("No active tab found");
                        return;
                    }
                    chrome.scripting.executeScript({
                        target: {tabId: tabs[0].id},
                        files: ['contentScript.js']
                    }, function(injectionResults) {
                        if (chrome.runtime.lastError || !injectionResults || injectionResults.length === 0) {
                            console.error("Script injection failed", chrome.runtime.lastError);
                        } else {
                            chrome.tabs.sendMessage(tabs[0].id, {action: "highlightCountries", countries: ownedCountrySymbols}, function(response) {
                                if (chrome.runtime.lastError) {
                                    console.error("Message sending failed", chrome.runtime.lastError);
                                } else {
                                    console.log("Message sent successfully", response);
                                }
                            });
                        }
                    });
                });
            } else {
                console.error('Failed to fetch data or invalid data structure:', data.message);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}




