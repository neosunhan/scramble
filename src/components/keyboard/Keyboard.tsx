import React, { useState, useEffect } from 'react'
import { KeyboardKey } from 'components'
import { keyboardPositions } from 'utils/keyboard'
import { keyboard } from '@testing-library/user-event/dist/keyboard'

interface KeyboardProps {
  keys: string[]
  setInput: React.Dispatch<React.SetStateAction<string>>
}

const Keyboard: React.FC<KeyboardProps> = ({ keys, setInput }) => {
  const [pressed, setPressed] = useState('')

  const handleKeydown = (e: KeyboardEvent) => {
    const upperKey = e.key.toUpperCase()
    const mappedKey = keys[keyboardPositions.indexOf(upperKey)] ?? ''
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
            {keys.slice(0, 10).map((key, index) => (
              <KeyboardKey key={index} letter={key} pressed={pressed} setPressed={setPressed} />
            ))}
          </div>
        </li>

        <li>
          <div className='keyboard-row'>
            {keys.slice(10, 19).map((key, index) => (
              <KeyboardKey
                key={index + 10}
                letter={key}
                pressed={pressed}
                setPressed={setPressed}
              />
            ))}
          </div>
        </li>

        <li>
          <div className='keyboard-row'>
            {keys.slice(20, 27).map((key, index) => (
              <KeyboardKey
                key={index + 20}
                letter={key}
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
