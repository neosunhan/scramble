import React, { useEffect, useState } from 'react'

import styles from './KeyboardKey.module.css'

interface KeyboardKeyProps {
  letter: string
  pressed: string
  setPressed: React.Dispatch<React.SetStateAction<string>>
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({ letter, pressed, setPressed }) => {
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    if (pressed === letter) {
      setAnimate(true)
      setTimeout(() => {
        setAnimate(false)
        setPressed('')
      }, 100)
    } else {
      setAnimate(false)
    }
  }, [pressed])

  return (
    <div className={styles.key + (animate ? ' ' + styles.pressed : '')}>
      <kbd>{letter}</kbd>
    </div>
  )
}

export default KeyboardKey
