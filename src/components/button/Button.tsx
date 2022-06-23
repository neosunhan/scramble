import React from 'react'

import styles from './Button.module.css'

interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ ...props }) => {
  return (
    <button className={styles.customButton + ' ' + (props.className ?? '')} onClick={props.onClick}>
      {props.children}
    </button>
  )
}

export default Button
