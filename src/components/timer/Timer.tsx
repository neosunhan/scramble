import React from 'react'

import styles from './Timer.module.css'

interface TimerProps {
  time: number
}
const Timer: React.FC<TimerProps> = ({ time }) => {
  return (
    <div className={styles.timer} id='timer'>
      {time >= 0 ? time : ''}
    </div>
  )
}

export default Timer
