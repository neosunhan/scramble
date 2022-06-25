import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { remove, ref, onValue, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { useAuth } from 'hooks/useAuth'
import { getQuote } from 'api/quotes'

const Room: React.FC = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const [players, setPlayers] = useState({})
  const navigate = useNavigate()

  const leaveRoom = () => {
    if (user?.uid === roomId) {
      remove(ref(database, `rooms/${roomId}`))
    } else {
      remove(ref(database, `rooms/${roomId}/players/${user?.uid}`))
    }
  }

  const startGame = () => {
    // const quotes: { [index: number]: string } = {}
    // for (let i = 0; i < 5; i++) {
    //   getQuote().then((response) => {
    //     quotes[i] = response.data.content
    //   })
    // }
    // set(ref(database, `rooms/${roomId}/quotes`), quotes)
    set(ref(database, `rooms/${roomId}/started`), true)
  }

  useEffect(() => {
    const playersRef = ref(database, `/rooms/${roomId}/players`)

    onValue(playersRef, (snapshot) => {
      setPlayers(snapshot.val())
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

  return (
    <div>
      <div>
        <h1>Room: {roomId}</h1>
        <h3>Players: </h3>
        <div>
          {Object.entries(players).map((entry) => {
            const userId = entry[0]
            let userName = entry[1]
            if (userId === user?.uid) {
              userName += ' (You)'
            }
            if (userId === roomId) {
              userName += ' (Host)'
            }
            return <div key={userId}>{userName as string}</div>
          })}
        </div>
        <Link to='/lobby'>
          <button onClick={leaveRoom}>Leave Room</button>
        </Link>
        {user?.uid === roomId ? (
          <button onClick={startGame}>Start game</button>
        ) : (
          <div>Wait for the host to start the game!</div>
        )}
      </div>
    </div>
  )
}

export default Room
