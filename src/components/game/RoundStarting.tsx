import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { remove, ref, onValue, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { getQuote } from 'api/quotes'
import { generateKeyboard } from 'utils/keyboard'
import { defaultGameOptions } from 'components/firebase/RoomFunctions'

import styles from './RoundStarting.module.css'

interface RoundStartingProps {
  round: number
  countdownTime: number
  gameStats: object
}

const RoundStarting: React.FC<RoundStartingProps> = ({ round, countdownTime, gameStats }) => {
  const userScore = 0
  const opponentScore = 0
  return (
    <div className={styles.modalContainer + ' ' + styles.showModal} id='play-menu'>
      <div className={styles.roundStartWindow}>
        <div className={styles.roundStartHeaderBar}>
          <div className={styles.currentRound}>Round {round}</div>
          <div className={styles.scoreBoard}>
            {userScore} - {opponentScore}
          </div>
        </div>
        <div className={styles.startingMessage}>Starts in:</div>
        <div className={styles.countdownTime}>{countdownTime}</div>
        <div className={styles.gameStats}>
          <div className={styles.statsTitle}> Words-per-minute (WPM)</div>
          <div className={styles.wpmContainer}>
            <div className={styles.wpmTitle}>You:</div>
            <div className={styles.wpm}> WPM</div>
          </div>
          <div className={styles.wpmContainer}>
            <div className={styles.wpmTitle}>Them:</div>
            <div className={styles.wpm}> WPM</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { RoundStarting }
