import React, { useEffect, useState } from 'react'
import { keyboardMap, unshuffledMap } from 'utils/keyboard'
import { get, ref, onValue, set, increment, serverTimestamp } from 'firebase/database'
import { database, firebaseAuth } from 'config/firebaseConfig'
import { useParams } from 'react-router-dom'
import { useAuth } from 'hooks/useAuth'
import { Keyboard, Timer, TextDisplay } from 'components'
import { GameEnd } from 'components/game/GameEnd'
import { RoundStarting } from 'components/game/RoundStarting'
import { powerups } from 'components/powerups/powerups'

import styles from 'components/game/Game.module.css'
import { off } from 'process'
import { clear } from 'console'

export interface GameOptions {
  noShuffle: boolean
  withinHand: boolean
  withinRow: boolean
  time: number
  numberOfRounds: number
}

const mapInput = (keys: keyboardMap, char: string): string => {
  const upperChar = char.toUpperCase()
  const newChar = keys[upperChar as keyof keyboardMap] ?? char
  const isUpper = upperChar == char
  return isUpper ? newChar : newChar.toLowerCase()
}

function isInput(str: string) {
  return isLetter(str) || isOtherKey(str)
}

function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i)
}

function isOtherKey(str: string) {
  return str.length === 1 && str.match(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~123456789 \b]/)
}

const Play: React.FC = () => {
  const { user } = useAuth()
  const { roomId } = useParams()
  const [quoteList, setQuoteList] = useState({})
  const [currentRound, setCurrentRound] = useState(0)
  const [keys, setKeys] = useState<keyboardMap>(unshuffledMap)
  const [players, setPlayers] = useState({})
  const [gameDuration, setGameDuration] = useState(-1)
  const [time, setTime] = useState(-1)
  const [timeOffset, setTimeOffset] = useState(-1)
  const [timer, setTimer] = useState(
    setInterval(() => {
      return
    }, 1000),
  )
  const intervals: NodeJS.Timer[] = []

  const [opponent, setOpponent] = useState('')
  const [input, setInput] = useState('')
  const [opponentInput, setOpponentInput] = useState('')
  const [cursor, setCursor] = useState(0)
  const dbInputRef = ref(database, `rooms/${roomId}/nextWord/${user?.uid}`)
  const dbQuoteLeftRef = ref(database, `rooms/${roomId}/quoteLeft/${user?.uid}`)
  const [gameEnd, setGameEnd] = useState(false)
  const userInputElement = React.useRef<HTMLInputElement>(null)

  const dbPowerupAvailableRef = ref(database, `rooms/${roomId}/powerupAvailable`)
  const [powerup, setPowerup] = useState(0)
  const [powerupAvailable, setPowerupAvailable] = useState(false)
  const [powerupMode, setPowerupMode] = useState(false)
  const [powerupQuote, setPowerupQuote] = useState('')
  const [powerupDescription, setPowerupDescription] = useState('')
  const [powerupInput, setPowerupInput] = useState('')
  const [powerupCursor, setPowerupCursor] = useState(0)
  const [powerupEarned, setPowerupEarned] = useState(false)
  const [powerupUsed, setPowerupUsed] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)

  const [quoteLeft, setQuoteLeft] = useState('@')
  const [opponentQuoteLeft, setOpponentQuoteLeft] = useState<string>('@')
  const [words, setWords] = useState(['@'])
  const [nextWordIndex, setNextWordIndex] = useState(-1)

  const dbRoundStartedRef = ref(database, `rooms/${roomId}/roundStarted`)
  const dbCurrentRoundRef = ref(database, `rooms/${roomId}/currentRound`)
  const dbRoundStatsRef = ref(database, `rooms/${roomId}/roundStats/${user?.uid}`)
  const dbGameStatsRef = ref(database, `rooms/${roomId}/gameStats/${user?.uid}`)
  const dbScoreRef = ref(database, `rooms/${roomId}/score/${user?.uid}`)

  const [roundStats, setRoundStats] = useState({
    wordCount: 0,
    gameTime: 0,
    round: 0,
  })
  const [opponentRoundStats, setOpponentRoundStats] = useState({
    wordCount: 0,
    gameTime: 0,
    round: 0,
  })
  const [gameStats, setGameStats] = useState({
    wordCount: 0,
    gameTime: 0,
  })
  const [scoreBoard, setScoreBoard] = useState({})

  const [roundStart, setRoundStart] = useState(false)
  const [countdown, setCountdown] = useState(
    setInterval(() => {
      return
    }, 1000),
  )
  const [countdownTime, setCountdownTime] = useState(5)
  const [numberOfRounds, setNumberOfRounds] = useState(7)
  const [roundResult, setRoundResult] = useState('Tied')
  const countdownIntervals: NodeJS.Timer[] = []

  const insertTextAtCursor = (
    prev: string,
    input: string,
    currentStart: number,
    currentEnd: number,
  ): string => {
    let newString: string
    if (currentStart == 0) {
      setCursor(input.length)
      newString = input + prev.substring(currentEnd, prev.length)
    } else if (currentEnd == prev.length) {
      setCursor(currentStart + input.length)
      newString = prev.substring(0, currentStart) + input
    } else {
      setCursor(currentStart + input.length)
      newString = prev.substring(0, currentStart) + input + prev.substring(currentEnd, prev.length)
    }
    set(dbInputRef, newString)
    return newString
  }

  const insertTextAtPowerupCursor = (
    prev: string,
    input: string,
    currentStart: number,
    currentEnd: number,
  ): string => {
    let newString: string
    if (currentStart == 0) {
      setPowerupCursor(input.length)
      newString = input + prev.substring(currentEnd, prev.length)
    } else if (currentEnd == prev.length) {
      setPowerupCursor(currentStart + input.length)
      newString = prev.substring(0, currentStart) + input
    } else {
      setPowerupCursor(currentStart + input.length)
      newString = prev.substring(0, currentStart) + input + prev.substring(currentEnd, prev.length)
    }
    return newString
  }

  const backspaceAtCursor = (prev: string, currentStart: number, currentEnd: number): string => {
    let newString: string
    if (currentStart == currentEnd) {
      if (currentStart != 0) {
        setCursor(currentStart - 1)
        newString = prev.substring(0, currentStart - 1) + prev.substring(currentStart, prev.length)
      } else {
        newString = prev
      }
      set(dbInputRef, newString)
      return newString
    } else {
      return insertTextAtCursor(prev, '', currentStart, currentEnd)
    }
  }

  const backspaceAtPowerupCursor = (
    prev: string,
    currentStart: number,
    currentEnd: number,
  ): string => {
    let newString: string
    if (currentStart == currentEnd) {
      if (currentStart != 0) {
        setPowerupCursor(currentStart - 1)
        newString = prev.substring(0, currentStart - 1) + prev.substring(currentStart, prev.length)
      } else {
        newString = prev
      }
      return newString
    } else {
      return insertTextAtPowerupCursor(prev, '', currentStart, currentEnd)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (powerupAvailable && e.ctrlKey) {
      setPowerupMode(true)
      userInputElement.current?.focus()
      return
    }
    if (powerupEarned && e.ctrlKey && !powerupUsed) {
      switch (powerup) {
        case 0:
          setInput(words[nextWordIndex])
          break
        case 1:
          const scrambled = keys
          setKeys(unshuffledMap)
          setTimeout(() => {
            setKeys(scrambled)
          }, 10000)
          break
        case 2:
          set(ref(database, `rooms/${roomId}/displayKeyboard/${opponent}`), false)
          break
        default:
          console.log(`Powerup ${powerup} not recognized`)
      }
      setPowerupUsed(true)
      return
    }
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }
    if (document.activeElement == userInputElement.current) {
      const value = e.key
      const startIndex = userInputElement.current!.selectionStart
      const endIndex = userInputElement.current!.selectionEnd
      if (isInput(value)) {
        setInput((prev) => insertTextAtCursor(prev, mapInput(keys, value), startIndex!, endIndex!))
      } else if (value == 'Backspace') {
        setInput((prev) => backspaceAtCursor(prev, startIndex!, endIndex!))
      }
    }
  }

  const handlePowerupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (powerupAvailable && e.ctrlKey) {
      setPowerupMode(false)
      userInputElement.current?.focus()
      return
    }
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }
    if (document.activeElement == userInputElement.current) {
      const value = e.key
      const startIndex = userInputElement.current!.selectionStart
      const endIndex = userInputElement.current!.selectionEnd
      if (isInput(value)) {
        setPowerupInput((prev) =>
          insertTextAtPowerupCursor(prev, mapInput(keys, value), startIndex!, endIndex!),
        )
      } else if (value == 'Backspace') {
        setPowerupInput((prev) => backspaceAtPowerupCursor(prev, startIndex!, endIndex!))
      }
    }
  }

  const sumStats = (obj1: object, obj2: object) => {
    return Object.keys(obj1).reduce((acc: any, key) => {
      if (typeof obj2[key as keyof typeof obj2] === 'object') {
        acc[key as keyof typeof acc] = sumStats(
          obj1[key as keyof typeof obj1],
          obj2[key as keyof typeof obj2],
        )
      } else if (obj2.hasOwnProperty(key)) {
        acc[key as keyof typeof acc] =
          obj1[key as keyof typeof obj1] + obj2[key as keyof typeof obj2]
      }
      return acc
    }, {})
  }

  const endRound = () => {
    clearInterval(timer)
    const wordsLeft = !quoteLeft ? 0 : quoteLeft.split(' ').length
    const wordCount = words.length - wordsLeft
    const gameTime = gameDuration - time
    const statsObj = {
      wordCount,
      gameTime,
      round: currentRound,
    }
    const gameStatsObj = sumStats(statsObj, gameStats)
    setRoundStats(statsObj)
    set(dbRoundStatsRef, statsObj)
    setGameStats(gameStatsObj)
    set(dbGameStatsRef, gameStatsObj)
    if (user?.uid === roomId) {
      set(dbPowerupAvailableRef, true)
      set(
        ref(database, `rooms/${roomId}/powerup`),
        Math.floor(Math.random() * Object.keys(powerups).length),
      )
    }
    setPowerupMode(false)
    setPowerupInput('')
    setPowerupCursor(0)
    setPowerupEarned(false)
    setPowerupUsed(false)
    setShowKeyboard(true)

    setNextWordIndex(-1)
    if (user?.uid === roomId) {
      set(dbCurrentRoundRef, increment(1))
      set(dbRoundStartedRef, false)
    }
  }

  useEffect(() => {
    get(ref(database, `rooms/${roomId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const roomObj = snapshot.val()
          setPlayers(roomObj['players'])
          setKeys(roomObj['keyMap'])
          setGameDuration(roomObj['gameOptions']['time'])
          setQuoteList(roomObj['quoteList'])
          setNumberOfRounds(roomObj['gameOptions']['numberOfRounds'])
        }
      })
      .catch((error) => {
        console.error(error)
      })

    onValue(dbRoundStartedRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoundStart(snapshot.val())
      }
    })

    onValue(dbCurrentRoundRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentRound(snapshot.val())
      }
    })

    onValue(ref(database, `rooms/${roomId}/score`), (snapshot) => {
      if (snapshot.exists()) {
        setScoreBoard(snapshot.val())
      }
    })

    onValue(ref(database, '.info/serverTimeOffset'), (snapshot) => {
      if (snapshot.exists()) {
        setTimeOffset(snapshot.val())
      }
    })
  }, [])

  useEffect(() => {
    if (countdownTime === 0 && !gameEnd) {
      if (user?.uid === roomId) {
        set(dbRoundStartedRef, true)
        set(ref(database, `rooms/${roomId}/timers/game`), serverTimestamp())
      }
      clearInterval(countdown)
      setCountdownTime(5)
    }
  }, [countdownTime])

  useEffect(() => {
    if (!gameEnd) {
      if (!roundStart) {
        setTime(gameDuration)
      }
    }
  }, [gameDuration, roundStart])

  useEffect(() => {
    if (Object.keys(players).length !== 0) {
      for (const player in players) {
        if (player !== user?.uid) {
          setOpponent(player)
        }
      }
    }
  }, [players])

  useEffect(() => {
    if (opponent !== '') {
      onValue(ref(database, `rooms/${roomId}/nextWord/${opponent}`), (snapshot) => {
        if (snapshot.exists()) {
          setOpponentInput(snapshot.val())
        } else {
          console.log('Opponent nextWord not in db')
        }
      })

      onValue(ref(database, `rooms/${roomId}/quoteLeft/${opponent}`), (snapshot) => {
        if (snapshot.exists()) {
          setOpponentQuoteLeft(snapshot.val())
        } else {
          console.log('Opponent quoteLeft not in db')
        }
      })

      onValue(ref(database, `rooms/${roomId}/roundStats/${opponent}`), (snapshot) => {
        if (snapshot.exists()) {
          setOpponentRoundStats(snapshot.val())
        }
      })

      onValue(ref(database, `rooms/${roomId}/timers/countdown`), (snapshot) => {
        if (snapshot.exists()) {
          const startAt = snapshot.val()
          const tempInterval = setInterval(() => {
            const timeLeft = Math.ceil((5 * 1000 - (Date.now() - startAt + timeOffset)) / 1000)
            if (timeLeft < 0) {
              clearInterval(tempInterval)
            } else {
              setCountdownTime(timeLeft)
            }
          }, 100)
          setCountdown(tempInterval)
          countdownIntervals.forEach((e) => clearInterval(e))
          countdownIntervals.push(tempInterval)
        }
      })

      onValue(ref(database, `rooms/${roomId}/timers/game`), (snapshot) => {
        if (snapshot.exists()) {
          const startAt = snapshot.val()
          const tempInterval = setInterval(() => {
            const timeLeft = Math.ceil(
              (gameDuration * 1000 - (Date.now() - startAt + timeOffset)) / 1000,
            )
            if (timeLeft < 0) {
              clearInterval(tempInterval)
            } else {
              setTime(timeLeft)
            }
          }, 100)
          setTimer(tempInterval)
          intervals.forEach((e) => clearInterval(e))
          intervals.push(tempInterval)
        }
      })
    }
  }, [opponent])

  useEffect(() => {
    if (!gameEnd) {
      if (Object.keys(quoteList).length > 0 && currentRound > 0) {
        if (currentRound > numberOfRounds) {
          setGameEnd(true)
        }
        const currentQuote: string = quoteList[currentRound as keyof typeof quoteList]
        set(dbQuoteLeftRef, currentQuote)
        setQuoteLeft(currentQuote)
        setWords(
          currentQuote.split(' ').map((s, index, arr) => (index == arr.length - 1 ? s : s + ' ')),
        )
      }
    }
  }, [quoteList, currentRound])

  useEffect(() => {
    if (input === words[nextWordIndex]) {
      const nextSpaceIndex = quoteLeft.indexOf(' ')
      if (nextSpaceIndex === -1) {
        set(dbQuoteLeftRef, '')
        setQuoteLeft('')
      } else {
        const tempQuote = quoteLeft.slice(nextSpaceIndex + 1)
        setInput('')
        setQuoteLeft(tempQuote)
        set(dbInputRef, '')
        set(dbQuoteLeftRef, tempQuote)
      }
    }
  }, [input])

  useEffect(() => {
    onValue(dbPowerupAvailableRef, (snapshot) => {
      if (snapshot.exists()) {
        setPowerupAvailable(snapshot.val())
      } else {
        console.log('powerupAvailable not in db')
      }
    })

    onValue(ref(database, `rooms/${roomId}/powerup`), (snapshot) => {
      if (snapshot.exists()) {
        setPowerup(snapshot.val())
        setPowerupDescription(powerups[snapshot.val()]['description'])
        setPowerupQuote(powerups[snapshot.val()]['text'])
      } else {
        console.log('powerup not in db')
      }
    })

    onValue(ref(database, `rooms/${roomId}/displayKeyboard/${user?.uid}`), (snapshot) => {
      if (snapshot.exists()) {
        if (!snapshot.val()) {
          setShowKeyboard(false)
          set(ref(database, `rooms/${roomId}/displayKeyboard/${user?.uid}`), true)
          setTimeout(() => {
            setShowKeyboard(true)
          }, 10000)
        }
      } else {
        console.log('displayKeyboard not in db')
      }
    })
  }, [])

  useEffect(() => {
    if (powerupQuote && powerupQuote === powerupInput) {
      set(dbPowerupAvailableRef, false)
      setPowerupEarned(true)
    }
  }, [powerupInput])

  useEffect(() => {
    if (quoteLeft !== '@') {
      setNextWordIndex(nextWordIndex + 1)
      if (!quoteLeft) {
        endRound()
      }
    }
  }, [quoteLeft])

  useEffect(() => {
    if (!opponentQuoteLeft) {
      endRound()
    }
  }, [opponentQuoteLeft])

  useEffect(() => {
    if (time == 0) {
      endRound()
    }
  }, [time])

  useEffect(() => {
    if (!gameEnd) {
      if (!roundStart) {
        setInput('')
        set(dbInputRef, '')
        if (user?.uid == roomId) {
          set(ref(database, `rooms/${roomId}/timers/countdown`), serverTimestamp())
        }
        userInputElement.current?.blur()
      } else if (roundStart) {
        userInputElement.current?.focus()
      }
    }
  }, [roundStart])

  useEffect(() => {
    if (
      roundStats['round'] === opponentRoundStats['round' as keyof typeof opponentRoundStats] &&
      roundStats['round'] > 0
    ) {
      const wordCount = roundStats['wordCount']
      const opponentWordCount = opponentRoundStats['wordCount' as keyof typeof opponentRoundStats]
      if (wordCount > opponentWordCount) {
        set(dbScoreRef, increment(1))
        setRoundResult('won')
      } else if (wordCount < opponentWordCount) {
        setRoundResult('lost')
      } else {
        setRoundResult('Tied')
      }
    }
  }, [roundStats, opponentRoundStats])

  useEffect(() => {
    if (Object.keys(scoreBoard).length > 0) {
      const score = scoreBoard[user?.uid as keyof typeof scoreBoard]
      const opponentScore = scoreBoard[opponent as keyof typeof scoreBoard]
      if (score >= numberOfRounds / 2) {
        setGameEnd(true)
      } else if (opponentScore >= numberOfRounds / 2) {
        setGameEnd(true)
      }
    }
  }, [scoreBoard])

  useEffect(() => {
    if (gameEnd) {
      intervals.forEach((e) => clearInterval(e))
      countdownIntervals.forEach((e) => clearInterval(e))
      setQuoteLeft('Game Ended')
      set(dbQuoteLeftRef, 'Game Ended')
    }
  }, [gameEnd])

  return (
    <div className={styles.gameWindow}>
      <Timer time={time} />
      {powerupAvailable ? (
        <div className={styles.powerUpTitle}>
          Press CTRL to compete for the powerup, first to finish earns it!
        </div>
      ) : powerupEarned ? (
        powerupUsed ? (
          <div className={styles.powerUpTitleUsed}>
            Powerup used! Look out for the new powerup next round!
          </div>
        ) : (
          <div className={styles.powerUpTitleHas}>
            Press CTRL before the end of the round to use the Powerup!
          </div>
        )
      ) : (
        <div className={styles.powerUpTitleUsed}>
          Opponent has earned the powerup. Better luck next time!
        </div>
      )}
      {powerupAvailable && powerupMode ? (
        <>
          <div className={styles.textContainerMP}>
            <div className={styles.powerupDesc}>{powerupDescription}</div>
            <hr className={styles.separator}></hr>
            <TextDisplay quote={powerupQuote} input={powerupInput} />
          </div>
          <div className={styles.inputContainer}>
            <input
              type='text'
              className={styles.userInput}
              ref={userInputElement}
              value={powerupInput}
              placeholder='Start typing!'
              onChange={() => {
                window.requestAnimationFrame(() => {
                  userInputElement.current!.setSelectionRange(powerupCursor, powerupCursor)
                })
              }}
              onKeyDown={handlePowerupKeyDown}
              autoFocus
            ></input>
          </div>
        </>
      ) : (
        <>
          <div className={styles.textContainerMP}>
            <div className={styles.opponentDisplay}>
              {`${players[opponent as keyof typeof players]} is typing...`}
            </div>
            <TextDisplay quote={opponentQuoteLeft} input={opponentInput} />
            <hr className={styles.separator}></hr>
            <TextDisplay quote={quoteLeft} input={input} />
          </div>
          <div className={styles.inputContainer}>
            <input
              type='text'
              className={styles.userInput}
              ref={userInputElement}
              value={input}
              placeholder='Start typing!'
              onChange={() => {
                window.requestAnimationFrame(() => {
                  userInputElement.current!.setSelectionRange(cursor, cursor)
                })
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            ></input>
          </div>
        </>
      )}
      {showKeyboard ? (
        <Keyboard keys={keys}></Keyboard>
      ) : (
        <div className={styles.powerUpHideKeyboard}>[ Keyboard hidden by opponent ]</div>
      )}
      {!roundStart && !gameEnd && (
        <RoundStarting
          roundResult={roundResult}
          round={currentRound}
          numberOfRounds={numberOfRounds}
          countdownTime={countdownTime}
          opponent={opponent}
        />
      )}
      {gameEnd && <GameEnd opponent={opponent} />}
    </div>
  )
}

export default Play
