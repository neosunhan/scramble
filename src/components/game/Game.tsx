import React, { RefObject, useEffect, useState } from 'react'
import { Keyboard, Timer, TextArea, TextDisplay } from 'components'
import { keyboardMap } from 'utils/keyboard'

import styles from './Game.module.css'
interface GameProps {
  keys: keyboardMap
  quote: string
  time: number
  started: boolean
  startGame: () => void
  setTime: React.Dispatch<React.SetStateAction<number>>
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

const Game: React.FC<GameProps> = ({ keys, quote, time, started, startGame, setTime }) => {
  const [input, setInput] = useState('')
  const [cursor, setCursor] = useState(0)
  const userInputElement = React.useRef<HTMLInputElement>(null)

  const insertTextAtCursor = (
    prev: string,
    input: string,
    currentStart: number,
    currentEnd: number,
  ): string => {
    if (currentStart == 0) {
      setCursor(input.length)
      return input + prev.substring(currentEnd, prev.length)
    } else if (currentEnd == prev.length) {
      setCursor(currentStart + input.length)
      return prev.substring(0, currentStart) + input
    } else {
      setCursor(currentStart + input.length)
      return prev.substring(0, currentStart) + input + prev.substring(currentEnd, prev.length)
    }
  }

  const backspaceAtCursor = (prev: string, currentStart: number, currentEnd: number): string => {
    if (currentStart == currentEnd) {
      if (currentStart != 0) {
        setCursor(currentStart - 1)
        return prev.substring(0, currentStart - 1) + prev.substring(currentStart, prev.length)
      } else {
        return prev
      }
    } else {
      return insertTextAtCursor(prev, '', currentStart, currentEnd)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }
    if (document.activeElement == userInputElement.current) {
      if (!started) {
        startGame()
      }
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

  useEffect(() => {
    if (!started) {
      setInput('')
    }
  }, [started])

  useEffect(() => {
    if (input === quote) {
      setTime(0)
      setInput('')
    }
  }, [input])

  return (
    <div className={styles.gameWindow}>
      <Timer time={time} />
      <div className={styles.textContainerSP}>
        <TextDisplay quote={quote} input={input} />
      </div>
      <div className={styles.inputContainer}>
        <input
          type='text'
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
    </div>
  )
}

export default Game
