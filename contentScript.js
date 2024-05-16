chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "highlightCountries" && request.countries) {
        highlightCountries(request.countries);
    }
});

function highlightCountries(countries) {
    // Use the provided complex selector to find the container
    const container = document.querySelector("#root > div.flex.w-full.bg-\\[\\#222222\\].items-center.overflow-hidden.h-screen > div.absolute.h-full.flex.flex-col.top-0.right-0.z-20");
    if (container) {
        // Find all country elements within the container
        // Assuming country names are in <div> tags or similar within the container
        const countryElements = container.querySelectorAll('div'); // Adjust the selector as needed based on actual markup
        countryElements.forEach(elem => {
            if (countries.includes(elem.textContent.trim())) {
                elem.style.backgroundColor = 'yellow'; // Highlight
            }
        });
    } else {
        console.error('Container not found');
    }
}
