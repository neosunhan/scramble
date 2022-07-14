import React, { useEffect, useState } from 'react'
import { Keyboard, Timer, TextArea, TextDisplay } from 'components'
import { keyboardMap } from 'utils/keyboard'
import { GameEnd } from './GameEnd'
import styles from './Game.module.css'
import { useAuth } from 'hooks/useAuth'
import { remove, DatabaseReference, onValue, ref, set, get } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { generateKeyboard } from 'utils/keyboard'
import { defaultGameOptions } from 'components/firebase/RoomFunctions'

interface MultiplayerGameProps {
  roomId: string
  keys: keyboardMap
  quote: string
  time: number
  players: { [index: string]: string }
}

const mapInput = (keys: keyboardMap, char: string): string => {
  const upperChar = char.toUpperCase()
  const newChar = keys[upperChar as keyof keyboardMap] ?? char
  const isUpper = upperChar == char
  return isUpper ? newChar : newChar.toLowerCase()
}

function isInput(str: string) {
  return isLetter(str) || isOtherKey(str)
}

function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i)
}

function isOtherKey(str: string) {
  return str.length === 1 && str.match(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~123456789 \b]/)
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomId,
  keys,
  quote,
  time,
  players,
}) => {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [opponentInput, setOpponentInput] = useState('')
  const [cursor, setCursor] = useState(0)
  const dbInputRef = ref(database, `rooms/${roomId}/nextWord/${user?.uid}`)
  const dbQuoteLeftRef = ref(database, `rooms/${roomId}/quoteLeft/${user?.uid}`)
  const [gameResult, setGameResult] = useState('Tie!')
  const [gameEnd, setGameEnd] = useState(false)
  const userInputElement = React.useRef<HTMLInputElement>(null)

  const [quoteLeft, setQuoteLeft] = useState(quote)
  const words = quote.split(' ').map((s) => s + ' ')
  const [nextWordIndex, setNextWordIndex] = useState(0)
  const [opponentQuoteLeft, setOpponentQuoteLeft] = useState<string>('Initial')

  const [startTime, setStartTime] = useState(-1)
  const [gameStats, setGameStats] = useState({})

  const insertTextAtCursor = (
    prev: string,
    input: string,
    currentStart: number,
    currentEnd: number,
  ): string => {
    let newString: string
    if (currentStart == 0) {
      setCursor(input.length)
      newString = input + prev.substring(currentEnd, prev.length)
    } else if (currentEnd == prev.length) {
      setCursor(currentStart + input.length)
      newString = prev.substring(0, currentStart) + input
    } else {
      setCursor(currentStart + input.length)
      newString = prev.substring(0, currentStart) + input + prev.substring(currentEnd, prev.length)
    }
    set(dbInputRef, newString)
    return newString
  }

  const backspaceAtCursor = (prev: string, currentStart: number, currentEnd: number): string => {
    let newString: string
    if (currentStart == currentEnd) {
      if (currentStart != 0) {
        setCursor(currentStart - 1)
        newString = prev.substring(0, currentStart - 1) + prev.substring(currentStart, prev.length)
      } else {
        newString = prev
      }
      set(dbInputRef, newString)
      return newString
    } else {
      return insertTextAtCursor(prev, '', currentStart, currentEnd)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }
    if (document.activeElement == userInputElement.current) {
      const value = e.key
      const startIndex = userInputElement.current!.selectionStart
      const endIndex = userInputElement.current!.selectionEnd
      if (isInput(value)) {
        setInput((prev) => insertTextAtCursor(prev, mapInput(keys, value), startIndex!, endIndex!))
      } else if (value == 'Backspace') {
        setInput((prev) => backspaceAtCursor(prev, startIndex!, endIndex!))
      }
    }
  }

  const endGame = () => {
    if (!gameEnd) {
      const wordsLeft = !quoteLeft ? 0 : quoteLeft.split(' ').length
      const opponentWordsLeft = !opponentQuoteLeft ? 0 : opponentQuoteLeft.split(' ').length
      const wordCount = words.length - wordsLeft
      const opponentWordCount = words.length - opponentWordsLeft
      const gameTime = startTime - time

      if (wordCount > opponentWordCount) {
        setGameResult('You win!')
      } else if (wordCount < opponentWordCount) {
        setGameResult('You lose!')
      }

      const stats = {
        [user?.uid as string]: {
          wordCount: wordCount,
        },
        opponent: {
          wordCount: opponentWordCount,
        },
        gameTime: gameTime,
      }

      setGameStats(stats)
      setGameEnd(true)
    }
  }

  let opponent = 'test'
  for (const player in players) {
    if (player !== user?.uid) {
      opponent = player
    }
  }

  useEffect(() => {
    onValue(ref(database, `rooms/${roomId}/nextWord/${opponent}`), (snapshot) => {
      if (snapshot.exists()) {
        setOpponentInput(snapshot.val())
      } else {
        console.log('Opponent nextWord not in db')
      }
    })

    onValue(ref(database, `rooms/${roomId}/quoteLeft/${opponent}`), (snapshot) => {
      if (snapshot.exists()) {
        setOpponentQuoteLeft(snapshot.val())
      } else {
        console.log('Opponent quoteLeft not in db')
      }
    })
  })

  useEffect(() => {
    if (input === words[nextWordIndex]) {
      const nextSpaceIndex = quoteLeft.indexOf(' ')
      if (nextSpaceIndex === -1) {
        setInput('')
        setQuoteLeft('')
        set(dbInputRef, '')
        set(dbQuoteLeftRef, '')
      } else {
        const tempQuote = quoteLeft.slice(nextSpaceIndex + 1)
        setInput('')
        setQuoteLeft(tempQuote)
        set(dbInputRef, '')
        set(dbQuoteLeftRef, tempQuote)
      }
    }
  }, [input])

  useEffect(() => {
    if (quoteLeft !== quote) {
      setNextWordIndex(nextWordIndex + 1)
      if (!quoteLeft) {
        endGame()
      }
    }
  }, [quoteLeft])

  useEffect(() => {
    if (!opponentQuoteLeft) {
      endGame()
    }
  }, [opponentQuoteLeft])

  useEffect(() => {
    if (startTime < 0) {
      setStartTime(time)
    }
    if (time == 0) {
      endGame()
    }
  }, [time])

  useEffect(() => {
    set(ref(database, `rooms/${roomId}/players/${user?.uid}`), user?.displayName)
  }, [])

  useEffect(() => {
    setQuoteLeft(quote)
    setOpponentQuoteLeft(quote)
  }, [quote])

  return (
    <div className={styles.gameWindow}>
      <Timer time={time} />
      <div className={styles.textContainerMP}>
        <div className={styles.opponentDisplay}>{`${players[opponent]} is typing...`}</div>
        <TextDisplay quote={opponentQuoteLeft} input={opponentInput} />
        <hr className={styles.separator}></hr>
        <TextDisplay quote={quoteLeft} input={input} />
      </div>
      <div className={styles.inputContainer}>
        <input
          type='text'
          autoFocus
          className={styles.userInput}
          ref={userInputElement}
          value={input}
          placeholder='Start typing!'
          onChange={() => {
            window.requestAnimationFrame(() => {
              userInputElement.current!.setSelectionRange(cursor, cursor)
            })
          }}
          onKeyDown={handleKeyDown}
        ></input>
      </div>
      <Keyboard keys={keys}></Keyboard>

      {gameEnd && <GameEnd outcomeMessage={gameResult} gameStats={gameStats} />}
    </div>
  )
}

export default MultiplayerGame
