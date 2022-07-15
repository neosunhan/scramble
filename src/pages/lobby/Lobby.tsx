import React, { useEffect, useState } from 'react'
import { useAuth } from 'hooks/useAuth'
import { database } from 'config/firebaseConfig'
import { ref, set, get, child } from 'firebase/database'
import { Link, useNavigate } from 'react-router-dom'
import { generateKeyboard } from 'utils/keyboard'
import { defaultGameOptions } from 'components/firebase/RoomFunctions'

import styles from './Lobby.module.css'

const Lobby: React.FC = () => {
  const [roomToJoin, setRoomToJoin] = useState('')
  const [roomPax, setRoomPax] = useState(1)
  const { user } = useAuth()
  const navigate = useNavigate()

  const createRoom = () => {
    const userId: string = user?.uid as string
    const roomId: string = userId
    set(ref(database, `rooms/${roomId}`), {
      players: {
        [userId]: user?.displayName,
      },
      started: false,
      gameOptions: defaultGameOptions,
      quote: 'Cannot get quote',
      keyMap: generateKeyboard(defaultGameOptions),
    })
  }

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const roomRef = ref(database, `rooms/${roomToJoin}`)
    get(child(roomRef, 'players')).then((snapshot) => {
      if (snapshot.exists()) {
        setRoomPax(Object.keys(snapshot.val()).length)
        if (roomPax == 1) {
          navigate(roomToJoin)
        }
      } else {
        setRoomPax(0)
      }
    })
  }

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
              {roomPax == 2 ? (
                <div className={styles.errorMsg}>* Room is full</div>
              ) : roomPax == 0 ? (
                <div className={styles.errorMsg}>* Room does not exist </div>
              ) : (
                <div></div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Lobby
