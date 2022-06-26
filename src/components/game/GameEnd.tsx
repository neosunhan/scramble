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
        <div>{outcomeMessage}</div>
        <Link to='/lobby'>
          <button className={styles.backToLobbyButton}>Back to lobby</button>
        </Link>
      </div>
    </div>
  )
}

export { GameEnd }
