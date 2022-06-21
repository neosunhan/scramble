import React from 'react'

interface TextDisplayProps {
  quote: string
  input: string
}

const TextDisplay: React.FC<TextDisplayProps> = ({ quote, input }) => {
  return (
    <div className='text-display' id='text-display'>
      {Array.from(quote).map((char, index) => {
        let className: string
        if (index < input.length) {
          if (char === input.charAt(index)) {
            className = 'correct'
          } else {
            className = 'incorrect'
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
