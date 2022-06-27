import React, { useEffect, useState } from 'react'
import { Keyboard, Timer, TextArea, TextDisplay } from 'components'
import { keyboardMap } from 'utils/keyboard'
import { GameEnd } from './GameEnd'
import styles from './Game.module.css'
import { useAuth } from 'hooks/useAuth'
import { remove, DatabaseReference, onValue, ref, set } from 'firebase/database'
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
  const [gameResult, setGameResult] = useState('Tie!')
  const [gameEnd, setGameEnd] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput((prev) => handleChangeInput(prev, e.target.value, keys, dbInputRef))
  }

  let opponent = ''
  for (const player in players) {
    if (player !== user?.uid) {
      opponent = player
    }
  }

  const endGame = () => {
    setGameEnd(true)
    remove(ref(database, `rooms/${roomId}`))
  }

  useEffect(() => {
    onValue(ref(database, `rooms/${roomId}/textInput/${opponent}`), (snapshot) => {
      if (snapshot.exists()) {
        setOpponentInput(snapshot.val())
      } else {
        console.log('Opponent input not in db')
      }
    })
    if (opponentInput == quote) {
      setGameResult('You lost!')
      endGame()
    }
  })

  useEffect(() => {
    if (input == quote) {
      setGameResult('You won!')
      endGame()
    }
  }, [input])

  useEffect(() => {
    if (time == 0) {
      endGame()
    }
  }, [time])

  return (
    <div className={styles.gameWindow}>
      <Timer time={gameEnd ? 0 : time} />
      <div className={styles.opponentDisplay}>{`${players[opponent]} is typing...`}</div>
      <TextDisplay quote={quote} input={opponentInput} />
      <hr className={styles.separator}></hr>
      <TextDisplay quote={quote} input={input} />
      <div className={styles.container}>
        <TextArea input={input} onChange={handleChange} />
      </div>
      <Keyboard keys={keys}></Keyboard>

      {gameEnd && <GameEnd outcomeMessage={gameResult} />}
    </div>
  )
}

export default MultiplayerGame
