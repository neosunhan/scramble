import { Checkbox } from 'components'
import React, { useState } from 'react'
import Slider from 'react-input-slider'

import { GameOptions } from 'pages/practice/Practice'

import styles from './PracticePopup.module.css'

interface PracticePopupProps {
  onSubmit: (options: GameOptions) => void
  toggleClose: () => void
}

const PracticePopup: React.FC<PracticePopupProps> = ({ onSubmit, toggleClose }) => {
  const [options, setOptions] = useState({
    noShuffle: false,
    withinHand: true,
    withinRow: true,
    time: 120,
  })
  return (
    <div className={styles.modalContainer + ' ' + styles.showModal} id='play-menu'>
      <div className={styles.playMenuWindow}>
        <div className={styles.playMenuHeaderBar}>
          <div className={styles.playMenuTitle}>Game Settings</div>
          <button
            className={styles.modalCloseButton + ' ' + styles.playMenuCloseButton}
            onClick={toggleClose}
          >
            X
          </button>
        </div>
        <form className={styles.gameSettingsForm}>
          <div className={styles.gameSettingsLayer}>
            <div className={styles.gameSettingsTitle}>Scrambling Mode</div>
            <Checkbox
              name='withinHand'
              label='Shuffle within hands'
              checked={options.withinHand}
              onClick={(e) => {
                e.preventDefault()
                setOptions({ ...options, withinHand: !options.withinHand })
              }}
            />
            <Checkbox
              name='withinRow'
              label='Shuffle within row'
              checked={options.withinRow}
              onClick={(e) => {
                e.preventDefault()
                setOptions({ ...options, withinRow: !options.withinRow })
              }}
            />
            <hr />
            <div className={styles.gameSettingsTitle}>
              Time Setting: &nbsp;&nbsp;<span id='time-setting'>{options.time}</span>
            </div>
            <Slider
              axis='x'
              xmin={1}
              xmax={240}
              x={options.time}
              onChange={({ x }) => setOptions({ ...options, time: x })}
            />
          </div>
          <button
            className={styles.startGameButton}
            onClick={(e) => {
              e.preventDefault()
              onSubmit(options)
              toggleClose()
            }}
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  )
}

export { PracticePopup }
