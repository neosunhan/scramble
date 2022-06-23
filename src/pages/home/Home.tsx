import React from 'react'

import { Link } from 'react-router-dom'
import { Button } from 'components'

import styles from './Home.module.css'
import { useAuth } from 'hooks/useAuth'

const Home: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className={styles.mainMenu}>
      <div className={styles.mainMenuContainer}>
        {/* <div className="welcome-text">Welcome to Scramble</div> */}
        {user ? (
          <div className={styles.enterGame}>
            <div>Create a room or join an existing room to be matched with an opponent!</div>
            <button className={styles.mainMenuButton}>Enter Game</button>
          </div>
        ) : (
          <div className={styles.enterGame}>
            <div>Sign in to play against other players!</div>
          </div>
        )}
        <div className={styles.practiceYourself}>
          <div>Learn the basics here!</div>
          <Link to='practice'>
            <Button className={styles.mainMenuButton}>Practice Yourself</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
