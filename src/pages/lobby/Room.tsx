import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { remove, ref, onValue, get, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { useAuth } from 'hooks/useAuth'

import styles from './Room.module.css'
import { Checkbox } from 'components'
import Slider from 'react-input-slider'

import { defaultGameOptions } from 'components/firebase/RoomFunctions'
import { generateKeyboard } from 'utils/keyboard'

const Room: React.FC = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const [players, setPlayers] = useState({})
  const [lobby, setLobby] = useState(true)
  const navigate = useNavigate()

  const gameOptionsRef = ref(database, `/rooms/${roomId}/gameOptions`)
  const keyMapRef = ref(database, `/rooms/${roomId}/keyMap`)
  const [settings, setSettings] = useState(defaultGameOptions)
  const [savedSettings, setSavedSettings] = useState(defaultGameOptions)
  const [saved, setSaved] = useState(true)

  let quoteTemp = ''
  get(ref(database, `rooms/${roomId}/quote`)).then((snapshot) => {
    quoteTemp = snapshot.val()
  })

  const leaveRoom = () => {
    if (user?.uid === roomId) {
      remove(ref(database, `rooms/${roomId}`))
    } else {
      remove(ref(database, `rooms/${roomId}/players/${user?.uid}`))
    }
  }

  const startGame = () => {
    let numPlayers = 0
    const nextWord: { [input: string]: string } = {}
    const quoteLeft: { [input: string]: string } = {}

    for (const player in players) {
      numPlayers++
      nextWord[player] = ''
      quoteLeft[player] = quoteTemp
    }
    if (numPlayers === 2) {
      set(ref(database, `rooms/${roomId}/nextWord`), nextWord)
      set(ref(database, `rooms/${roomId}/quoteLeft`), quoteLeft)
      set(ref(database, `rooms/${roomId}/started`), true)
    } else {
      alert('Number of players is not 2!')
    }
  }

  useEffect(() => {
    const playersRef = ref(database, `/rooms/${roomId}/players`)
    onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayers(snapshot.val())
      } else {
        setPlayers({})
      }
    })
  }, [roomId])

  useEffect(() => {
    const startedRef = ref(database, `/rooms/${roomId}/started`)

    onValue(startedRef, (snapshot) => {
      if (snapshot.val()) {
        navigate(`/play/${roomId}`)
      }
    })
  })

  useEffect(() => {
    if (settingsNotEqual()) {
      console.log('Not same')
      setSaved(false)
    } else {
      setSaved(true)
    }
  }, [settings])

  useEffect(() => {
    set(ref(database, `rooms/${roomId}/players/${user?.uid}`), user?.displayName)
    onValue(gameOptionsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSavedSettings(snapshot.val())
      }
    })
    window.addEventListener('beforeunload', leaveRoom)
    return () => {
      window.removeEventListener('beforeunload', leaveRoom)
    }
  }, [])

  const displayName = (entry: [string, unknown]) => {
    const userId = entry[0]
    let userName = entry[1]
    if (userId === user?.uid) {
      userName += ' (You)'
    }
    if (userId === roomId) {
      userName += ' (Host)'
    }
    return <div key={userId}>{userName as string}</div>
  }

  const lobbyOn = () => {
    setLobby(true)
  }

  const lobbyOff = () => {
    setLobby(false)
  }

  const settingsNotEqual = () => {
    return (
      settings.noShuffle !== savedSettings.noShuffle ||
      settings.withinHand !== savedSettings.withinHand ||
      settings.withinRow !== savedSettings.withinRow ||
      settings.time !== savedSettings.time
    )
  }

  const saveSettings = () => {
    if (!saved) {
      set(keyMapRef, generateKeyboard(settings))
      set(gameOptionsRef, settings)
      setSavedSettings(settings)
      setSaved(true)
    }
  }

  const rightSettings = () => {
    return user?.uid === roomId ? settings : savedSettings
  }

  return (
    <div className={styles.room}>
      <div className={styles.roomContainer}>
        <div className={styles.roomHeader}>
          <div>Room:</div>
          <div>{Object.keys(players).length !== 0 ? roomId : 'Host has left the room :('}</div>
        </div>
        <div className={styles.roomMenu}>
          <div className={styles.tabList}>
            <button className={styles.tab} onClick={lobbyOn}>
              Lobby
            </button>
            <button className={styles.tab} onClick={lobbyOff}>
              Settings
            </button>
          </div>
          {lobby ? (
            <div className={styles.lobbyContainer}>
              <div className={styles.waitingForPlayers}> Waiting for Opponent...</div>
              <div className={styles.playerList}>
                {Object.entries(players)
                  .filter((entry) => entry[0] === roomId)
                  .map(displayName)}
                {Object.entries(players)
                  .filter((entry) => entry[0] !== roomId)
                  .map(displayName)}
              </div>
            </div>
          ) : (
            <form className={styles.settingsForm}>
              <div className={styles.settingsContainer}>
                <div className={styles.settingsTitle}>Scrambling Mode</div>
                <Checkbox
                  name='noShuffle'
                  label='Keyboard shuffle'
                  checked={!rightSettings().noShuffle}
                  onClick={(e) => {
                    e.preventDefault()
                    setSettings({ ...settings, noShuffle: !settings.noShuffle })
                  }}
                />
                {!rightSettings().noShuffle && (
                  <Checkbox
                    name='withinHand'
                    label='Shuffle within hands'
                    checked={rightSettings().withinHand}
                    onClick={(e) => {
                      e.preventDefault()
                      setSettings({ ...settings, withinHand: !settings.withinHand })
                    }}
                  />
                )}

                {!rightSettings().noShuffle && (
                  <Checkbox
                    name='withinRow'
                    label='Shuffle within row'
                    checked={rightSettings().withinRow}
                    onClick={(e) => {
                      e.preventDefault()
                      setSettings({ ...settings, withinRow: !settings.withinRow })
                    }}
                  />
                )}
                <hr />
                <div className={styles.settingsTitle}>
                  Time Setting: &nbsp;&nbsp;
                  <span id='time-setting'>{rightSettings().time}</span>
                </div>
                <div className={styles.sliderContainer}>
                  <Slider
                    styles={{
                      track: {
                        width: 370,
                      },
                    }}
                    axis='x'
                    xmin={1}
                    xmax={300}
                    x={rightSettings().time}
                    onChange={({ x }) => setSettings({ ...settings, time: x })}
                  />
                </div>
              </div>
            </form>
          )}
          <div className={styles.menuButtonContainer}>
            {user?.uid === roomId ? (
              lobby ? (
                <button className={styles.startButton} onClick={startGame}>
                  Start game
                </button>
              ) : (
                <button className={styles.startButton} onClick={saveSettings}>
                  {saved ? 'Saved' : 'Save changes'}
                </button>
              )
            ) : (
              <div className={styles.waitMessage}>Wait for the host to start the game!</div>
            )}
            <Link to='/lobby'>
              <button className={styles.leaveButton} onClick={leaveRoom}>
                Leave Room
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room
