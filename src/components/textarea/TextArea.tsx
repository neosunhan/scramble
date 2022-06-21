import React from 'react'

interface TextAreaProps {
  input: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}
const TextArea: React.FC<TextAreaProps> = ({ input, onChange }) => {
  return (
    <textarea className='user-input' id='user-input' value={input} onChange={onChange}></textarea>
  )
}

export default TextArea
