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

  const [time, setTime] = useState(300)

  const [startTime, setStartTime] = useState(Date.now())

  let gameDuration = time
  useEffect(() => {
    get(ref(database, `rooms/${roomId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const roomObj = snapshot.val()
          setQuote(roomObj['quote'])
          setKeys(roomObj['keyMap'])
          setTime(roomObj['gameOptions']['time'])
          gameDuration = roomObj['gameOptions']['time']
          setPlayers(roomObj['players'])
        } else {
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = Math.floor((Date.now() - startTime) / 1000)
      setTime(gameDuration - difference)
    }, 100)
    return () => clearInterval(interval)
  }, [startTime])

  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  useEffect(() => {
    if (time === 0) {
      setStartTime(Date.now())
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
