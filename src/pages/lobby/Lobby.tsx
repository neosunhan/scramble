import React, { useEffect, useState } from 'react'
import { useAuth } from 'hooks/useAuth'
import { database } from 'config/firebaseConfig'
import { ref, set } from 'firebase/database'
import { Link, useNavigate } from 'react-router-dom'
import { generateKeyboard } from 'utils/keyboard'
import { GameOptions } from 'pages/play/Play'
import { getQuote } from 'api/quotes'

import styles from './Lobby.module.css'

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
      host: userId,
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
      setQuote(response.data.content)
    })
  }, [])

  return (
    <div className={styles.lobby}>
      <div className={styles.lobbyContainer}>
        <div className={styles.createRoom}>
          <div>Click on this to host a game!</div>
          <Link to={user?.uid as string}>
            <button className={styles.lobbyButton} onClick={createRoom}>
              Create room
            </button>
          </Link>
        </div>
        <div className={styles.joinRoom}>
          <form onSubmit={joinRoom}>
            <div className={styles.joinRoomContainer}>
              <div>Have a code to an existing room?</div>
              <input
                className={styles.roomInput}
                type='text'
                value={roomToJoin}
                onChange={(e) => setRoomToJoin(e.target.value)}
                autoFocus
              />
              <input className={styles.lobbyButton} type='submit' value='Join Room'></input>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Lobby
