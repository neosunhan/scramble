import React, { useEffect, useState } from 'react'
import { generateKeyboard, keyboardMap, unshuffledMap } from 'utils/keyboard'
import { Game } from 'components'

import { PracticePopup } from 'pages/practice/PracticePopup'
import { getQuote } from 'api/quotes'

export interface GameOptions {
  noShuffle: boolean
  withinHand: boolean
  withinRow: boolean
  time: number
}

const Practice: React.FC = () => {
  const [popupOpen, setPopupOpen] = useState(true)

  const [options, setOptions] = useState<GameOptions>({
    noShuffle: false,
    withinHand: true,
    withinRow: true,
    time: 120,
  })
  const [keys, setKeys] = useState<keyboardMap>(unshuffledMap)
  const [quote, setQuote] = useState('')
  const [time, setTime] = useState(0)

  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        const difference = Math.floor((Date.now() - startTime) / 1000)
        setTime(options.time - difference)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [startTime])

  useEffect(() => {
    if (time === 0 && started) {
      setStartTime(Date.now())
      setStarted(false)
      setTime(options.time)
      getQuote().then((response) => {
        setQuote(response.data.content)
      })
    }
  }, [time])

  const loadOptions = (options: GameOptions) => {
    setTime(options.time)
    setOptions(options)
    const keyboard = generateKeyboard(options)
    setKeys(keyboard)
    getQuote().then((response) => setQuote(response.data.content))
  }

  const startGame = () => {
    setStarted(true)
    setStartTime(Date.now())
  }

  return (
    <div>
      <Game
        keys={keys}
        quote={quote}
        time={time}
        started={started}
        startGame={startGame}
        setTime={setTime}
      />
      {popupOpen && (
        <PracticePopup toggleClose={() => setPopupOpen(false)} onSubmit={loadOptions} />
      )}
    </div>
  )
}

export default Practice
