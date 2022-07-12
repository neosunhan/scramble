import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { remove, ref, onValue, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { useAuth } from 'hooks/useAuth'

import styles from './Room.module.css'

const Room: React.FC = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const [players, setPlayers] = useState({})
  const navigate = useNavigate()

  const leaveRoom = () => {
    if (user?.uid === roomId) {
      remove(ref(database, `rooms/${roomId}`))
    } else {
      remove(ref(database, `rooms/${roomId}/players/${user?.uid}`))
    }
  }

  const startGame = () => {
    let numPlayers = 0
    const textInput: { [input: string]: string } = {}
    for (const player in players) {
      numPlayers++
      textInput[player] = ''
    }
    if (numPlayers === 2) {
      set(ref(database, `rooms/${roomId}/textInput`), textInput)
      set(ref(database, `rooms/${roomId}/started`), true)
    } else {
      alert('Number of players is not 2!')
    }
  }

  useEffect(() => {
    const playersRef = ref(database, `/rooms/${roomId}/players`)
    onValue(playersRef, (snapshot) => {
      setPlayers(snapshot.val())
    })
  }, [roomId])

  useEffect(() => {
    const startedRef = ref(database, `/rooms/${roomId}/started`)

    onValue(startedRef, (snapshot) => {
      if (snapshot.val()) {
        navigate(`/play/${roomId}`)
      }
    })
  })

  useEffect(() => {
    set(ref(database, `rooms/${roomId}/players/${user?.uid}`), user?.displayName)
    window.addEventListener('beforeunload', leaveRoom)
    return () => {
      window.removeEventListener('beforeunload', leaveRoom)
    }
  }, [])

  return players ? (
    <div className={styles.room}>
      <div className={styles.roomContainer}>
        <div className={styles.roomHeader}>
          <div>Room:</div>
          <div>{roomId}</div>
        </div>
        <div className={styles.roomMenu}>
          <div className={styles.tabList}>
            <button className={styles.tab}> Lobby</button>
            <button className={styles.tab}>Customise</button>
          </div>
          <div className={styles.waitingForPlayers}> Waiting for Opponent...</div>
          <div className={styles.playerList}>
            {Object.entries(players).map((entry) => {
              const userId = entry[0]
              let userName = entry[1]
              if (userId === user?.uid) {
                userName += ' (You)'
              }
              if (userId === roomId) {
                userName += ' (Host)'
              }
              return <div key={userId}>{userName as string}</div>
            })}
          </div>
          <div className={styles.menuButtonContainer}>
            {user?.uid === roomId ? (
              <button className={styles.startButton} onClick={startGame}>
                Start game
              </button>
            ) : (
              <div className={styles.waitMessage}>Wait for the host to start the game!</div>
            )}
            <Link to='/lobby'>
              <button className={styles.leaveButton} onClick={leaveRoom}>
                Leave Room
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>{`Room ${roomId} is not open`}</div>
  )
}

export default Room
