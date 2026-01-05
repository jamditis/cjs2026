/**
 * @fileoverview Authentication Context for CJS2026
 *
 * Provides centralized authentication and user profile management for the
 * Collaborative Journalism Summit 2026 website. Handles:
 * - Firebase Authentication (Google OAuth + Magic Link)
 * - Firestore user profile CRUD operations
 * - Personal schedule management (session bookmarking)
 * - Permission checks for gated features
 *
 * @module contexts/AuthContext
 * @requires firebase/auth
 * @requires firebase/firestore
 *
 * @example Basic usage
 * ```jsx
 * import { useAuth } from '../contexts/AuthContext'
 *
 * function MyComponent() {
 *   const { currentUser, userProfile, loginWithGoogle, logout } = useAuth()
 *
 *   if (!currentUser) {
 *     return <button onClick={loginWithGoogle}>Sign In</button>
 *   }
 *
 *   return <div>Welcome, {userProfile?.displayName}</div>
 * }
 * ```
 */

/**
 * @typedef {Object} UserProfile
 * User profile stored in Firestore `users/{uid}` collection.
 *
 * @property {string} id - Firestore document ID (same as Firebase UID)
 * @property {string} email - User's email address
 * @property {string} displayName - User's display name
 * @property {string} photoURL - URL to profile photo (Firebase Storage)
 * @property {string} organization - User's organization/company
 * @property {string} jobTitle - User's job title/position
 * @property {string} website - User's website URL
 * @property {string} instagram - Instagram username (without @)
 * @property {string} linkedin - LinkedIn username
 * @property {string} bluesky - Bluesky handle
 * @property {'pending'|'registered'|'confirmed'|'approved'} registrationStatus - Registration state
 * @property {null|'admin'|'super_admin'} role - System permission level
 * @property {boolean} notifyWhenTicketsAvailable - Email notification preference
 * @property {string|null} eventbriteAttendeeId - Eventbrite attendee ID (set by webhook)
 * @property {string|null} eventbriteOrderId - Eventbrite order ID (set by webhook)
 * @property {string[]} savedSessions - Array of saved session IDs
 * @property {'private'|'attendees_only'|'public'} scheduleVisibility - Schedule sharing visibility
 * @property {number[]} attendedSummits - Array of years attended (e.g., [2022, 2023])
 * @property {string[]} badges - Array of badge IDs
 * @property {Object} customBadges - Custom badges by category
 * @property {string[]} [customBadges.philosophy] - Custom philosophy badges
 * @property {string[]} [customBadges.misc] - Custom miscellaneous badges
 * @property {import('firebase/firestore').Timestamp} createdAt - Creation timestamp
 * @property {import('firebase/firestore').Timestamp} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} AuthContextValue
 * Value provided by AuthContext to consuming components.
 *
 * @property {import('firebase/auth').User|null} currentUser - Firebase Auth user object
 * @property {UserProfile|null} userProfile - Firestore user profile
 * @property {boolean} loading - True while auth state is being determined
 * @property {boolean} needsProfileSetup - True if user needs to complete profile
 * @property {Function} completeProfileSetup - Complete profile setup
 * @property {Function} sendMagicLink - Send passwordless magic link email
 * @property {Function} completeSignInWithEmailLink - Complete magic link sign-in
 * @property {Function} isEmailLink - Check if URL is a sign-in link
 * @property {Function} loginWithGoogle - Sign in with Google OAuth
 * @property {Function} logout - Sign out
 * @property {Function} updateUserProfile - Update user profile
 * @property {Function} getUserProfile - Get user profile by UID
 * @property {Function} saveSession - Save session to personal schedule
 * @property {Function} unsaveSession - Remove session from personal schedule
 * @property {Function} isSessionSaved - Check if session is saved
 * @property {Function} updateScheduleVisibility - Update schedule sharing visibility
 * @property {Function} canBookmarkSessions - Check if user can bookmark sessions
 */

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

/**
 * Configuration for Firebase magic link authentication.
 * @constant {Object}
 * @property {string} url - Callback URL for magic link verification
 * @property {boolean} handleCodeInApp - Whether to handle the code in the app
 */
const actionCodeSettings = {
  url: window.location.origin + '/auth/callback',
  handleCodeInApp: true,
}

/** @type {React.Context} */
const AuthContext = createContext()

/**
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider component.
 *
 * @returns {AuthContextValue} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```jsx
 * function Dashboard() {
 *   const { currentUser, userProfile, loading } = useAuth()
 *
 *   if (loading) return <LoadingSpinner />
 *   if (!currentUser) return <Redirect to="/login" />
 *
 *   return <div>Welcome, {userProfile?.displayName}</div>
 * }
 * ```
 */
export function useAuth() {
  return useContext(AuthContext)
}

/**
 * Authentication Provider component that wraps the application.
 * Provides authentication state and methods to all child components.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 *
 * @example
 * ```jsx
 * // In main.jsx or App.jsx
 * import { AuthProvider } from './contexts/AuthContext'
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </AuthProvider>
 *   )
 * }
 * ```
 */
export function AuthProvider({ children }) {
  /** @type {[import('firebase/auth').User|null, Function]} Firebase Auth user object */
  const [currentUser, setCurrentUser] = useState(null)

  /** @type {[UserProfile|null, Function]} Firestore user profile data */
  const [userProfile, setUserProfile] = useState(null)

  /** @type {[boolean, Function]} True while auth state is being determined */
  const [loading, setLoading] = useState(true)

  /** @type {[boolean, Function]} True if user authenticated but has no/incomplete profile */
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)

  /** @type {[boolean, Function]} True if user has skipped profile setup this session */
  const [profileSetupSkipped, setProfileSetupSkipped] = useState(() => {
    // Check if user previously skipped profile setup this session
    return sessionStorage.getItem('cjs2026_profile_setup_skipped') === 'true'
  })

  // ============================================
  // User Profile Schema
  // ============================================

  /**
   * Returns the complete user profile schema with default values.
   * All user documents should have ALL fields initialized for consistency.
   * This prevents "undefined" errors and makes Firestore queries predictable.
   *
   * @private
   * @returns {UserProfile} Empty profile object with all fields initialized
   *
   * @example
   * ```js
   * const emptyProfile = getEmptyProfileSchema()
   * // Returns:
   * // {
   * //   email: '',
   * //   displayName: '',
   * //   photoURL: '',
   * //   organization: '',
   * //   jobTitle: '',
   * //   website: '',
   * //   instagram: '',
   * //   linkedin: '',
   * //   bluesky: '',
   * //   registrationStatus: 'pending',
   * //   role: null,
   * //   notifyWhenTicketsAvailable: false,
   * //   eventbriteAttendeeId: null,
   * //   eventbriteOrderId: null,
   * //   savedSessions: [],
   * //   scheduleVisibility: 'private',
   * //   attendedSummits: [],
   * //   badges: [],
   * //   customBadges: {},
   * //   createdAt: null,
   * //   updatedAt: null,
   * // }
   * ```
   */
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

  /**
   * Creates a new user profile document in Firestore.
   *
   * This function is called after successful authentication (Google OAuth or magic link).
   * It creates a Firestore document with the full schema, ensuring consistency across
   * all user documents. If a profile already exists, it checks for completeness.
   *
   * **Important:** The `role` field is reserved for system permissions (`admin`, `super_admin`).
   * Use `jobTitle` for the user's professional position at their organization.
   *
   * @async
   * @param {import('firebase/auth').User} user - Firebase Auth user object
   * @param {Object} [additionalData={}] - Additional profile data to set
   * @param {string} [additionalData.displayName] - User's display name
   * @param {string} [additionalData.organization] - User's organization
   * @param {string} [additionalData.jobTitle] - User's job title
   * @returns {Promise<UserProfile|null>} Created/existing user profile, or null on error
   * @throws {Error} Re-throws Firestore errors after logging
   *
   * @example
   * ```js
   * // After Google OAuth sign-in
   * const { user } = await signInWithPopup(auth, provider)
   * const profile = await createUserProfile(user, {
   *   organization: 'NPR',
   *   jobTitle: 'Data Journalist'
   * })
   * ```
   *
   * @see {@link completeProfileSetup} For completing profiles missing displayName
   */
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

  /**
   * Completes profile setup for users who authenticated but lack required fields.
   *
   * Called from the Dashboard when `needsProfileSetup` is true. This typically
   * happens when a Google Workspace account doesn't have a display name set,
   * or when a magic link user signs in for the first time.
   *
   * @async
   * @param {string} displayName - User's display name (minimum 2 characters)
   * @param {string} [email=null] - Email to use (defaults to currentUser.email)
   * @returns {Promise<UserProfile>} Updated user profile
   * @throws {Error} If no authenticated user or displayName is invalid
   *
   * @example
   * ```jsx
   * // In profile wizard/setup modal
   * const { completeProfileSetup, needsProfileSetup } = useAuth()
   *
   * if (needsProfileSetup) {
   *   return (
   *     <ProfileSetupModal
   *       onSubmit={async (name) => {
   *         await completeProfileSetup(name)
   *         // Profile is now complete, needsProfileSetup becomes false
   *       }}
   *     />
   *   )
   * }
   * ```
   */
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
    setProfileSetupSkipped(false)
    sessionStorage.removeItem('cjs2026_profile_setup_skipped')
    return getUserProfile(currentUser.uid)
  }

  /**
   * Skip profile setup for this session (user can still complete later).
   * Sets a flag in sessionStorage so the modal won't show again until next session.
   */
  function skipProfileSetup() {
    setProfileSetupSkipped(true)
    sessionStorage.setItem('cjs2026_profile_setup_skipped', 'true')
  }

  /**
   * Check if profile setup modal should be shown.
   * Shows if: needs setup AND hasn't been skipped this session.
   */
  const showProfileSetupModal = needsProfileSetup && !profileSetupSkipped

  /**
   * Fetches a user profile from Firestore by UID.
   *
   * Also updates the local `userProfile` state if the profile exists.
   * Safe to call multiple times - will return null if profile doesn't exist.
   *
   * @async
   * @param {string} uid - Firebase user UID
   * @returns {Promise<UserProfile|null>} User profile object or null if not found
   *
   * @example
   * ```js
   * const { getUserProfile } = useAuth()
   *
   * // Fetch another user's profile (for shared schedules)
   * const otherProfile = await getUserProfile('abc123uid')
   * if (otherProfile) {
   *   console.log(otherProfile.displayName)
   * }
   * ```
   */
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

  /**
   * Ensures a user document exists with the full schema before any merge operation.
   *
   * This is a safety mechanism to prevent partial documents from being created
   * when using `setDoc` with `{ merge: true }`. If the document doesn't exist,
   * it creates one with all fields initialized to their default values.
   *
   * @async
   * @private
   * @param {string} uid - Firebase user UID
   * @param {string} [email=null] - User's email (falls back to currentUser.email)
   * @returns {Promise<boolean>} True if document was created, false if it already existed
   *
   * @example
   * ```js
   * // Always call before merge operations
   * await ensureUserDocumentExists(uid, email)
   * await setDoc(userRef, { fieldToUpdate: value }, { merge: true })
   * ```
   */
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

  /**
   * Updates a user profile in Firestore with partial data.
   *
   * Safely handles updates by first ensuring the document exists with the full
   * schema, then merging the provided data. Automatically updates the
   * `updatedAt` timestamp.
   *
   * @async
   * @param {string} uid - Firebase user UID
   * @param {Partial<UserProfile>} data - Fields to update
   * @returns {Promise<UserProfile>} Updated user profile
   *
   * @example
   * ```js
   * const { updateUserProfile, currentUser } = useAuth()
   *
   * // Update organization and job title
   * await updateUserProfile(currentUser.uid, {
   *   organization: 'The Washington Post',
   *   jobTitle: 'Senior Editor'
   * })
   *
   * // Add attended summits
   * await updateUserProfile(currentUser.uid, {
   *   attendedSummits: [2022, 2023, 2024]
   * })
   * ```
   */
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

  /**
   * Saves a session to the user's personal schedule.
   *
   * Adds the session ID to the user's `savedSessions` array and increments
   * the global bookmark count for the session in `sessionBookmarks` collection.
   * Also updates local state for immediate UI feedback.
   *
   * @async
   * @param {string} sessionId - The session ID to save (e.g., "mon-session-1")
   * @returns {Promise<boolean>} True on success, false if no current user
   * @throws {Error} On Firestore write failure
   *
   * @example
   * ```jsx
   * const { saveSession, isSessionSaved } = useAuth()
   *
   * function SessionCard({ session }) {
   *   const saved = isSessionSaved(session.session_id)
   *
   *   return (
   *     <button
   *       onClick={() => saveSession(session.session_id)}
   *       disabled={saved}
   *     >
   *       {saved ? 'Saved' : 'Save to My Schedule'}
   *     </button>
   *   )
   * }
   * ```
   *
   * @see {@link unsaveSession} To remove a session
   * @see {@link isSessionSaved} To check if a session is saved
   */
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

  /**
   * Removes a session from the user's personal schedule.
   *
   * Removes the session ID from the user's `savedSessions` array and decrements
   * the global bookmark count for the session. Also updates local state for
   * immediate UI feedback.
   *
   * @async
   * @param {string} sessionId - The session ID to remove
   * @returns {Promise<boolean>} True on success, false if no current user
   * @throws {Error} On Firestore write failure
   *
   * @example
   * ```jsx
   * const { unsaveSession, isSessionSaved } = useAuth()
   *
   * function SavedSessionItem({ session }) {
   *   return (
   *     <div>
   *       <span>{session.title}</span>
   *       <button onClick={() => unsaveSession(session.session_id)}>
   *         Remove
   *       </button>
   *     </div>
   *   )
   * }
   * ```
   *
   * @see {@link saveSession} To add a session
   * @see {@link isSessionSaved} To check if a session is saved
   */
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

  /**
   * Checks if a session is saved in the user's personal schedule.
   *
   * Performs a synchronous check against the local `userProfile` state.
   * No Firestore calls are made.
   *
   * @param {string} sessionId - The session ID to check
   * @returns {boolean} True if session is saved, false otherwise
   *
   * @example
   * ```jsx
   * const { isSessionSaved } = useAuth()
   *
   * // In a session list
   * sessions.map(session => (
   *   <SessionCard
   *     key={session.session_id}
   *     session={session}
   *     isSaved={isSessionSaved(session.session_id)}
   *   />
   * ))
   * ```
   */
  function isSessionSaved(sessionId) {
    return userProfile?.savedSessions?.includes(sessionId) || false
  }

  /**
   * Updates the visibility setting for the user's personal schedule.
   *
   * Controls who can view the user's saved sessions via shared schedule links.
   *
   * @async
   * @param {'private'|'attendees_only'|'public'} visibility - Visibility level
   *   - `'private'` - Only the user can see their schedule
   *   - `'attendees_only'` - Only registered attendees can view
   *   - `'public'` - Anyone with the link can view
   * @returns {Promise<boolean>} True on success, false if no current user
   *
   * @example
   * ```jsx
   * const { updateScheduleVisibility, userProfile } = useAuth()
   *
   * function VisibilitySelector() {
   *   return (
   *     <select
   *       value={userProfile?.scheduleVisibility || 'private'}
   *       onChange={(e) => updateScheduleVisibility(e.target.value)}
   *     >
   *       <option value="private">Private</option>
   *       <option value="attendees_only">Attendees Only</option>
   *       <option value="public">Public</option>
   *     </select>
   *   )
   * }
   * ```
   */
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

  /**
   * Sends a passwordless magic link to the specified email address.
   *
   * The user will receive an email with a sign-in link. When clicked,
   * the link redirects to `/auth/callback` where `completeSignInWithEmailLink`
   * should be called to complete authentication.
   *
   * The email is stored in localStorage for retrieval during callback
   * (in case user opens link in a different browser tab).
   *
   * @async
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   * @throws {Error} On Firebase Auth errors (invalid email, rate limiting, etc.)
   *
   * @example
   * ```jsx
   * const { sendMagicLink } = useAuth()
   * const [email, setEmail] = useState('')
   * const [sent, setSent] = useState(false)
   *
   * async function handleSubmit(e) {
   *   e.preventDefault()
   *   try {
   *     await sendMagicLink(email)
   *     setSent(true)
   *   } catch (err) {
   *     console.error('Failed to send magic link:', err)
   *   }
   * }
   * ```
   *
   * @see {@link completeSignInWithEmailLink} To complete sign-in after clicking link
   */
  async function sendMagicLink(email) {
    // Store email for use after callback
    window.localStorage.setItem('emailForSignIn', email)
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
  }

  /**
   * Completes sign-in after user clicks a magic link.
   *
   * Should be called from the `/auth/callback` route. Verifies the link,
   * retrieves the stored email, and signs the user in. Also creates
   * a Firestore profile if one doesn't exist.
   *
   * If the email isn't in localStorage (user opened link on different device),
   * prompts the user to enter their email manually.
   *
   * @async
   * @param {string} url - The full callback URL containing the sign-in link
   * @returns {Promise<import('firebase/auth').User>} The signed-in user
   * @throws {Error} If the link is invalid or expired
   *
   * @example
   * ```jsx
   * // In /auth/callback route component
   * const { completeSignInWithEmailLink, isEmailLink } = useAuth()
   * const navigate = useNavigate()
   *
   * useEffect(() => {
   *   const url = window.location.href
   *   if (isEmailLink(url)) {
   *     completeSignInWithEmailLink(url)
   *       .then(() => navigate('/dashboard'))
   *       .catch(err => console.error('Sign-in failed:', err))
   *   }
   * }, [])
   * ```
   *
   * @see {@link sendMagicLink} To send the magic link email
   * @see {@link isEmailLink} To check if URL is a valid sign-in link
   */
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

  /**
   * Checks if a URL is a valid Firebase magic link sign-in URL.
   *
   * Used to determine if the current page should attempt to complete
   * a magic link sign-in flow.
   *
   * @param {string} url - URL to check (typically `window.location.href`)
   * @returns {boolean} True if the URL is a valid sign-in link
   *
   * @example
   * ```jsx
   * const { isEmailLink, completeSignInWithEmailLink } = useAuth()
   *
   * useEffect(() => {
   *   const url = window.location.href
   *   if (isEmailLink(url)) {
   *     // This is the callback from a magic link email
   *     completeSignInWithEmailLink(url)
   *   }
   * }, [])
   * ```
   */
  function isEmailLink(url) {
    return isSignInWithEmailLink(auth, url)
  }

  /**
   * Signs in the user with Google OAuth.
   *
   * Attempts popup authentication first (most reliable on desktop).
   * If popup is blocked, returns a helpful error message suggesting
   * the magic link alternative.
   *
   * Error handling:
   * - **popup-closed-by-user**: Returns null silently (user can retry)
   * - **popup-blocked**: Throws with message to use email sign-in
   * - **network-request-failed**: Throws with network error message
   * - **Other errors**: Throws with generic fallback message
   *
   * @async
   * @returns {Promise<import('firebase/auth').User|null>} Signed-in user, or null if cancelled
   * @throws {Error} With user-friendly message for actionable errors
   *
   * @example
   * ```jsx
   * const { loginWithGoogle } = useAuth()
   * const [error, setError] = useState(null)
   *
   * async function handleGoogleSignIn() {
   *   try {
   *     setError(null)
   *     const user = await loginWithGoogle()
   *     if (user) {
   *       navigate('/dashboard')
   *     }
   *     // null means user cancelled - no action needed
   *   } catch (err) {
   *     setError(err.message)
   *   }
   * }
   * ```
   */
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

  /**
   * Signs out the current user and clears local state.
   *
   * Clears the `userProfile` state and calls Firebase's `signOut()`.
   * The `onAuthStateChanged` listener will update `currentUser` to null.
   *
   * @async
   * @returns {Promise<void>}
   *
   * @example
   * ```jsx
   * const { logout, currentUser } = useAuth()
   *
   * function LogoutButton() {
   *   async function handleLogout() {
   *     await logout()
   *     navigate('/')
   *   }
   *
   *   return <button onClick={handleLogout}>Sign Out</button>
   * }
   * ```
   */
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

  /**
   * Bootstrap admin emails for initial access.
   * These users have admin privileges regardless of Firestore role field.
   * Should match the list in Dashboard.jsx and functions/index.js.
   * @constant {string[]}
   * @private
   */
  const ADMIN_EMAILS = [
    "jamditis@gmail.com",
    "murrayst@montclair.edu",
    "etiennec@montclair.edu"
  ]

  /**
   * Checks if the current user has permission to bookmark sessions.
   *
   * Permission is granted to:
   * - Users with `role` of `'admin'` or `'super_admin'`
   * - Users whose email is in the `ADMIN_EMAILS` bootstrap list
   * - Users with `registrationStatus` of `'registered'`, `'confirmed'`, or `'approved'`
   *
   * Pending users (those who haven't purchased tickets or been approved) cannot
   * bookmark sessions until their status changes.
   *
   * @returns {boolean} True if user can bookmark sessions
   *
   * @example
   * ```jsx
   * const { canBookmarkSessions } = useAuth()
   *
   * function SessionCard({ session }) {
   *   const canSave = canBookmarkSessions()
   *
   *   return (
   *     <div>
   *       <h3>{session.title}</h3>
   *       {canSave ? (
   *         <BookmarkButton sessionId={session.session_id} />
   *       ) : (
   *         <span className="text-gray-400">
   *           Purchase tickets to save sessions
   *         </span>
   *       )}
   *     </div>
   *   )
   * }
   * ```
   */
  function canBookmarkSessions() {
    if (!currentUser) return false

    // Check if admin
    const isAdmin = userProfile?.role === 'admin' ||
                    userProfile?.role === 'super_admin' ||
                    ADMIN_EMAILS.includes(currentUser?.email)
    if (isAdmin) return true

    // Check registration status
    const status = userProfile?.registrationStatus
    return status === 'registered' || status === 'confirmed' || status === 'approved'
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    needsProfileSetup, // True if user needs to complete profile (no displayName)
    showProfileSetupModal, // True if modal should be shown (needs setup AND not skipped)
    completeProfileSetup, // Function to complete profile setup
    skipProfileSetup, // Function to skip profile setup for this session
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
    canBookmarkSessions,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
