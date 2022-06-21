import React from 'react'
import { Link } from 'react-router-dom'

import { Button } from 'components'

import './Navbar.styles.css'

const Navbar: React.FC = () => {
  return (
    <div className='header-bar'>
      <div className='left-bar'>
        <Link className='title' to='/'>
          Scramble.
        </Link>
      </div>
      <div className='right-bar'>
        <Button>Create Account</Button>
        <Button>Sign In</Button>
      </div>
    </div>
  )
}

export default Navbar
