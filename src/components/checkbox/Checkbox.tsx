import React from 'react'

import './Checkbox.styles.css'

interface CheckboxProps {
  name: string
  label: string
  checked: boolean
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const Checkbox: React.FC<CheckboxProps> = ({ name, label, checked, onClick }) => {
  return (
    <div onClick={onClick}>
      <input
        className={checked ? 'checkbox-input-checked' : 'checkbox-input'}
        type='checkbox'
        name={name}
        checked={checked}
      />
      <div className='checkbox-box'></div>
      <label className='checkbox'>{label}</label>
    </div>
  )
}

export default Checkbox
