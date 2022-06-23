import React from 'react'
import { Link } from 'react-router-dom'

import { Button } from 'components'

import styles from './Navbar.module.css'
import { useAuth } from 'hooks/useAuth'

const Navbar: React.FC = () => {
  const { user, signInWithGoogle, signout } = useAuth()

  return (
    <div className={styles.headerBar}>
      <div className={styles.leftBar}>
        <Link className={styles.title} to='/'>
          Scramble.
        </Link>
      </div>
      <div className={styles.rightBar}>
        <Button>Create Account</Button>
        {user ? (
          <Button onClick={signout}>Sign Out</Button>
        ) : (
          <Button onClick={signInWithGoogle}>Sign In with Google</Button>
        )}
      </div>
    </div>
  )
}

export default Navbar
