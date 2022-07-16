import React, { useEffect, useState } from 'react'
import { keyboardMap, unshuffledMap } from 'utils/keyboard'
import { get, ref, onValue, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { useParams } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { Keyboard, Timer, TextArea, TextDisplay } from 'components'
import { GameEnd } from 'components/game/GameEnd'

import styles from 'components/game/Game.module.css'

export interface GameOptions {
  noShuffle: boolean
  withinHand: boolean
  withinRow: boolean
  time: number
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

const Play: React.FC = () => {
  const { user } = useAuth()
  const { roomId } = useParams()
  const [quoteList, setQuoteList] = useState({})
  const [currentRound, setCurrentRound] = useState(0)
  const [keys, setKeys] = useState<keyboardMap>(unshuffledMap)
  const [players, setPlayers] = useState({})
  const [gameDuration, setGameDuration] = useState(-1)
  const [time, setTime] = useState(-1)
  const [startTime, setStartTime] = useState(-1)
  const [timer, setTimer] = useState(
    setInterval(() => {
      return
    }, 1000),
  )

  const [opponent, setOpponent] = useState('')
  const [input, setInput] = useState('')
  const [opponentInput, setOpponentInput] = useState('')
  const [cursor, setCursor] = useState(0)
  const dbInputRef = ref(database, `rooms/${roomId}/nextWord/${user?.uid}`)
  const dbQuoteLeftRef = ref(database, `rooms/${roomId}/quoteLeft/${user?.uid}`)
  const [gameResult, setGameResult] = useState('Tie!')
  const [gameEnd, setGameEnd] = useState(false)
  const userInputElement = React.useRef<HTMLInputElement>(null)

  const [quote, setQuote] = useState('Fetching quote')
  const [quoteLeft, setQuoteLeft] = useState('@')
  const [words, setWords] = useState(['words'])
  //const words = quote.split(' ').map((s) => s + ' ')
  const [nextWordIndex, setNextWordIndex] = useState(-1)
  const [opponentQuoteLeft, setOpponentQuoteLeft] = useState<string>('Initial')

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
      const gameTime = gameDuration - time

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
      clearInterval(timer)
    }
  }

  useEffect(() => {
    get(ref(database, `rooms/${roomId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const roomObj = snapshot.val()
          setPlayers(roomObj['players'])
          setKeys(roomObj['keyMap'])
          setGameDuration(roomObj['gameOptions']['time'])
          setQuoteList(roomObj['quoteList'])
          setCurrentRound(roomObj['currentRound'])
        } else {
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    if (gameDuration >= 0) {
      setStartTime(Date.now())
    }
  }, [gameDuration])

  useEffect(() => {
    if (gameDuration >= 0 && startTime >= 0) {
      setTimer(
        setInterval(() => {
          const difference = Math.floor((Date.now() - startTime) / 1000)
          setTime(gameDuration - difference)
        }, 100),
      )
    }
  }, [startTime])

  useEffect(() => {
    if (Object.keys(players).length !== 0) {
      for (const player in players) {
        if (player !== user?.uid) {
          setOpponent(player)
        }
      }
    }
  }, [players])

  useEffect(() => {
    if (opponent !== '') {
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
    }
  }, [opponent])

  useEffect(() => {
    if (quoteList && currentRound > 0) {
      const currentQuote: string = quoteList[currentRound as keyof typeof quoteList]
      setQuote(currentQuote)
      setQuoteLeft(currentQuote)
      setWords(currentQuote.split(' ').map((s) => s + ' '))
    }
  }, [quoteList, currentRound])

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
    if (quoteLeft !== '@') {
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
    if (time == 0) {
      endGame()
    }
  }, [time])

  return (
    <div className={styles.gameWindow}>
      <Timer time={time} />
      <div className={styles.textContainerMP}>
        <div className={styles.opponentDisplay}>{`${players[opponent as keyof typeof players]}
          is typing...`}</div>
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

export default Play
