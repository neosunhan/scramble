import React, { useState, useEffect } from 'react'
import { KeyboardKey } from 'components'
import { keyboardMap, keyboardRows } from 'utils/keyboard'
import { keyboard } from '@testing-library/user-event/dist/keyboard'

interface KeyboardProps {
  keys: keyboardMap
  setInput: React.Dispatch<React.SetStateAction<string>>
}

const Keyboard: React.FC<KeyboardProps> = ({ keys, setInput }) => {
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
    <div className='keyboard'>
      <ul>
        <li>
          <div className='keyboard-row'>
            {Array.from(keyboardRows[0]).map((key, index) => (
              <KeyboardKey
                key={index}
                letter={keys[key as keyof keyboardMap]}
                pressed={pressed}
                setPressed={setPressed}
              />
            ))}
          </div>
        </li>

        <li>
          <div className='keyboard-row'>
            {Array.from(keyboardRows[1]).map((key, index) => (
              <KeyboardKey
                key={index + 10}
                letter={keys[key as keyof keyboardMap]}
                pressed={pressed}
                setPressed={setPressed}
              />
            ))}
          </div>
        </li>

        <li>
          <div className='keyboard-row'>
            {Array.from(keyboardRows[2]).map((key, index) => (
              <KeyboardKey
                key={index + 20}
                letter={keys[key as keyof keyboardMap]}
                pressed={pressed}
                setPressed={setPressed}
              />
            ))}
          </div>
        </li>
      </ul>
    </div>
  )
}

export default Keyboard
