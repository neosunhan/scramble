import React, { useState, useEffect } from 'react'
import { KeyboardKey } from 'components'

import styles from './Keyboard.module.css'
import { keyboardMap, keyboardRows } from 'utils/keyboard'

interface KeyboardProps {
  keys: keyboardMap
}

const Keyboard: React.FC<KeyboardProps> = ({ keys }) => {
  const [pressed, setPressed] = useState('')

  const handleKeydown = (e: KeyboardEvent) => {
    const upperKey = e.key.toUpperCase()
    const mappedKey = keys[upperKey as keyof keyboardMap] ?? ''
    setPressed(mappedKey)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [keys])

  return (
    <div className={styles.keyboard}>
      <div className={styles.keyboardRow}>
        {Array.from(keyboardRows[0]).map((key, index) => (
          <KeyboardKey
            key={index}
            letter={keys[key as keyof keyboardMap]}
            pressed={pressed}
            setPressed={setPressed}
          />
        ))}
      </div>

      <div className={styles.keyboardRow}>
        {Array.from(keyboardRows[1]).map((key, index) => (
          <KeyboardKey
            key={index + 10}
            letter={keys[key as keyof keyboardMap]}
            pressed={pressed}
            setPressed={setPressed}
          />
        ))}
      </div>

      <div className={styles.keyboardRow}>
        {Array.from(keyboardRows[2]).map((key, index) => (
          <KeyboardKey
            key={index + 19}
            letter={keys[key as keyof keyboardMap]}
            pressed={pressed}
            setPressed={setPressed}
          />
        ))}
      </div>
    </div>
  )
}

export default Keyboard
