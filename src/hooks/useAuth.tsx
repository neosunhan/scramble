import { initializeApp } from 'firebase/app'
import {
  confirmPasswordReset as confirmPasswordResetFirebase,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail as sendPasswordResetEmailFirebase,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  UserCredential,
} from 'firebase/auth'
import { firebaseConfig } from 'config/firebaseConfig'
import React, { useState, useEffect, useContext, createContext } from 'react'

const app = initializeApp(firebaseConfig)
const firebaseAuth = getAuth(app)
const googleAuthProvider = new GoogleAuthProvider()

interface AuthContextProps {
  user: User | null
  signInWithGoogle: () => Promise<UserCredential>
  signout: () => Promise<void>
}
const authContext = createContext({} as AuthContextProps)

interface ProvideAuthProps {
  children: React.ReactNode
}
// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export const ProvideAuth: React.FC<ProvideAuthProps> = ({ children }) => {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext)
}
// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null)
  // Wrap any Firebase methods we want to use making sure ...
  // ... to save the user to state.
  const signin = (email: string, password: string) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password).then(
      (response: UserCredential) => {
        setUser(response.user)
        return response.user
      },
    )
  }
  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(firebaseAuth, email, password).then(
      (response: UserCredential) => {
        setUser(response.user)
        return response.user
      },
    )
  }
  const signout = () => {
    return firebaseAuth.signOut().then(() => {
      setUser(null)
    })
  }
  const sendPasswordResetEmail = (email: string) => {
    return sendPasswordResetEmailFirebase(firebaseAuth, email).then(() => {
      return true
    })
  }
  const confirmPasswordReset = (code: string, password: string) => {
    return confirmPasswordResetFirebase(firebaseAuth, code, password).then(() => {
      return true
    })
  }
  const signInWithGoogle = () => {
    return signInWithPopup(firebaseAuth, googleAuthProvider)
  }
  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any ...
  // ... component that utilizes this hook to re-render with the ...
  // ... latest auth object.
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })
    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])
  // Return the user object and auth methods
  return {
    user,
    signin,
    signup,
    signout,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signInWithGoogle,
  }
}
