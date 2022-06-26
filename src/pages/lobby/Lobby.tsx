import React, { useEffect, useState } from 'react'
import { useAuth } from 'hooks/useAuth'
import { database } from 'config/firebaseConfig'
import { ref, set } from 'firebase/database'
import { Link, useNavigate } from 'react-router-dom'
import { generateKeyboard } from 'utils/keyboard'
import { GameOptions } from 'pages/play/Play'
import { getQuote } from 'api/quotes'

const Lobby: React.FC = () => {
  const [roomToJoin, setRoomToJoin] = useState('')
  const [quote, setQuote] = useState('Cannot get quote')
  const { user } = useAuth()
  const navigate = useNavigate()

  const gameOptions: GameOptions = {
    noShuffle: false,
    withinHand: true,
    withinRow: true,
    time: 120,
  }

  const createRoom = () => {
    const userId: string = user?.uid as string
    const roomId: string = userId
    set(ref(database, `rooms/${roomId}`), {
      players: {
        [userId]: user?.displayName,
      },
      started: false,
      gameOptions: gameOptions,
      quote: quote,
      keyMap: generateKeyboard(gameOptions),
    })
  }

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    set(ref(database, `rooms/${roomToJoin}/players/${user?.uid}`), user?.displayName)
    navigate(roomToJoin)
  }

  useEffect(() => {
    getQuote().then((response) => {
      console.log(response.data.content)
      setQuote(response.data.content)
    })
  }, [])

  return (
    <div>
      <div>Create a room or join another player&apos;s room!</div>
      <Link to={user?.uid as string}>
        <button onClick={createRoom}>Create room</button>
      </Link>
      <form onSubmit={joinRoom}>
        <input type='text' value={roomToJoin} onChange={(e) => setRoomToJoin(e.target.value)} />
        <input type='submit' value='Join Room'></input>
      </form>
    </div>
  )
}

export default Lobby
