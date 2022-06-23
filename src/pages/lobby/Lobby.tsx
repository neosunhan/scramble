import React, { useState } from 'react'

import { useAuth } from 'hooks/useAuth'

const Lobby: React.FC = () => {
  const [roomToJoin, setRoomToJoin] = useState('')
  const [room, setRoom] = useState('')
  const { user } = useAuth()

  return (
    <div>
      {room ? (
        <div>
          <div>{room}&apos;s Room</div>
          <button onClick={() => setRoom('')}>Leave Room</button>
        </div>
      ) : (
        <div>Create a room or join another player&apos;s room!</div>
      )}
      {room ? (
        <div>
          <div>{user?.displayName} (You)</div>
        </div>
      ) : (
        <>
          <button onClick={() => setRoom(user?.displayName as string)}>Create room</button>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setRoom(roomToJoin)
            }}
          >
            <input type='text' value={roomToJoin} onChange={(e) => setRoomToJoin(e.target.value)} />
            <input type='submit' value='Join Room'></input>
          </form>
        </>
      )}
    </div>
  )
}

export default Lobby
