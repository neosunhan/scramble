import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { remove, ref, onValue, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { getQuote } from 'api/quotes'
import { generateKeyboard } from 'utils/keyboard'
import { defaultGameOptions } from 'components/firebase/RoomFunctions'

import styles from './GameEnd.module.css'

interface GameEndProps {
  outcomeMessage: string
  gameStats: object
}

const GameEnd: React.FC<GameEndProps> = ({ outcomeMessage, gameStats }) => {
  const { user } = useAuth()
  const { roomId } = useParams()
  const [quote, setQuote] = useState('Cannot get quote')
  const [hostRematch, setHostRematch] = useState(false)
  const [guestRematch, setGuestRematch] = useState(false)
  const navigate = useNavigate()

  const gameTime: number = gameStats['gameTime' as keyof typeof gameStats]
  const words: number = gameStats[user?.uid as keyof typeof gameStats]['wordCount']
  const opponentWords: number = gameStats['opponent' as keyof typeof gameStats]['wordCount']
  const wpm = ((words * 60.0) / gameTime).toFixed(2)
  const opponentWpm = ((opponentWords * 60.0) / gameTime).toFixed(2)

  useEffect(() => {
    getQuote().then((response) => {
      setQuote(response.data.content)
    })
  }, [])

  const createRoom = () => {
    const userId: string = user?.uid as string
    set(ref(database, `rooms/${roomId}`), {
      host: userId,
      players: {
        [userId]: user?.displayName,
      },
      started: false,
      gameOptions: defaultGameOptions,
      quote: quote,
      keyMap: generateKeyboard(defaultGameOptions),
    })
  }

  const joinRoom = () => {
    set(ref(database, `rooms/${roomId}/players/${user?.uid}`), user?.displayName)
    navigate(`/lobby/${roomId}`)
  }

  const hostWantRematch = () => {
    createRoom()
    navigate(`/lobby/${roomId}`)
  }

  const guestWantRematch = () => {
    setGuestRematch(true)
  }

  useEffect(() => {
    const roomRef = ref(database, `/rooms/${roomId}`)

    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setHostRematch(true)
      }
    })
  })

  useEffect(() => {
    if (user?.uid != roomId && guestRematch) {
      joinRoom()
    }
  }, [hostRematch])

  useEffect(() => {
    if (user?.uid != roomId && hostRematch) {
      joinRoom()
    }
  }, [guestRematch])

  return (
    <div className={styles.modalContainer + ' ' + styles.showModal} id='play-menu'>
      <div className={styles.gameEndWindow}>
        <div className={styles.gameEndHeaderBar}>
          <div className={styles.outcomeMessage}>{outcomeMessage}</div>
        </div>
        <div className={styles.statsTitle}>Words-per-minute (WPM)</div>
        <div className={styles.gameStats}>
          <div className={styles.wpmContainer}>
            <div className={styles.wpmTitle}>You:</div>
            <div className={styles.wpm}>{wpm} WPM</div>
          </div>
          <div className={styles.wpmContainer}>
            <div className={styles.wpmTitle}>Them:</div>
            <div className={styles.wpm}>{opponentWpm} WPM</div>
          </div>
        </div>
        <div className={styles.buttonList}>
          {user?.uid == roomId ? (
            <button className={styles.rematchButton} onClick={hostWantRematch}>
              Rematch
            </button>
          ) : guestRematch ? (
            <div className={styles.waitingForHost}>Waiting for host...</div>
          ) : (
            <button className={styles.rematchButton} onClick={guestWantRematch}>
              Rematch
            </button>
          )}
          <div className={styles.lobbyButtonContainer}>
            <Link to='/lobby'>
              <button className={styles.lobbyButton}>Return to lobby</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export { GameEnd }
