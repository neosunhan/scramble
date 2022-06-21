import React from 'react'

import { Link } from 'react-router-dom'
import { Button } from 'components'

import './Home.styles.css'

const Home: React.FC = () => {
  return (
    <div className='main-menu'>
      <div className='main-menu-container'>
        {/* <div className="welcome-text">Welcome to Scramble</div> */}
        <div className='enter-game'>
          <div>Create a room or join an existing room to be matched with an opponent!</div>
          <button className='main-menu-button'>Enter Game</button>
        </div>
        <div className='practice-yourself'>
          <div>Learn the basics here!</div>
          <Link to='practice'>
            <Button className='main-menu-button'>Practice Yourself</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
