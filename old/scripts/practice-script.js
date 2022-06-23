const TEXT_URL = 'http://api.quotable.io/random'
const textDisplayElement = document.getElementById('text-display');
const userInputElement = document.getElementById('user-input');
const timerElement = document.getElementById('timer');
const keyDivList = document.querySelectorAll('.key');
let gameDuration = 100;

keyDivList.forEach(key => key.addEventListener('transitionend', removeTransition));

const keyboard_map = {withinHand: false, withinRow: false};
const game_settings = {"withinHand": true, "withinRow" : true};
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
        userInputElement.value = text + originalText.substring(cursorEnd, originalText.length);
        userInputElement.setSelectionRange(text.length, text.length);
    } else if (cursorEnd == originalText.length) {
        userInputElement.value = originalText.substring(0, cursorStart) + text;
    } else {
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
            const capitalised = value === value.toUpperCase();
            value = value.toUpperCase();
            let newChar = keyboard_map[value];
            const key = document.querySelector(`.key[data-key="${value.charCodeAt(0)}"]`);
            key.classList.add('pressed');
            if (!capitalised) {
                newChar = newChar.toLowerCase();
            }
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

function scrambleHelper(mapping) {
    const withinHand = game_settings["withinHand"];
    const withinRow = game_settings["withinRow"];
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
    return mapping;
}


function scrambleKeys() {
    keyDivList.forEach(keyDiv => {
        const keyID = keyDiv.getAttribute('data-key');
        const character = String.fromCharCode(keyID);
        keyDiv.removeChild(document.getElementById(keyboard_map[character]));
    })

    scrambleHelper(keyboard_map);

    keyDivList.forEach(keyDiv => {
        const keyID = keyDiv.getAttribute('data-key');
        const character = String.fromCharCode(keyID);
        const newChild = document.createElement('kbd');
        newChild.innerText = keyboard_map[character];
        newChild.setAttribute("id", keyboard_map[character]);
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
                            if (timeLeft <= 0) {
                                clearInterval(intervalID);
                                getNextQuote();
                            }
                         }, 1000);
}

function getTimerTime() {
    return gameDuration - Math.floor((new Date() - startTime) / 1000);
}

/* Button Event Listeners */

/* Game Setting Checkbox */
const checkboxList = document.querySelectorAll('input[type="checkbox"]');
checkboxList.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        game_settings[checkbox.name] = checkbox.checked;
    })
})

/* Time Slider */
const timeSlider = document.getElementById("time-slider");
const timeSetting = document.getElementById("time-setting");
timeSetting.innerText = timeSlider.value + " secs";
timeSlider.oninput = () => {
    timeSetting.innerText = timeSlider.value + " secs";
}

/* Play Button */
const playButton = document.getElementById('header-play');
const closePlayButton = document.getElementById('play-menu-close-button');
const startGameButton = document.getElementById('start-game-button');

playButton.addEventListener('click', () => {
    const modalContainer = document.getElementById('play-menu');
    modalContainer.classList.add('show-modal');
    playButton.classList.add('clicked');
});

closePlayButton.addEventListener('click', () => {
    const modalContainer = document.getElementById('play-menu');
    modalContainer.classList.remove('show-modal');
    playButton.classList.remove('clicked');
});

startGameButton.addEventListener('click', () => {
    const modalContainer = document.getElementById('play-menu');
    modalContainer.classList.remove('show-modal');
    playButton.classList.remove('clicked');
    gameDuration = timeSlider.value;
    getNextQuote();
})

