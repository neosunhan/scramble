import React, { useEffect, useState } from 'react'
import { Keyboard, Timer, TextArea, TextDisplay } from 'components'
import { keyboardMap } from 'utils/keyboard'

interface PracticeGameProps {
  keys: keyboardMap
  quote: string
  time: number
  started: boolean
  startGame: () => void
}

const mapInput = (keys: keyboardMap, char: string): string => {
  const upperChar = char.toUpperCase()
  const newChar = keys[upperChar as keyof keyboardMap] ?? char
  const isUpper = upperChar == char
  return isUpper ? newChar : newChar.toLowerCase()
}

const handleChangeInput = (prev: string, input: string, keys: keyboardMap) => {
  if (prev.length >= input.length) {
    return prev.slice(0, input.length)
  }
  return prev + mapInput(keys, input.charAt(input.length - 1))
}

const PracticeGame: React.FC<PracticeGameProps> = ({ keys, quote, time, started, startGame }) => {
  const [input, setInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!started) {
      startGame()
    }
    setInput((prev) => handleChangeInput(prev, e.target.value, keys))
  }

  useEffect(() => {
    if (!started) {
      setInput('')
    }
  }, [started])

  return (
    <div className='game-window'>
      <Timer time={time} />
      <TextDisplay quote={quote} input={input} />
      <div className='container'>
        <TextArea input={input} onChange={handleChange} />
      </div>
      <Keyboard keys={keys} setInput={setInput}></Keyboard>
    </div>
  )
}

export default PracticeGame
