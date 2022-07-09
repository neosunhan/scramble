import React, { useEffect, useState } from 'react'
import { Keyboard, Timer, TextArea, TextDisplay } from 'components'
import { keyboardMap } from 'utils/keyboard'
import { GameEnd } from './GameEnd'
import styles from './Game.module.css'
import { useAuth } from 'hooks/useAuth'
import { remove, DatabaseReference, onValue, ref, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
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
  const dbInputRef = ref(database, `rooms/${roomId}/textInput/${user?.uid}`)
  const [gameResult, setGameResult] = useState('Tie!')
  const [gameEnd, setGameEnd] = useState(false)
  const userInputElement = React.useRef<HTMLTextAreaElement>(null)

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }
    if (document.activeElement == userInputElement.current) {
      const value = e.key
      const startIndex = userInputElement.current!.selectionStart
      const endIndex = userInputElement.current!.selectionEnd
      if (isInput(value)) {
        setInput((prev) => insertTextAtCursor(prev, mapInput(keys, value), startIndex, endIndex))
      } else if (value == 'Backspace') {
        setInput((prev) => backspaceAtCursor(prev, startIndex, endIndex))
      }
    }
  }

  let opponent = ''
  for (const player in players) {
    if (player !== user?.uid) {
      opponent = player
    }
  }

  const endGame = () => {
    setGameEnd(true)
    remove(ref(database, `rooms/${roomId}`))
  }

  useEffect(() => {
    onValue(ref(database, `rooms/${roomId}/textInput/${opponent}`), (snapshot) => {
      if (snapshot.exists()) {
        setOpponentInput(snapshot.val())
      } else {
        console.log('Opponent input not in db')
      }
    })
    if (opponentInput == quote) {
      setGameResult('You lost!')
      endGame()
    }
  })

  useEffect(() => {
    if (input == quote) {
      setGameResult('You won!')
      endGame()
    }
  }, [input])

  useEffect(() => {
    if (time == 0) {
      endGame()
    }
  }, [time])

  return (
    <div className={styles.gameWindow}>
      <Timer time={gameEnd ? 0 : time} />
      <div className={styles.opponentDisplay}>{`${players[opponent]} is typing...`}</div>
      <TextDisplay quote={quote} input={opponentInput} />
      <hr className={styles.separator}></hr>
      <TextDisplay quote={quote} input={input} />
      <div className={styles.container}>
        <textarea
          className={styles.userInput}
          ref={userInputElement}
          value={input}
          onChange={() => {
            window.requestAnimationFrame(() => {
              userInputElement.current!.setSelectionRange(cursor, cursor)
            })
          }}
          onKeyDown={handleKeyDown}
        ></textarea>
      </div>
      <Keyboard keys={keys}></Keyboard>

      {gameEnd && <GameEnd outcomeMessage={gameResult} />}
    </div>
  )
}

export default MultiplayerGame
