import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { remove, ref, onValue, get, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { getQuote } from 'api/quotes'
import { generateKeyboard } from 'utils/keyboard'
import { defaultGameOptions } from 'components/firebase/RoomFunctions'

import styles from './GameEnd.module.css'

interface GameEndProps {
  opponent: string
}

const GameEnd: React.FC<GameEndProps> = ({ opponent }) => {
  const { user } = useAuth()
  const { roomId } = useParams()
  const [score, setScore] = useState(-1)
  const [opponentScore, setOpponentScore] = useState(-1)
  const [gameStats, setGameStats] = useState({})
  const [wpm, setWpm] = useState('')
  const [opponentWpm, setOpponentWpm] = useState('')
  const [outcomeMessage, setOutcomeMessage] = useState('The game was a tie!')

  const [hostRematch, setHostRematch] = useState(0)
  const [guestRematch, setGuestRematch] = useState(false)
  const navigate = useNavigate()
  const roomRef = ref(database, `/rooms/${roomId}`)

  const [roomSnapshot, setRoomSnapshot] = useState({})

  const resetRoom = () => {
    setHostRematch(0)
    set(roomRef, {
      players: {},
      started: false,
      gameOptions: defaultGameOptions,
      quoteList: 'Cannot get quote',
      numberOfRounds: 7,
      keyMap: generateKeyboard(defaultGameOptions),
      score: {
        [user?.uid as string]: score,
        [opponent]: opponentScore,
      },
    })
  }

  const joinRoom = () => {
    set(ref(database, `rooms/${roomId}/players/${user?.uid}`), user?.displayName)
    navigate(`/lobby/${roomId}`)
  }

  const deleteRoom = () => {
    set(roomRef, {
      deleted: true,
    })
  }

  const guestWantRematch = () => {
    setGuestRematch(true)
  }

  useEffect(() => {
    get(ref(database, `rooms/${roomId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          if (Object.keys(roomSnapshot).length === 0) {
            setRoomSnapshot(snapshot.val())
          }
        }
      })
      .catch((error) => {
        console.error(error)
      })

    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomObj = snapshot.val()
        if (roomObj['players']) {
          setHostRematch(1)
        } else if (roomObj['deleted']) {
          setHostRematch(-1)
          remove(roomRef)
        }
      }
    })
  }, [])

  useEffect(() => {
    if ('gameStats' in roomSnapshot && opponent !== '') {
      setGameStats(roomSnapshot['gameStats' as keyof typeof roomSnapshot])
      const scoreObj = roomSnapshot['score' as keyof typeof roomSnapshot]
      setScore(scoreObj[user?.uid as string])
      setOpponentScore(scoreObj[opponent])
    }
  }, [roomSnapshot, opponent])

  useEffect(() => {
    if (Object.keys(gameStats).length > 0 && opponent !== '') {
      const userStats = gameStats[user?.uid as keyof typeof gameStats]
      const opponentStats = gameStats[opponent as keyof typeof gameStats]
      const words: number = userStats['wordCount']
      const opponentWords: number = opponentStats['wordCount']
      const gameTime: number = userStats['gameTime']

      setWpm(((words * 60.0) / gameTime).toFixed(2))
      setOpponentWpm(((opponentWords * 60.0) / gameTime).toFixed(2))
    }
  }, [gameStats])

  useEffect(() => {
    if (score >= 0 && opponentScore >= 0) {
      resetRoom()
      if (score > opponentScore) {
        setOutcomeMessage('You won the game!')
      } else if (score < opponentScore) {
        setOutcomeMessage('You lost the game!')
      }
    }
  }, [score, opponentScore])

  useEffect(() => {
    if (user?.uid != roomId && guestRematch && hostRematch > 0) {
      joinRoom()
    }
  }, [hostRematch])

  useEffect(() => {
    if (user?.uid != roomId && hostRematch > 0) {
      joinRoom()
    }
  }, [guestRematch])

  return (
    <div className={styles.modalContainer + ' ' + styles.showModal} id='play-menu'>
      <div className={styles.gameEndWindow}>
        <div className={styles.gameEndHeaderBar}>
          <div className={styles.outcomeMessage}>{outcomeMessage}</div>
        </div>
        <div className={styles.finalScoreTitle}>Final Score:</div>
        <div className={styles.finalScore}>
          {score} - {opponentScore}
        </div>
        <div className={styles.gameAvg}>Overall Performance</div>
        <div className={styles.wpmAbbr}>Words-per-minute (WPM)</div>
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
            <button className={styles.rematchButton} onClick={joinRoom}>
              Rematch
            </button>
          ) : guestRematch ? (
            hostRematch < 0 ? (
              <div className={styles.waitingForHost}>Host left the game :(</div>
            ) : (
              <div className={styles.waitingForHost}>Waiting for host...</div>
            )
          ) : (
            <button className={styles.rematchButton} onClick={guestWantRematch}>
              Rematch
            </button>
          )}
          <div className={styles.lobbyButtonContainer}>
            <Link to='/lobby'>
              <button className={styles.lobbyButton} onClick={deleteRoom}>
                Return to lobby
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export { GameEnd }
