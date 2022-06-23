import { GameOptions } from 'pages/practice/Practice'

export interface keyboardMap {
  A: string
  B: string
  C: string
  D: string
  E: string
  F: string
  G: string
  H: string
  I: string
  J: string
  K: string
  L: string
  M: string
  N: string
  O: string
  P: string
  Q: string
  R: string
  S: string
  T: string
  U: string
  V: string
  W: string
  X: string
  Y: string
  Z: string
}

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

export const unshuffledMap: keyboardMap = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  H: 'H',
  I: 'I',
  J: 'J',
  K: 'K',
  L: 'L',
  M: 'M',
  N: 'N',
  O: 'O',
  P: 'P',
  Q: 'Q',
  R: 'R',
  S: 'S',
  T: 'T',
  U: 'U',
  V: 'V',
  W: 'W',
  X: 'X',
  Y: 'Y',
  Z: 'Z',
}

export const keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

export function generateKeyboard(options: GameOptions): keyboardMap {
  const { noShuffle, withinHand, withinRow } = options

  if (noShuffle) {
    return unshuffledMap
  }

  let divisions = []
  if (withinHand && withinRow) {
    divisions = ['QWERT', 'ASDFG', 'ZXCVB', 'YUIOP', 'HJKL', 'NM']
  } else if (withinHand) {
    divisions = ['QWERTASDFGZXCVB', 'YUIOPHJKLNM']
  } else if (withinRow) {
    divisions = keyboardRows
  } else {
    divisions = ['QWERTYUIOPASDFGHJKLZXCVBNM']
  }

  const original = divisions.map((x) => Array.from(x)).flat()
  const shuffled = divisions.map((x) => shuffle(Array.from(x))).flat()

  const shuffledMap: keyboardMap = {} as keyboardMap
  for (let i = 0; i < original.length; i++) {
    shuffledMap[original[i] as keyof keyboardMap] = shuffled[i]
  }
  return shuffledMap
}
