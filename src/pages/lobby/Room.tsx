import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { remove, ref, onValue } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { useAuth } from 'hooks/useAuth'

const Room: React.FC = () => {
  const { roomId } = useParams()
  const { user } = useAuth()
  const [players, setPlayers] = useState({})

  const leaveRoom = () => {
    if (user?.uid === roomId) {
      remove(ref(database, `rooms/${roomId}`))
    } else {
      remove(ref(database, `rooms/${roomId}/players/${user?.uid}`))
    }
  }

  useEffect(() => {
    const playersRef = ref(database, `/rooms/${roomId}/players`)

    onValue(playersRef, (snapshot) => {
      setPlayers(snapshot.val())
    })
  }, [roomId])

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
      </div>
    </div>
  )
}

export default Room
