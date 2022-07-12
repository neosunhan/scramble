import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

import { Button } from 'components'

import styles from './Navbar.module.css'
import { useAuth } from 'hooks/useAuth'

const Navbar: React.FC = () => {
  const { user, signInWithGoogle, signout } = useAuth()

  const DynamicLogo: React.FC = () => {
    return (
      <Link className={`${styles.title} ${styles.dynamic}`} to='/'>
        Scramble.
      </Link>
    )
  }

  const Logo: React.FC = () => {
    return <div className={styles.title}>Scramble.</div>
  }

  const SignOutButton: React.FC = () => {
    return <Button onClick={signout}>Sign Out</Button>
  }

  return (
    <div className={styles.headerBar}>
      <div className={styles.leftBar}>
        <Routes>
          <Route path='lobby/:roomId' element={<Logo />} />
          <Route path='play/:roomId' element={<Logo />} />
          <Route path='/*' element={<DynamicLogo />} />
        </Routes>
      </div>
      <div className={styles.rightBar}>
        {/* <Button>Create Account</Button> */}
        {user ? (
          <>
            <div className={styles.displayName}>{user.displayName}</div>
            <Routes>
              <Route path='lobby/:roomId' />
              <Route path='play/:roomId' />
              <Route path='/*' element={<SignOutButton />} />
            </Routes>
          </>
        ) : (
          <Button onClick={signInWithGoogle}>Sign In with Google</Button>
        )}
      </div>
    </div>
  )
}

export default Navbar
