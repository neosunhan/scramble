import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { remove, ref, onValue, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { getQuote } from 'api/quotes'
import { generateKeyboard } from 'utils/keyboard'
import { defaultGameOptions } from 'components/firebase/RoomFunctions'

import styles from './RoundStarting.module.css'
import { cursorTo } from 'readline'

interface RoundStartingProps {
  roundResult: string
  round: number
  numberOfRounds: number
  countdownTime: number
  opponent: string
}

const RoundStarting: React.FC<RoundStartingProps> = ({
  roundResult,
  round,
  numberOfRounds,
  countdownTime,
  opponent,
}) => {
  const { user } = useAuth()
  const { roomId } = useParams()
  const [roundStats, setRoundStats] = useState({})
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [wpm, setWpm] = useState('---')
  const [opponentWpm, setOpponentWpm] = useState('---')

  useEffect(() => {
    onValue(ref(database, `rooms/${roomId}/roundStats`), (snapshot) => {
      if (snapshot.exists()) {
        setRoundStats(snapshot.val())
      }
    })
  }, [])

  useEffect(() => {
    if (opponent !== '') {
      onValue(ref(database, `rooms/${roomId}/score`), (snapshot) => {
        if (snapshot.exists()) {
          const scoreObj = snapshot.val()
          setScore(scoreObj[user?.uid as string])
          setOpponentScore(scoreObj[opponent])
        }
      })
    }
  }, [opponent])

  useEffect(() => {
    if (round > 1) {
      if (Object.keys(roundStats).length > 0 && opponent !== '') {
        const userStats = roundStats[user?.uid as keyof typeof roundStats]
        const opponentStats = roundStats[opponent as keyof typeof roundStats]
        const words: number = userStats['wordCount']
        const opponentWords: number = opponentStats['wordCount']
        const gameTime: number = userStats['gameTime']

        setWpm(((words * 60.0) / gameTime).toFixed(2))
        setOpponentWpm(((opponentWords * 60.0) / gameTime).toFixed(2))
      }
    }
  }, [roundStats])

  return (
    <div className={styles.modalContainer + ' ' + styles.showModal} id='play-menu'>
      <div className={styles.roundStartWindow}>
        <div className={styles.roundStartHeaderBar}>
          <div className={styles.currentRound}>
            Round {round}/{numberOfRounds}
          </div>
          <div className={styles.scoreBoard}>
            <span className={roundResult === 'won' ? styles.won : ''}>{score}</span> -{' '}
            <span className={roundResult === 'lost' ? styles.won : ''}>{opponentScore}</span>
          </div>
        </div>
        <div className={styles.startingMessage}>Next round starts in:</div>
        <div className={styles.countdownTime}>{countdownTime}</div>
        <div className={styles.gameStats}>
          {round > 1 && (
            <div className={styles.roundResult}>
              {roundResult === 'Tied' ? roundResult : `You ${roundResult}`}!
            </div>
          )}
          <div className={styles.statsTitle}> Words-per-minute (WPM)</div>
          <div className={styles.wpmContainer}>
            <div className={styles.wpmTitle}>You:</div>
            <div className={styles.wpm}>{wpm} WPM</div>
          </div>
          <div className={styles.wpmContainer}>
            <div className={styles.wpmTitle}>Them:</div>
            <div className={styles.wpm}>{opponentWpm} WPM</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { RoundStarting }
