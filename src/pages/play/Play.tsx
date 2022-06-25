import React, { useEffect, useState } from 'react'
import { keyboardMap, unshuffledMap } from 'utils/keyboard'
import { Game } from 'components'
import { get, ref } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { useParams } from 'react-router-dom'

export interface GameOptions {
  noShuffle: boolean
  withinHand: boolean
  withinRow: boolean
  time: number
}

const Play: React.FC = () => {
  const { roomId } = useParams()

  let quotes: { [index: number]: string } = { 0: 'Default Quote' }
  let keys: keyboardMap = unshuffledMap
  let gameDuration = 100
  get(ref(database, `rooms/${roomId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const roomObj = snapshot.val()
        quotes = roomObj['quotes']
        keys = roomObj['keyMap']
        gameDuration = roomObj['gameOptions']['time']
      } else {
        console.log(`Room ${roomId} does not exist`)
      }
    })
    .catch((error) => {
      console.error(error)
    })
  const [time, setTime] = useState(0)

  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        const difference = Math.floor((Date.now() - startTime) / 1000)
        setTime(gameDuration - difference)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [startTime])

  useEffect(() => {
    if (time === 0 && started) {
      setStartTime(Date.now())
      setStarted(false)
    }
  }, [time])

  const startGame = () => {
    setStarted(true)
    setStartTime(Date.now())
  }

  return (
    <>
      <Game keys={keys} quote={quotes[0]} time={time} started={started} startGame={startGame} />
    </>
  )
}

export default Play
