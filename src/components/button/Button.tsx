import React from 'react'

import './Button.styles.css'

interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ ...props }) => {
  return (
    <button className={'custom-button ' + props.className ?? ''} onClick={props.onClick}>
      {props.children}
    </button>
  )
}

export default Button
