export const powerups: { [input: number]: { [input: string]: string } } = {
  0: {
    name: 'skip',
    text: 'Skip',
    description: 'Skip the next word!',
  },
  1: {
    name: 'unscramble',
    text: 'Unscramble your keyboard',
    description: 'Unscramble your own keyboard for 10 seconds!',
  },
  2: {
    name: 'hide',
    text: 'Hidden keyboard',
    description: "Hide opponent's keyboard for 10 seconds!",
  },
}
