import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Email link settings
const actionCodeSettings = {
  url: window.location.origin + '/auth/callback',
  handleCodeInApp: true,
}

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Create user profile in Firestore
  // IMPORTANT: 'role' is reserved for system permissions (admin, super_admin)
  // Use 'jobTitle' for user's job/position at their organization
  async function createUserProfile(user, additionalData = {}) {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user

      // Check for existing user with same email (prevents duplicates from different auth providers)
      const existingUserQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      )
      const existingUsers = await getDocs(existingUserQuery)

      if (!existingUsers.empty) {
        // User with this email already exists - log warning and use existing profile
        console.warn(`User with email ${email} already exists with different UID. Using existing profile.`)
        const existingDoc = existingUsers.docs[0]
        // Update the existing document to also track this UID
        await setDoc(doc(db, 'users', existingDoc.id), {
          linkedUIDs: arrayUnion(user.uid),
          updatedAt: serverTimestamp()
        }, { merge: true })
        // Return the existing profile
        const profile = { id: existingDoc.id, ...existingDoc.data() }
        setUserProfile(profile)
        return profile
      }

      // No existing user - create new profile
      await setDoc(userRef, {
        email,
        displayName: displayName || additionalData.displayName || '',
        photoURL: photoURL || '',
        organization: additionalData.organization || '',
        jobTitle: additionalData.jobTitle || '', // User's job title (NOT system role)
        // Note: 'role' field is NOT set here - it's only for admin permissions
        registrationStatus: 'pending', // pending, registered, confirmed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    return getUserProfile(user.uid)
  }

  // Get user profile from Firestore
  // Also checks by email if UID lookup fails (handles different auth providers)
  async function getUserProfile(uid) {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      const profile = { id: snapshot.id, ...snapshot.data() }
      setUserProfile(profile)
      return profile
    }

    // If not found by UID, try to find by linkedUIDs (in case of multiple auth providers)
    const linkedQuery = query(
      collection(db, 'users'),
      where('linkedUIDs', 'array-contains', uid)
    )
    const linkedResults = await getDocs(linkedQuery)
    if (!linkedResults.empty) {
      const profile = { id: linkedResults.docs[0].id, ...linkedResults.docs[0].data() }
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

  // Save a session to user's personal schedule
  async function saveSession(sessionId) {
    if (!currentUser) return false
    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(userRef, {
      savedSessions: arrayUnion(sessionId),
      updatedAt: serverTimestamp()
    }, { merge: true })
    // Update local state
    setUserProfile(prev => ({
      ...prev,
      savedSessions: [...(prev?.savedSessions || []), sessionId]
    }))
    return true
  }

  // Remove a session from user's personal schedule
  async function unsaveSession(sessionId) {
    if (!currentUser) return false
    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(userRef, {
      savedSessions: arrayRemove(sessionId),
      updatedAt: serverTimestamp()
    }, { merge: true })
    // Update local state
    setUserProfile(prev => ({
      ...prev,
      savedSessions: (prev?.savedSessions || []).filter(id => id !== sessionId)
    }))
    return true
  }

  // Check if a session is saved
  function isSessionSaved(sessionId) {
    return userProfile?.savedSessions?.includes(sessionId) || false
  }

  // Update schedule visibility setting
  async function updateScheduleVisibility(visibility) {
    if (!currentUser) return false
    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(userRef, {
      scheduleVisibility: visibility,
      updatedAt: serverTimestamp()
    }, { merge: true })
    // Update local state
    setUserProfile(prev => ({
      ...prev,
      scheduleVisibility: visibility
    }))
    return true
  }

  // Send magic link to email
  async function sendMagicLink(email) {
    // Store email for use after callback
    window.localStorage.setItem('emailForSignIn', email)
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
  }

  // Complete sign-in after clicking magic link
  async function completeSignInWithEmailLink(url) {
    if (!isSignInWithEmailLink(auth, url)) {
      throw new Error('Invalid sign-in link')
    }

    // Get email from localStorage
    let email = window.localStorage.getItem('emailForSignIn')
    if (!email) {
      // If email is missing, prompt user (edge case: different device/browser)
      email = window.prompt('Please provide your email for confirmation')
    }

    const { user } = await signInWithEmailLink(auth, email, url)

    // Create Firestore profile if new user (with empty fields to fill later)
    await createUserProfile(user)

    // Clean up localStorage
    window.localStorage.removeItem('emailForSignIn')

    return user
  }

  // Check if URL is a sign-in link
  function isEmailLink(url) {
    return isSignInWithEmailLink(auth, url)
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
    sendMagicLink,
    completeSignInWithEmailLink,
    isEmailLink,
    loginWithGoogle,
    logout,
    updateUserProfile,
    getUserProfile,
    // Schedule builder helpers
    saveSession,
    unsaveSession,
    isSessionSaved,
    updateScheduleVisibility,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
