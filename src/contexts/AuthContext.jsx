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
import { doc, setDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove, increment } from 'firebase/firestore'
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
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false) // True if user authenticated but has no/incomplete profile

  // ============================================
  // User Profile Schema
  // ============================================
  // All user documents should have ALL fields initialized for consistency.
  // This prevents "undefined" errors and makes queries predictable.

  function getEmptyProfileSchema() {
    return {
      // Core identity
      email: '',
      displayName: '',
      photoURL: '',

      // Professional info
      organization: '',
      jobTitle: '',

      // Social links
      website: '',
      instagram: '',
      linkedin: '',
      bluesky: '',

      // Registration & status
      registrationStatus: 'pending', // pending, registered, confirmed
      role: null, // null, 'admin', 'super_admin' (system permissions only)
      notifyWhenTicketsAvailable: false,

      // Eventbrite integration (set by webhook)
      eventbriteAttendeeId: null,
      eventbriteOrderId: null,

      // Schedule features
      savedSessions: [],
      scheduleVisibility: 'private', // private, attendees_only, public

      // Summit history & badges
      attendedSummits: [], // Array of years: [2017, 2018, ...]
      badges: [], // Array of badge IDs
      customBadges: {}, // { philosophy: [...], misc: [...] }

      // Timestamps
      createdAt: null,
      updatedAt: null,
    }
  }

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

        // ALWAYS create the document with full schema
        // If no displayName, flag for profile setup but still create the document
        const newProfile = {
          ...getEmptyProfileSchema(),
          email,
          displayName: finalDisplayName,
          photoURL: photoURL || '',
          organization: additionalData.organization || '',
          jobTitle: additionalData.jobTitle || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        await setDoc(userRef, newProfile)
        console.log('Created new user profile for:', email)

        // If no display name, flag for profile completion
        if (!finalDisplayName) {
          console.log('No displayName available, flagging for profile setup')
          setNeedsProfileSetup(true)
        } else {
          setNeedsProfileSetup(false)
        }
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

    // Create profile with ALL fields initialized
    const newProfile = {
      ...getEmptyProfileSchema(),
      email: email || currentUser.email,
      displayName: displayName.trim(),
      photoURL: currentUser.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(userRef, newProfile, { merge: true })

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

  // Ensure user document exists with full schema before updating
  // This prevents partial documents from being created
  async function ensureUserDocumentExists(uid, email = null) {
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      // Document doesn't exist - create it with full schema
      const newProfile = {
        ...getEmptyProfileSchema(),
        email: email || currentUser?.email || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(userRef, newProfile)
      console.log('Created new user document with full schema for uid:', uid)
      return true // Document was created
    }
    return false // Document already existed
  }

  // Update user profile - ensures document exists with full schema first
  async function updateUserProfile(uid, data) {
    const userRef = doc(db, 'users', uid)

    // First ensure the document exists with full schema
    await ensureUserDocumentExists(uid)

    // Now safe to merge - document definitely exists
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true })
    return getUserProfile(uid)
  }

  // Save a session to user's personal schedule
  async function saveSession(sessionId) {
    if (!currentUser) {
      console.error('saveSession: No current user')
      return false
    }

    try {
      console.log('saveSession: Saving session', sessionId, 'for user', currentUser.uid)

      // Ensure document exists with full schema first
      await ensureUserDocumentExists(currentUser.uid, currentUser.email)

      const userRef = doc(db, 'users', currentUser.uid)
      await setDoc(userRef, {
        savedSessions: arrayUnion(sessionId),
        updatedAt: serverTimestamp()
      }, { merge: true })
      console.log('saveSession: Updated user document')

      // Increment the bookmark count for this session
      const bookmarkRef = doc(db, 'sessionBookmarks', sessionId)
      await setDoc(bookmarkRef, {
        count: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true })
      console.log('saveSession: Incremented bookmark count for', sessionId)

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        savedSessions: [...(prev?.savedSessions || []), sessionId]
      }))
      return true
    } catch (error) {
      console.error('saveSession: Error saving session', sessionId, error)
      throw error
    }
  }

  // Remove a session from user's personal schedule
  async function unsaveSession(sessionId) {
    if (!currentUser) {
      console.error('unsaveSession: No current user')
      return false
    }

    try {
      console.log('unsaveSession: Removing session', sessionId, 'for user', currentUser.uid)

      // Ensure document exists with full schema first
      await ensureUserDocumentExists(currentUser.uid, currentUser.email)

      const userRef = doc(db, 'users', currentUser.uid)
      await setDoc(userRef, {
        savedSessions: arrayRemove(sessionId),
        updatedAt: serverTimestamp()
      }, { merge: true })
      console.log('unsaveSession: Updated user document')

      // Decrement the bookmark count for this session
      const bookmarkRef = doc(db, 'sessionBookmarks', sessionId)
      await setDoc(bookmarkRef, {
        count: increment(-1),
        updatedAt: serverTimestamp()
      }, { merge: true })
      console.log('unsaveSession: Decremented bookmark count for', sessionId)

      // Update local state
      setUserProfile(prev => ({
        ...prev,
        savedSessions: (prev?.savedSessions || []).filter(id => id !== sessionId)
      }))
      return true
    } catch (error) {
      console.error('unsaveSession: Error removing session', sessionId, error)
      throw error
    }
  }

  // Check if a session is saved
  function isSessionSaved(sessionId) {
    return userProfile?.savedSessions?.includes(sessionId) || false
  }

  // Update schedule visibility setting
  async function updateScheduleVisibility(visibility) {
    if (!currentUser) return false

    // Ensure document exists with full schema first
    await ensureUserDocumentExists(currentUser.uid, currentUser.email)

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

  // Sign in with Google - always tries popup first, suggests email if blocked
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()

    // Always try popup first - it's more reliable across browsers
    // Redirect flow has storage partitioning issues on many mobile browsers
    try {
      console.log('[Auth] Attempting popup auth...')
      const { user } = await signInWithPopup(auth, provider)
      console.log('[Auth] Popup auth successful:', user.email)
      try {
        await createUserProfile(user)
      } catch (profileError) {
        console.log('[Auth] Profile creation deferred:', profileError.message)
      }
      return user
    } catch (error) {
      console.log('[Auth] Popup failed:', error.code, error.message)

      // User closed the popup - let them try again
      if (error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request') {
        return null // Silent fail - user can click again
      }

      // Popup was blocked - suggest email sign-in
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked. Please use the email sign-in option below, or allow pop-ups for this site.')
      }

      // Network error
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.')
      }

      // For other errors, suggest email as fallback
      console.error('[Auth] Google login error:', error)
      throw new Error('Google sign-in failed. Please try the email sign-in option instead.')
    }
  }

  // Sign out
  async function logout() {
    setUserProfile(null)
    return signOut(auth)
  }


  // Clean up any stale redirect pending flags from previous auth attempts
  useEffect(() => {
    localStorage.removeItem('cjs2026_auth_pending')
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth] onAuthStateChanged:', user ? `uid=${user.uid}` : 'no user')
      setCurrentUser(user)
      if (user) {
        try {
          await getUserProfile(user.uid)
          console.log('[Auth] Profile loaded, setting loading=false')
        } catch (error) {
          console.error('[Auth] Error loading user profile:', error)
          // Still set loading to false so the app can continue
        }
      } else {
        setUserProfile(null)
        console.log('[Auth] No user, setting loading=false')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
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
