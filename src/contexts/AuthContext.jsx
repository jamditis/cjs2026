import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Create user profile in Firestore
  async function createUserProfile(user, additionalData = {}) {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user
      await setDoc(userRef, {
        email,
        displayName: displayName || additionalData.displayName || '',
        photoURL: photoURL || '',
        organization: additionalData.organization || '',
        role: additionalData.role || '',
        registrationStatus: 'pending', // pending, registered, confirmed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return getUserProfile(user.uid)
  }

  // Get user profile from Firestore
  async function getUserProfile(uid) {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      const profile = { id: snapshot.id, ...snapshot.data() }
      setUserProfile(profile)
      return profile
    }
    return null
  }

  // Update user profile
  async function updateUserProfile(uid, data) {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true })
    return getUserProfile(uid)
  }

  // Sign up with email/password
  async function signup(email, password, displayName, additionalData = {}) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    // Update display name in Firebase Auth
    if (displayName) {
      await updateProfile(user, { displayName })
    }

    // Create Firestore profile
    await createUserProfile(user, { displayName, ...additionalData })

    return user
  }

  // Sign in with email/password
  async function login(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    await getUserProfile(user.uid)
    return user
  }

  // Sign in with Google
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    await createUserProfile(user)
    return user
  }

  // Sign out
  async function logout() {
    setUserProfile(null)
    return signOut(auth)
  }

  // Reset password
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await getUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    getUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
