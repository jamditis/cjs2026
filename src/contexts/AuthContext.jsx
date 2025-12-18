import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
  const [authError, setAuthError] = useState(null) // For redirect errors
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false) // True if user authenticated but has no/incomplete profile

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
        const finalDisplayName = displayName || additionalData.displayName || ''

        // If no display name available, flag for profile setup
        // Don't create incomplete profile - wait for user input
        if (!finalDisplayName) {
          console.log('No displayName available, flagging for profile setup')
          setNeedsProfileSetup(true)
          return null
        }

        // Create new profile with required fields
        await setDoc(userRef, {
          email,
          displayName: finalDisplayName,
          photoURL: photoURL || '',
          organization: additionalData.organization || '',
          jobTitle: additionalData.jobTitle || '', // User's job title (NOT system role)
          // Note: 'role' field is NOT set here - it's only for admin permissions
          registrationStatus: 'pending', // pending, registered, confirmed
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        setNeedsProfileSetup(false)
      } else {
        // Profile exists - check if it's complete (has required fields)
        const existingData = snapshot.data()
        if (!existingData.email || !existingData.displayName) {
          console.log('Existing profile incomplete, flagging for profile setup')
          setNeedsProfileSetup(true)
        } else {
          setNeedsProfileSetup(false)
        }
      }

      return getUserProfile(user.uid)
    } catch (error) {
      console.error('Error creating user profile:', error)
      // Don't swallow the error - set flag so user can retry
      setNeedsProfileSetup(true)
      throw error // Re-throw so calling code knows it failed
    }
  }

  // Complete profile setup for users who need to provide their name
  // Called when user submits the required profile info
  async function completeProfileSetup(displayName, email = null) {
    if (!currentUser) throw new Error('No authenticated user')
    if (!displayName || displayName.trim().length < 2) {
      throw new Error('Display name is required')
    }

    const userRef = doc(db, 'users', currentUser.uid)

    await setDoc(userRef, {
      email: email || currentUser.email,
      displayName: displayName.trim(),
      photoURL: currentUser.photoURL || '',
      organization: '',
      jobTitle: '',
      registrationStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true }) // merge: true so we don't overwrite if partial doc exists

    setNeedsProfileSetup(false)
    return getUserProfile(currentUser.uid)
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

    // Try to create Firestore profile - if no displayName, user will be prompted
    try {
      await createUserProfile(user)
    } catch (error) {
      console.log('Profile creation deferred - user will complete setup:', error.message)
      // Don't throw - user is authenticated, they'll complete profile setup in dashboard
    }

    // Clean up localStorage
    window.localStorage.removeItem('emailForSignIn')

    return user
  }

  // Check if URL is a sign-in link
  function isEmailLink(url) {
    return isSignInWithEmailLink(auth, url)
  }

  // Sign in with Google - uses redirect for maximum browser compatibility
  async function loginWithGoogle() {
    setAuthError(null)
    const provider = new GoogleAuthProvider()

    // Check if we're on mobile or a browser known to have popup issues
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    // Use redirect for mobile and Safari (more reliable), popup for desktop Chrome/Firefox/Edge
    if (isMobile || isSafari) {
      // Redirect-based auth - page will reload after auth
      localStorage.setItem('cjs2026_auth_pending', 'google')
      await signInWithRedirect(auth, provider)
      return null // Will complete after redirect
    }

    // Try popup first for desktop browsers
    try {
      const { user } = await signInWithPopup(auth, provider)
      try {
        await createUserProfile(user)
      } catch (profileError) {
        console.log('Profile creation deferred - user will complete setup:', profileError.message)
        // Don't throw - user is authenticated, they'll complete profile setup in dashboard
      }
      return user
    } catch (error) {
      // If popup fails for any reason, fall back to redirect
      if (error.code === 'auth/popup-blocked' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/internal-error') {
        console.log('Popup failed, falling back to redirect:', error.code)
        localStorage.setItem('cjs2026_auth_pending', 'google')
        await signInWithRedirect(auth, provider)
        return null // Will complete after redirect
      }

      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection.')
      }

      console.error('Google login error:', error)
      throw error
    }
  }

  // Clear any pending auth error
  function clearAuthError() {
    setAuthError(null)
  }

  // Sign out
  async function logout() {
    setUserProfile(null)
    return signOut(auth)
  }


  // Handle redirect result on page load (for browsers that used redirect auth)
  useEffect(() => {
    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user) {
          // Successfully signed in via redirect
          try {
            await createUserProfile(result.user)
          } catch (profileError) {
            console.log('Profile creation deferred - user will complete setup:', profileError.message)
            // Don't throw - user is authenticated, they'll complete profile setup in dashboard
          }
          localStorage.removeItem('cjs2026_auth_pending')
        }
      } catch (error) {
        console.error('Redirect auth error:', error)
        localStorage.removeItem('cjs2026_auth_pending')
        setAuthError('Failed to complete sign-in. Please try again.')
      }
    }

    // Only check for redirect result if we were expecting one
    if (localStorage.getItem('cjs2026_auth_pending')) {
      handleRedirectResult()
    }
  }, [])

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
    authError, // For redirect auth errors
    clearAuthError,
    needsProfileSetup, // True if user needs to complete profile (no displayName)
    completeProfileSetup, // Function to complete profile setup
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
