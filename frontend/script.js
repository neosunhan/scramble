const TEXT_URL = 'http://api.quotable.io/random'
const textDisplayElement = document.getElementById('text-display');
const userInputElement = document.getElementById('user-input');
const timerElement = document.getElementById('timer');
const keyDivList = document.querySelectorAll('.key');
const gameDuration = 120;

keyDivList.forEach(key => key.addEventListener('transitionend', removeTransition));

const keyboard_map = {};
for (let i = 65; i < 91; i++) {
    const letter = String.fromCharCode(i);
    keyboard_map[letter] = letter;
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isPunctuation(str) {
    return str.length === 1 && str.match(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/);
}

function insertTextAtCursor(text, cursorStart, cursorEnd) {
    const originalText = userInputElement.value;
    if (cursorStart == 0 && cursorEnd == originalText.length) {
        userInputElement.value = text;
    } else if (cursorStart == 0) {
        console.log("b");
        userInputElement.value = text + originalText.substring(cursorEnd, originalText.length);
        userInputElement.setSelectionRange(text.length, text.length);
    } else if (cursorEnd == originalText.length) {
        console.log("c");
        userInputElement.value = originalText.substring(0, cursorStart) + text;
    } else {
        console.log("d");
        userInputElement.value = originalText.substring(0, cursorStart) + text + originalText.substring(cursorEnd, originalText.length);  
        userInputElement.setSelectionRange(cursorStart + text.length, cursorStart + text.length);
    }
}


document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
    }
    if (document.activeElement == userInputElement) {
        let value = e.key;
        const startIndex = userInputElement.selectionStart;
        const endIndex = userInputElement.selectionEnd;
        if (isPunctuation(value) || value == " " || value >= 0 && value <= 9) {
            e.preventDefault();
            insertTextAtCursor(value, startIndex, endIndex);
        } else if (isLetter(value)) {
            e.preventDefault();
            const capitalised = value === value.toUpperCase()
            let newChar = keyboard_map[value.toUpperCase()]
            const key = document.querySelector(`.key[data-key="${newChar.charCodeAt(0)}"]`);
            key.classList.add('pressed');
            if (!capitalised) {
                newChar = newChar.toLowerCase();
            }
            console.log(`selection start: ${userInputElement.selectionStart}`);
            console.log(`selection end: ${userInputElement.selectionEnd}`);
            insertTextAtCursor(newChar, startIndex, endIndex);
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

function scrambleHelper(mapping, withinHand = true, withinRow = true) {
    let divisions = [];
    if (withinHand && withinRow) {
        divisions = ["QWERT", "ASDFG", "ZXCVB", "YUIOP", "HJKL", "NM"];
    } else if (withinHand) {
        divisions = ["QWERTASDFGZXCVB", "YUIOPHJKLNM"];
    } else if (withinRow) {
        divisions = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    } else {
        divisions = ["QWERTYUIOPASDFGHJKLZXCVBNM"];
    }
    divisions = divisions.map(x => Array.from(x));

    let original = [];
    let shuffled = [];
    for (let division of divisions) {
        shuffled.push(...shuffle([...division]));
        original.push(...division)
    }

    for (let i = 0; i < original.length; i++) {
        mapping[original[i]] = shuffled[i];
    }
    return mapping
}


function scrambleKeys() {
    scrambleHelper(keyboard_map);
    keyDivList.forEach(keyDiv => {
        const keyID = keyDiv.getAttribute('data-key');
        const letter = String.fromCharCode(keyID);
        keyDiv.removeChild(document.getElementById(letter));
        keyDiv.setAttribute("data-key", keyboard_map[letter].charCodeAt(0));
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
    startTimer();
}

let startTime;

function startTimer() {
    timerElement.innerText = gameDuration;
    startTime = new Date();
    const intervalID = setInterval(() => {
                            const timeLeft = getTimerTime();
                            timerElement.innerText = timeLeft;
                            if (timeLeft == 0) {
                                clearInterval(intervalID);
                                getNextQuote();
                            }
                         }, 1000);
}

function getTimerTime() {
    return gameDuration - Math.floor((new Date() - startTime) / 1000);
}

getNextQuote();