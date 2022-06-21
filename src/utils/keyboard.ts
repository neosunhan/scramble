import { GameOptions } from 'pages/practice/Practice'

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

export const keyboardPositions = Array.from('QWERTYUIOPASDFGHJKLZXCVBNM')

// given a keyboard arranged with left-hand keys before right-hand keys, rearrange the array to list keys sequentially
function rearrangeKeyboard(keys: string[]): string[] {
  const result: string[] = []
  const n = keys.length

  for (let i = 0; i < n; i++) {
    if (i >= 0 && i < 5) {
      result[i] = keys[i]
    } else if (i >= 5 && i < 10) {
      result[i] = keys[10 + i]
    } else if (i >= 10 && i < 15) {
      result[i] = keys[i - 5]
    } else if (i >= 15 && i < 19) {
      result[i] = keys[5 + i]
    } else if (i >= 19 && i < 24) {
      result[i] = keys[i - 9]
    } else {
      result[i] = keys[i]
    }
  }

  return result
}
export function generateKeyboard(options: GameOptions): string[] {
  const { withinHand, withinRow } = options
  let divisions = []
  if (withinHand && withinRow) {
    divisions = ['QWERT', 'ASDFG', 'ZXCVB', 'YUIOP', 'HJKL', 'NM']
  } else if (withinHand) {
    divisions = ['QWERTASDFGZXCVB', 'YUIOPHJKLNM']
  } else if (withinRow) {
    divisions = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
  } else {
    divisions = ['QWERTYUIOPASDFGHJKLZXCVBNM']
  }

  const shuffled = divisions.map((x) => shuffle(Array.from(x))).flat()

  return withinHand ? rearrangeKeyboard(shuffled) : shuffled
}
