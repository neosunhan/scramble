import React, { useEffect, useState } from 'react'
import { keyboardMap, unshuffledMap } from 'utils/keyboard'
import { MultiplayerGame } from 'components'
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
  const [quote, setQuote] = useState('Unable to fetch quote from database')
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

  useEffect(() => {
    get(ref(database, `rooms/${roomId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const roomObj = snapshot.val()
          setQuote(roomObj['quote'])
          setKeys(roomObj['keyMap'])
          setGameDuration(roomObj['gameOptions']['time'])
          setPlayers(roomObj['players'])
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
    if (time === 0) {
      clearInterval(timer)
    }
  }, [time])

  return (
    <>
      <MultiplayerGame
        roomId={roomId as string}
        keys={keys}
        quote={quote}
        time={time}
        players={players}
      />
    </>
  )
}

export default Play
