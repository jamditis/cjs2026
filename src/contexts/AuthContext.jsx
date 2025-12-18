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
import { doc, setDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore'
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
    if (!user) return null

    try {
      const userRef = doc(db, 'users', user.uid)
      const snapshot = await getDoc(userRef)

      if (!snapshot.exists()) {
        const { email, displayName, photoURL } = user

        // Create new profile - Firebase Auth handles duplicate emails at auth level
        // Note: If user signs in with different providers, they get linked automatically
        // if "One account per email address" is enabled in Firebase Console
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
    } catch (error) {
      console.error('Error creating user profile:', error)
      // Return null but don't throw - let the user continue to dashboard
      // The dashboard will handle missing profile data gracefully
      return null
    }
  }

  // Get user profile from Firestore
  async function getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        const profile = { id: snapshot.id, ...snapshot.data() }
        setUserProfile(profile)
        return profile
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
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
    try {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      await createUserProfile(user)
      return user
    } catch (error) {
      // Handle specific Google auth errors with user-friendly messages
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site.')
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled.')
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Multiple popups - ignore this one
        return null
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection.')
      }
      console.error('Google login error:', error)
      throw error
    }
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
        try {
          await getUserProfile(user.uid)
        } catch (error) {
          console.error('Error loading user profile:', error)
          // Still set loading to false so the app can continue
        }
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
