import React from 'react'

import styles from './Checkbox.module.css'

interface CheckboxProps {
  name: string
  label: string
  checked: boolean
  onClick: React.MouseEventHandler<HTMLLabelElement>
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onClick }) => {
  return (
    <label onClick={onClick} className={styles.checkbox}>
      <input
        className={styles.checkboxInput + ' ' + (checked ? styles.checkboxInputChecked : '')}
        type='checkbox'
      />
      <div className={styles.checkboxBox}></div>
      {label}
    </label>
  )
}

export default Checkbox
