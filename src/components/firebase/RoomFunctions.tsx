import { GameOptions } from 'pages/play/Play'
/*
import { remove, ref, onValue, set } from 'firebase/database'
import { database } from 'config/firebaseConfig'
import { getQuote } from 'api/quotes'


const createRoom = (user) => {
    const userId: string = user?.uid as string
    const roomId: string = userId
    set(ref(database, `rooms/${roomId}`), {
      host: userId,
      players: {
        [userId]: user?.displayName,
      },
      started: false,
      gameOptions: gameOptions,
      quote: quote,
      keyMap: generateKeyboard(gameOptions),
    })
  }

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    set(ref(database, `rooms/${roomToJoin}/players/${user?.uid}`), user?.displayName)
    navigate(roomToJoin)
  }

  const leaveRoom = () => {
    if (user?.uid === roomId) {
      remove(ref(database, `rooms/${roomId}`))
    } else {
      remove(ref(database, `rooms/${roomId}/players/${user?.uid}`))
    }
}
*/

export const defaultGameOptions: GameOptions = {
  noShuffle: false,
  withinHand: true,
  withinRow: true,
  time: 150,
}
