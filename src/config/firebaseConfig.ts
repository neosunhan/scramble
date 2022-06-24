import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

export const firebaseConfig = {
  apiKey: 'AIzaSyDM3Z4pMrvZkQh6ue6RGdXhG0LZqUq9n-U',
  authDomain: 'scramble-18f08.firebaseapp.com',
  databaseURL: 'https://scramble-18f08-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'scramble-18f08',
  storageBucket: 'scramble-18f08.appspot.com',
  messagingSenderId: '332173910294',
  appId: '1:332173910294:web:070e9362c1834b5f8ab037',
  measurementId: 'G-4YHFVX8HCN',
}
const app = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app)
export const database = getDatabase()
