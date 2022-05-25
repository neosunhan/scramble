const TEXT_URL = 'http://api.quotable.io/random'
const textDisplayElement = document.getElementById('text-display');
const userInputElement = document.getElementById('user-input');
const keyDivList = document.querySelectorAll('.key');
keyDivList.forEach(key => key.addEventListener('transitionend', removeTransition));
let keys = [];
for (let i = 0; i < 26; ++i) {
    keys[i] = 97 + i;
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isPunctuation(str) {
    return str.length === 1 && str.match(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/);
}

document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
    }
    if (document.activeElement == userInputElement) {
        let value = e.key;
        let capitalised = false;
        if (isPunctuation(value) || value == " ") {
            e.preventDefault();
            userInputElement.value += value;
        } else if (isLetter(value)) {
            e.preventDefault();
            value = e.key.charCodeAt(0);
            if (value >= 65 && value <= 90) {
                capitalised = true;
                value += 32;
            }
            let newChar = keys[value - 97]; // Lowercase
            const key = document.querySelector(`.key[data-key="${newChar - 32}"]`);
            key.classList.add('pressed');
            if (capitalised == true) {
                newChar -= 32;
            }
            userInputElement.value += String.fromCharCode(newChar);
        }
        let correct = true;
        const textCharList = textDisplayElement.querySelectorAll('span');
        const inputCharList = userInputElement.value.split('');
        textCharList.forEach((charSpan, index) => {
            const character = inputCharList[index];
            if (character == null) {
                correct = false;
                charSpan.classList.remove('incorrect');
                charSpan.classList.remove('correct');
            } else if (character == charSpan.innerText) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
            } else {
                correct = false;
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
            }
        }) 

        if (correct) {
            getNextQuote();
        }

    }
}) 

function removeTransition(e) {
    if (e.propertyName !== 'transform') {
        return; 
    }
    this.classList.remove('pressed');
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

function shuffleWithinHands(array) {
    const left = ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'].map(x => x.charCodeAt(0))
    const right = ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm'].map(x => x.charCodeAt(0))
    const shuffled = shuffle([...left]).concat(shuffle([...right]))
    const combined = left.concat(right)

    for (let i = 0; i < 26; ++i) {
        array[i] = shuffled[combined.findIndex(element => element === 97 + i)];
    }
    return array
}

function scrambleKeys() {
    // shuffle(keys);
    shuffleWithinHands(keys)
    keyDivList.forEach(keyDiv => {
        const keyID = keyDiv.getAttribute('data-key');
        const child = document.getElementById(String.fromCharCode(keyID));
        keyDiv.removeChild(child);
        keyDiv.setAttribute("data-key", keys[keyID - 65] - 32);
    })

    keyDivList.forEach(keyDiv => {
        const newChild = document.createElement('kbd');
        const newID = keyDiv.getAttribute('data-key');
        const character = String.fromCharCode(newID);
        newChild.innerText = character;
        newChild.setAttribute("id", character);
        keyDiv.appendChild(newChild);
    })
}

function getRandomQuote() {
    return fetch(TEXT_URL).then(response => response.json())
            .then(data => data.content);
}

async function getNextQuote() {
    const quote = await getRandomQuote();
    scrambleKeys();
    textDisplayElement.innerHTML = '';
    quote.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        textDisplayElement.appendChild(charSpan);
    })
    userInputElement.value = null;
}

getNextQuote();