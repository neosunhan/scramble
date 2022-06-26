import React from 'react'

import styles from './TextDisplay.module.css'

interface TextDisplayProps {
  quote: string
  input: string
}

const TextDisplay: React.FC<TextDisplayProps> = ({ quote, input }) => {
  return (
    <div className={styles.textDisplay}>
      {Array.from(quote).map((char, index) => {
        let className: string
        if (index < input.length) {
          if (char === input.charAt(index)) {
            className = styles.correct
          } else {
            className = styles.incorrect
          }
        } else {
          className = ''
        }
        return (
          <span key={index} className={className}>
            {char}
          </span>
        )
      })}
    </div>
  )
}

export default TextDisplay
