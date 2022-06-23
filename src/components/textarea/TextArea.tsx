import React from 'react'

import styles from './TextArea.module.css'
interface TextAreaProps {
  input: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}
const TextArea: React.FC<TextAreaProps> = ({ input, onChange }) => {
  return (
    <textarea
      className={styles.userInput}
      id='user-input'
      value={input}
      onChange={onChange}
      autoFocus
    ></textarea>
  )
}

export default TextArea
