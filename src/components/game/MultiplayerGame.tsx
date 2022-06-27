import React, { useEffect, useState } from 'react'
import { Keyboard, Timer, TextArea, TextDisplay } from 'components'
import { keyboardMap } from 'utils/keyboard'

import styles from './Game.module.css'
import { useAuth } from 'hooks/useAuth'
import { DatabaseReference, onValue, ref, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
interface MultiplayerGameProps {
  roomId: string
  keys: keyboardMap
  quote: string
  time: number
  players: { [index: string]: string }
}

const mapInput = (keys: keyboardMap, char: string): string => {
  const upperChar = char.toUpperCase()
  const newChar = keys[upperChar as keyof keyboardMap] ?? char
  const isUpper = upperChar == char
  return isUpper ? newChar : newChar.toLowerCase()
}

const handleChangeInput = (
  prev: string,
  input: string,
  keys: keyboardMap,
  dbRef: DatabaseReference,
) => {
  let newString: string
  if (prev.length >= input.length) {
    newString = prev.slice(0, input.length)
  } else {
    newString = prev + mapInput(keys, input.charAt(input.length - 1))
  }
  set(dbRef, newString)
  return newString
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomId,
  keys,
  quote,
  time,
  players,
}) => {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [opponentInput, setOpponentInput] = useState('')
  const dbInputRef = ref(database, `rooms/${roomId}/textInput/${user?.uid}`)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput((prev) => handleChangeInput(prev, e.target.value, keys, dbInputRef))
  }

  let opponent = ''
  for (const player in players) {
    if (player !== user?.uid) {
      opponent = player
    }
  }
  useEffect(() => {
    onValue(ref(database, `rooms/${roomId}/textInput/${opponent}`), (snapshot) => {
      if (snapshot.exists()) {
        setOpponentInput(snapshot.val())
      } else {
        console.log('Opponent input not in db')
      }
    })
  })

  return (
    <div className={styles.gameWindow}>
      <Timer time={time} />
      <div>{`${players[opponent]}: `}</div>
      <TextDisplay quote={quote} input={opponentInput} />
      <TextDisplay quote={quote} input={input} />
      <div className={styles.container}>
        <TextArea input={input} onChange={handleChange} />
      </div>
      <Keyboard keys={keys}></Keyboard>
    </div>
  )
}

export default MultiplayerGame
