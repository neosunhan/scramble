import React, { useState } from 'react'
import { useAuth } from 'hooks/useAuth'
import { database } from 'config/firebaseConfig'
import { ref, remove, set, onValue } from 'firebase/database'

const Lobby: React.FC = () => {
  const [roomToJoin, setRoomToJoin] = useState('')
  const [room, setRoom] = useState('')
  const { user } = useAuth()
  const [players, setPlayers] = useState({})

  const createRoom = () => {
    setRoom(user?.uid as string)
    const userId: string = user?.uid as string
    set(ref(database, `rooms/${userId}`), {
      host: userId,
      players: {
        [userId]: user?.displayName,
      },
      started: false,
    })
  }

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRoom(roomToJoin)
    set(ref(database, `rooms/${roomToJoin}/players/${user?.uid}`), user?.displayName)
  }

  const leaveRoom = () => {
    setRoom('')
    remove(ref(database, `rooms/${room}/players/${user?.uid}`))
  }

  onValue(ref(database, `rooms/${room}/players`), (snapshot) => {
    setPlayers(snapshot.val())
  })

  return (
    <div>
      {room ? (
        <div>
          <div>Room: {room}</div>
          <button onClick={leaveRoom}>Leave Room</button>
        </div>
      ) : (
        <div>Create a room or join another player&apos;s room!</div>
      )}
      {room ? (
        <div>
          {Object.entries(players).map((entry) => {
            const userId = entry[0]
            let userName = entry[1]
            if (userId === user?.uid) {
              userName += ' (You)'
            }
            return <div key={userId}>{userName as string}</div>
          })}
        </div>
      ) : (
        <>
          <button onClick={createRoom}>Create room</button>
          <form onSubmit={joinRoom}>
            <input type='text' value={roomToJoin} onChange={(e) => setRoomToJoin(e.target.value)} />
            <input type='submit' value='Join Room'></input>
          </form>
        </>
      )}
    </div>
  )
}

export default Lobby
