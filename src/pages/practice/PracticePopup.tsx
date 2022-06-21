import { Checkbox } from 'components'
import React, { useState } from 'react'
import Slider from 'react-input-slider'

import { GameOptions } from 'pages/practice/Practice'

import './PracticePopup.styles.css'

interface PracticePopupProps {
  onSubmit: (options: GameOptions) => void
  toggleClose: () => void
}

const PracticePopup: React.FC<PracticePopupProps> = ({ onSubmit, toggleClose }) => {
  const [options, setOptions] = useState({
    withinHand: true,
    withinRow: true,
    time: 120,
  })
  return (
    <div className='modal-container show-modal' id='play-menu'>
      <div className='play-menu-window'>
        <div className='play-menu-header-bar'>
          <div className='play-menu-title'>Game Settings</div>
          <button className='modal-close-button' onClick={toggleClose} id='play-menu-close-button'>
            X
          </button>
        </div>
        <form>
          <div className='game-settings-layer'>
            <div className='game-settings-title'>Scrambling Mode</div>
            <Checkbox
              name='withinHand'
              label='Shuffle within hands'
              checked={options.withinHand}
              onClick={() => setOptions({ ...options, withinHand: !options.withinHand })}
            />
            <Checkbox
              name='withinRow'
              label='Shuffle within row'
              checked={options.withinRow}
              onClick={() => setOptions({ ...options, withinRow: !options.withinRow })}
            />
            <hr />
            <div className='game-settings-title'>
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
            id='start-game-button'
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
