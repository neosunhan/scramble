const TEXT_URL = 'http://api.quotable.io/random'
const quoteDisplayElement = document.getElementById('text-display');

function getRandomQuote() {
    return fetch(TEXT_URL).then(response => response.json())
            .then(data => data.content);
}

async function getNextQuote() {
    const quote = await getRandomQuote();
    quoteDisplayElement.innerText = quote;
}

getNextQuote();