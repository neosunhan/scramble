import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import styles from './GameEnd.module.css'

interface GameEndProps {
  outcomeMessage: string
  toggleClose: () => void
}

const GameEnd: React.FC<GameEndProps> = ({ outcomeMessage, toggleClose }) => {
  return (
    <div className={styles.modalContainer + ' ' + styles.showModal} id='play-menu'>
      <div className={styles.gameEndWindow}>
        <div className={styles.playMenuHeaderBar}>
          <div className={styles.playMenuTitle}>{outcomeMessage}</div>
          <button
            className={styles.modalCloseButton + ' ' + styles.playMenuCloseButton}
            onClick={toggleClose}
          >
            X
          </button>
        </div>
        <div className={styles.buttonList}>
          <button className={styles.rematchButton}>Rematch</button>
          <div className={styles.lobbyButtonContainer}>
            <Link to='/lobby'>
              <button className={styles.lobbyButton}>Back to lobby</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export { GameEnd }
