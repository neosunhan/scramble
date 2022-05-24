const TEXT_URL = 'http://api.quotable.io/random'
const textDisplayElement = document.getElementById('text-display');
const userInputElement = document.getElementById('user-input');
let keys = [];

for (let i = 0; i < 26; ++i) {
    keys[i] = 97 + (i + 1) % 26;
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

document.addEventListener('keydown', e => {
    if (document.activeElement == userInputElement) {
        let value = e.key;
        let capitalised = false;
        if (!isLetter(value)) {
            // do nothing
        } else {
            e.preventDefault();
            value = e.key.charCodeAt(0);
            if (value >= 65 && value <= 90) {
                capitalised = true;
                value += 32;
            }
            if (value >= 97 && value <= 122) {
                let newChar = keys[value - 97];
                if (capitalised == true) {
                    newChar -= 32;
                }
                userInputElement.value += String.fromCharCode(newChar);
            }
        }

        const textCharList = textDisplayElement.querySelectorAll('span');
        const inputCharList = userInputElement.value.split('');
        textCharList.forEach((charSpan, index) => {
            const character = inputCharList[index];
            console.log(character);
            if (character == null) {
                charSpan.classList.remove('incorrect');
                charSpan.classList.remove('correct');
            } else if (character == charSpan.innerText) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
            } else {
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
            }
        }) 

    }
}) 

/*
userInputElement.addEventListener('input', () => {
    const textCharList = textDisplayElement.querySelectorAll('span');
    const inputCharList = userInputElement.value.split('');
    console.log("test");
    /*
    textCharList.forEach((charSpan, index) => {
        const charCode = inputCharList[index].innerText.charCodeAt(0); // ASCII Value of character
    });
})*/

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

function scrambleKeys() {
    
}

function getRandomQuote() {
    return fetch(TEXT_URL).then(response => response.json())
            .then(data => data.content);
}

async function getNextQuote() {
    const quote = await getRandomQuote();
    textDisplayElement.innerHTML = '';
    quote.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        textDisplayElement.appendChild(charSpan);
    })
    //quoteDisplayElement.innerText = quot
}

getNextQuote();