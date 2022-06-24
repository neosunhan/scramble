import React, { useState } from 'react'
import { useAuth } from 'hooks/useAuth'
import { database } from 'config/firebaseConfig'
import { ref, set } from 'firebase/database'
import { Link, useNavigate } from 'react-router-dom'

const Lobby: React.FC = () => {
  const [roomToJoin, setRoomToJoin] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const createRoom = () => {
    const userId: string = user?.uid as string
    const roomId: string = userId
    set(ref(database, `rooms/${roomId}`), {
      host: userId,
      players: {
        [userId]: user?.displayName,
      },
      started: false,
    })
  }

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    set(ref(database, `rooms/${roomToJoin}/players/${user?.uid}`), user?.displayName)
    navigate(roomToJoin)
  }

  return (
    <div>
      <div>Create a room or join another player&apos;s room!</div>
      <Link to={user?.uid as string}>
        <button onClick={createRoom}>Create room</button>
      </Link>
      <form onSubmit={joinRoom}>
        <input type='text' value={roomToJoin} onChange={(e) => setRoomToJoin(e.target.value)} />
        <input type='submit' value='Join Room'></input>
      </form>
    </div>
  )
}

export default Lobby
