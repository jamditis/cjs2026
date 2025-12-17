import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2,
  LogOut,
  Ticket,
  Users,
  FileText,
  Building,
  Globe,
  Instagram,
  Linkedin,
  AtSign,
  Award,
  X,
  Sparkles,
  Camera,
  Upload,
  Loader2,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuth } from '../contexts/AuthContext'
import { storage } from '../firebase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Stepper, { Step } from '../components/Stepper'
import MySchedule from '../components/MySchedule'
import { checkProfanity, validateNoProfanity } from '../utils/profanityFilter'

// Admin email addresses (must match Cloud Functions)
const ADMIN_EMAILS = [
  "amditisj@montclair.edu",
  "jamditis@gmail.com",
  "murrays@montclair.edu",
]

// ============================================
// Badge Definitions
// ============================================

// Past CJS summits for attendance picker
const CJS_SUMMITS = [
  { year: 2017, location: 'Montclair', state: 'NJ', emoji: '🎓', note: 'inaugural' },
  { year: 2018, location: 'Montclair', state: 'NJ', emoji: '🎓', note: null },
  { year: 2019, location: 'Philadelphia', state: 'PA', emoji: '🔔', note: null },
  { year: 2020, location: 'virtual', state: null, emoji: '🏠', note: 'pandemic' },
  { year: 2021, location: 'virtual', state: null, emoji: '💻', note: 'pandemic' },
  { year: 2022, location: 'Chicago', state: 'IL', emoji: '🌆', note: null },
  { year: 2023, location: 'Washington D.C.', state: null, emoji: '🏛️', note: null },
  { year: 2024, location: 'Detroit', state: 'MI', emoji: '🚗', note: null },
  { year: 2025, location: 'Denver', state: 'CO', emoji: '🏔️', note: null },
]

// Generate attendance badges based on summit history
function getAttendanceBadges(attendedYears = []) {
  const badges = []
  const count = attendedYears.length

  if (count === 0) {
    badges.push({ id: 'cjs-first-timer', label: 'first timer', emoji: '👋', description: 'CJS2026 will be my first!' })
    return badges
  }

  // === Special badges ===

  // OG badge - attended inaugural 2017
  if (attendedYears.includes(2017)) {
    badges.push({ id: 'cjs-og', label: 'OG', emoji: '🏆', description: 'been here since day one' })
  }

  // COVID badges - 2020 and/or 2021 virtual summits
  const attended2020 = attendedYears.includes(2020)
  const attended2021 = attendedYears.includes(2021)
  if (attended2020 && attended2021) {
    badges.push({ id: 'cjs-zoom-veteran', label: 'zoom veteran', emoji: '📹', description: 'survived both virtual summits' })
  } else if (attended2020) {
    badges.push({ id: 'cjs-pandemic-pioneer', label: 'pandemic pioneer', emoji: '🦠', description: 'attended our first virtual summit' })
  } else if (attended2021) {
    badges.push({ id: 'cjs-lockdown-loyalist', label: 'lockdown loyalist', emoji: '🔒', description: 'stuck with us through year two of virtual' })
  }

  // === Streak detection (consecutive years only) ===
  const sortedYears = [...attendedYears].sort((a, b) => a - b)
  let maxStreak = 1, currentStreak = 1
  for (let i = 1; i < sortedYears.length; i++) {
    if (sortedYears[i] === sortedYears[i - 1] + 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  // Streak badges (only for actual consecutive attendance)
  if (maxStreak >= 2) {
    if (maxStreak === 2) {
      badges.push({ id: 'cjs-streak-2', label: 'back-to-back', emoji: '✌️', description: '2 consecutive years' })
    } else if (maxStreak === 3) {
      badges.push({ id: 'cjs-streak-3', label: 'three-peat', emoji: '🎯', description: '3 consecutive years' })
    } else if (maxStreak >= 4) {
      badges.push({ id: 'cjs-streak', label: `${maxStreak}-year streak`, emoji: '🔥', description: `${maxStreak} consecutive years` })
    }
  }

  // === City/location badges for single-year in-person attendance ===
  // Only for years attended where they're the sole non-virtual attendance that year's location
  const inPersonYears = attendedYears.filter(y => y !== 2020 && y !== 2021)

  // Give location badge for each unique location attended
  const locationCounts = {}
  inPersonYears.forEach(year => {
    const summit = CJS_SUMMITS.find(s => s.year === year)
    if (summit && summit.location !== 'virtual') {
      const loc = summit.location
      if (!locationCounts[loc]) {
        locationCounts[loc] = { count: 0, summit }
      }
      locationCounts[loc].count++
    }
  })

  // If only attended one in-person summit, give city badge
  if (inPersonYears.length === 1) {
    const year = inPersonYears[0]
    const summit = CJS_SUMMITS.find(s => s.year === year)
    if (summit) {
      badges.push({
        id: `cjs-${summit.location.toLowerCase().replace(/\s+/g, '-')}`,
        label: summit.location.toLowerCase(),
        emoji: summit.emoji,
        description: `attended CJS ${year} in ${summit.location}`
      })
    }
  }

  // Multi-summit count badge (total attendance)
  if (count >= 3 && count <= 5) {
    badges.push({ id: `cjs-${count}x`, label: `${count}x attendee`, emoji: '⭐', description: `attended ${count} summits total` })
  } else if (count >= 6) {
    badges.push({ id: 'cjs-super-fan', label: 'super fan', emoji: '🌟', description: `attended ${count} summits - true dedication!` })
  }

  return badges
}

const BADGE_CATEGORIES = {
  experience: {
    label: 'collaboration experience',
    maxPicks: 1,
    allowCustom: false,
    badges: [
      { id: 'collab-curious', label: 'collab curious', emoji: '🌱', description: 'new to collaborative journalism' },
      { id: 'collab-practitioner', label: 'practitioner', emoji: '🤝', description: 'actively collaborating' },
      { id: 'collab-veteran', label: 'veteran', emoji: '🎖️', description: '3+ collaborations under my belt' },
      { id: 'collab-evangelist', label: 'evangelist', emoji: '📣', description: 'spreading the collab gospel' },
    ]
  },
  role: {
    label: 'role',
    maxPicks: 1, // becomes 2 if personality-hire selected
    allowCustom: false,
    badges: [
      { id: 'role-reporter', label: 'reporter', emoji: '📝', description: 'on the ground' },
      { id: 'role-editor', label: 'editor', emoji: '✂️', description: 'making it better' },
      { id: 'role-leadership', label: 'leadership', emoji: '🧭', description: 'setting direction' },
      { id: 'role-funder', label: 'funder', emoji: '💰', description: 'supporting the work' },
      { id: 'role-academic', label: 'academic', emoji: '🎓', description: 'research & teaching' },
      { id: 'role-technologist', label: 'technologist', emoji: '💻', description: 'building tools' },
      { id: 'role-organizer', label: 'organizer', emoji: '🗂️', description: 'bringing people together' },
      { id: 'role-personality-hire', label: 'personality hire', emoji: '✨', description: 'here for the vibes' },
    ]
  },
  philosophy: {
    label: 'philosophy',
    maxPicks: 1,
    allowCustom: true,
    maxCustom: 3,
    badges: [
      { id: 'value-cooperation', label: 'cooperation > competition', emoji: '🤲', description: 'rising tides lift all boats' },
      { id: 'value-public-good', label: 'public good', emoji: '🌍', description: 'journalism as public service' },
      { id: 'value-indie', label: 'indie spirit', emoji: '🏴', description: 'independent & nonprofit' },
      { id: 'value-local-first', label: 'local first', emoji: '🏘️', description: 'community journalism advocate' },
      { id: 'value-open-source', label: 'open source', emoji: '🔓', description: 'share the tools' },
      { id: 'value-solidarity', label: 'solidarity', emoji: '✊', description: 'workers unite' },
      { id: 'value-disruptor', label: 'disruptor', emoji: '💥', description: 'break the old models' },
      { id: 'value-bridge-builder', label: 'bridge builder', emoji: '🌉', description: 'connecting communities' },
    ]
  },
  misc: {
    label: 'misc',
    maxPicks: 1,
    allowCustom: true,
    maxCustom: 3,
    badges: [
      { id: 'misc-deadline-driven', label: 'deadline driven', emoji: '⏰', description: 'best under pressure' },
      { id: 'misc-data-hound', label: 'data hound', emoji: '🔍', description: 'FOIA is my love language' },
      { id: 'misc-rural-beat', label: 'rural beat', emoji: '🌾', description: 'covering where others don\'t' },
      { id: 'misc-audio-first', label: 'audio first', emoji: '🎙️', description: 'podcast or bust' },
      { id: 'misc-newsletter-brain', label: 'newsletter brain', emoji: '📧', description: 'inbox zero? never heard of it' },
      { id: 'misc-grant-writer', label: 'grant writer', emoji: '📋', description: 'theory of change enthusiast' },
      { id: 'misc-cms-survivor', label: 'CMS survivor', emoji: '🖥️', description: 'i\'ve seen things' },
      { id: 'misc-source-whisperer', label: 'source whisperer', emoji: '🤫', description: 'people tell me things' },
      { id: 'misc-j-school', label: 'j-school', emoji: '🏫', description: 'Mizzou/Northwestern/Columbia/etc' },
      { id: 'misc-self-taught', label: 'self-taught', emoji: '📚', description: 'learned in the field' },
      { id: 'misc-bilingual', label: 'bilingual', emoji: '🗣️', description: 'reporting across languages' },
      { id: 'misc-visual-thinker', label: 'visual thinker', emoji: '📐', description: 'charts, maps, graphics' },
    ]
  }
}

// Helper to get max picks for role category (2 if personality-hire selected)
function getRoleMaxPicks(selectedBadges) {
  return selectedBadges.includes('role-personality-hire') ? 2 : 1
}

const ALL_BADGES = Object.values(BADGE_CATEGORIES).flatMap(cat => cat.badges)

// Common emojis for custom badge picker
const EMOJI_OPTIONS = ['💡', '🎯', '🚀', '⚡', '🌟', '💪', '🎨', '📰', '🗞️', '✍️', '🔗', '🌐', '💬', '🎤', '📸', '🎬']

// Photo upload constraints
const PHOTO_CONFIG = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB max
  maxSizeMB: 2,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxDimension: 400, // Resize to 400x400 max (good for profile display)
}

function Dashboard() {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    displayName: '',
    organization: '',
    role: '',
    website: '',
    instagram: '',
    linkedin: '',
    bluesky: '',
    badges: [],
    attendedSummits: [], // years attended (e.g., [2017, 2019, 2023])
    customBadges: {}, // { philosophy: [{emoji, label}], misc: [{emoji, label}] }
  })
  const [newCustomBadge, setNewCustomBadge] = useState({ category: null, emoji: '💡', label: '' })
  const [saving, setSaving] = useState(false)
  const [showBadgePicker, setShowBadgePicker] = useState(false)

  // Photo upload state
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const photoInputRef = useRef(null)

  // Profanity validation errors
  const [validationErrors, setValidationErrors] = useState({})

  // Stepper wizard data
  const [stepperData, setStepperData] = useState({
    displayName: '',
    organization: '',
    role: '',
    badges: [],
    attendedSummits: [],
    customBadges: {},
  })

  // Tutorial state
  const [tutorialState, setTutorialState] = useState(() => {
    const saved = localStorage.getItem('cjs2026_profile_tutorial')
    return saved ? JSON.parse(saved) : { dismissed: false, completed: false, skipUntilComplete: false }
  })

  // Toast notification state
  const [toast, setToast] = useState(null)

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const isProfileIncomplete = !userProfile?.displayName
  const showTutorial = isProfileIncomplete && !tutorialState.dismissed && !tutorialState.skipUntilComplete

  // Initialize edit data when profile loads
  useEffect(() => {
    if (userProfile) {
      setEditData({
        displayName: userProfile.displayName || '',
        organization: userProfile.organization || '',
        role: userProfile.role || '',
        website: userProfile.website || '',
        instagram: userProfile.instagram || '',
        linkedin: userProfile.linkedin || '',
        bluesky: userProfile.bluesky || '',
        badges: userProfile.badges || [],
        attendedSummits: userProfile.attendedSummits || [],
        customBadges: userProfile.customBadges || {},
      })
    }
  }, [userProfile])

  // Auto-open edit mode if profile is incomplete
  useEffect(() => {
    if (isProfileIncomplete && !editing) {
      setEditing(true)
    }
  }, [isProfileIncomplete])

  function dismissTutorial(permanently = false) {
    const newState = permanently
      ? { dismissed: true, completed: false, skipUntilComplete: false }
      : { dismissed: false, completed: false, skipUntilComplete: true }
    setTutorialState(newState)
    localStorage.setItem('cjs2026_profile_tutorial', JSON.stringify(newState))
  }

  function completeTutorial() {
    // Set dismissed: true to immediately close modal (don't wait for profile update)
    const newState = { dismissed: true, completed: true, skipUntilComplete: false }
    setTutorialState(newState)
    localStorage.setItem('cjs2026_profile_tutorial', JSON.stringify(newState))
  }

  // Resize image client-side to reduce storage/bandwidth
  function resizeImage(file, maxDimension) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          blob => resolve(blob),
          'image/jpeg',
          0.85 // Quality
        )
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  // Handle photo selection
  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError(null)

    // Validate file type
    if (!PHOTO_CONFIG.allowedTypes.includes(file.type)) {
      setPhotoError(`Please upload ${PHOTO_CONFIG.allowedExtensions.join(', ')} files only`)
      return
    }

    // Validate file size
    if (file.size > PHOTO_CONFIG.maxSizeBytes) {
      setPhotoError(`File too large. Maximum size is ${PHOTO_CONFIG.maxSizeMB}MB`)
      return
    }

    try {
      // Resize image to 400x400 max to reduce storage/bandwidth
      const resizedBlob = await resizeImage(file, PHOTO_CONFIG.maxDimension)
      const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' })

      setPhotoFile(resizedFile)
      setPhotoPreview(URL.createObjectURL(resizedBlob))
    } catch (err) {
      console.error('Error processing image:', err)
      setPhotoError('Failed to process image. Please try another.')
    }
  }

  // Upload photo to Firebase Storage
  async function uploadPhoto() {
    if (!photoFile || !currentUser) return null

    setPhotoUploading(true)
    try {
      const fileName = `profile-photos/${currentUser.uid}/${Date.now()}.jpg`
      const storageRef = ref(storage, fileName)

      await uploadBytes(storageRef, photoFile)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    } catch (err) {
      console.error('Error uploading photo:', err)
      setPhotoError('Failed to upload photo. Please try again.')
      return null
    } finally {
      setPhotoUploading(false)
    }
  }

  // Clear photo selection
  function clearPhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoError(null)
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  // Validate text with profanity filter
  function validateTextField(value, fieldName) {
    const error = validateNoProfanity(value, fieldName)
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
    return !error
  }

  // Validate step before advancing (returns true if valid, false to block)
  function validateStepperStep(stepNumber) {
    // Step 2: Name validation
    if (stepNumber === 2) {
      const { hasProfanity } = checkProfanity(stepperData.displayName)
      if (hasProfanity) {
        setValidationErrors({ displayName: 'Name contains inappropriate language' })
        return false
      }
      setValidationErrors(prev => ({ ...prev, displayName: null }))
    }

    // Step 4: Organization/Role validation
    if (stepNumber === 4) {
      const { hasProfanity: orgProfanity } = checkProfanity(stepperData.organization)
      const { hasProfanity: roleProfanity } = checkProfanity(stepperData.role)
      if (orgProfanity || roleProfanity) {
        setValidationErrors({
          organization: orgProfanity ? 'Organization contains inappropriate language' : null,
          role: roleProfanity ? 'Role contains inappropriate language' : null
        })
        return false
      }
      setValidationErrors(prev => ({ ...prev, organization: null, role: null }))
    }

    return true
  }

  // Handle stepper wizard completion
  async function handleStepperComplete() {
    if (stepperData.displayName) {
      // Final validation for profanity (shouldn't be needed if validateStep works, but just in case)
      const { hasProfanity: nameProfanity } = checkProfanity(stepperData.displayName)
      const { hasProfanity: orgProfanity } = checkProfanity(stepperData.organization)
      const { hasProfanity: roleProfanity } = checkProfanity(stepperData.role)

      if (nameProfanity || orgProfanity || roleProfanity) {
        setValidationErrors({
          displayName: nameProfanity ? 'Name contains inappropriate language' : null,
          organization: orgProfanity ? 'Organization contains inappropriate language' : null,
          role: roleProfanity ? 'Role contains inappropriate language' : null
        })
        return
      }

      setSaving(true)
      try {
        // Upload photo if selected
        let photoURL = null
        if (photoFile) {
          photoURL = await uploadPhoto()
        }

        await updateUserProfile(currentUser.uid, {
          ...editData,
          ...stepperData,
          ...(photoURL && { photoURL }),
        })
        setEditData(prev => ({ ...prev, ...stepperData }))
        clearPhoto()
        completeTutorial()
      } catch (err) {
        console.error('Error saving profile from stepper:', err)
      } finally {
        setSaving(false)
      }
    }
  }

  function toggleStepperBadge(badgeId) {
    setStepperData(prev => {
      const current = prev.badges || []
      if (current.includes(badgeId)) {
        return { ...prev, badges: current.filter(id => id !== badgeId) }
      }
      // Find which category this badge belongs to
      const categoryKey = Object.keys(BADGE_CATEGORIES).find(key =>
        BADGE_CATEGORIES[key].badges.some(b => b.id === badgeId)
      )
      if (!categoryKey) return prev

      // Count current picks in this category
      const categoryBadgeIds = BADGE_CATEGORIES[categoryKey].badges.map(b => b.id)
      const currentCategoryPicks = current.filter(id => categoryBadgeIds.includes(id))

      // Get max picks (special case for role if personality-hire selected)
      let maxPicks = BADGE_CATEGORIES[categoryKey].maxPicks
      if (categoryKey === 'role') {
        maxPicks = getRoleMaxPicks(current)
      }

      if (currentCategoryPicks.length < maxPicks) {
        return { ...prev, badges: [...current, badgeId] }
      }
      return prev
    })
  }

  // Reset skip state on new session if profile still incomplete
  useEffect(() => {
    if (isProfileIncomplete && tutorialState.skipUntilComplete) {
      const sessionKey = sessionStorage.getItem('cjs2026_session')
      if (!sessionKey) {
        sessionStorage.setItem('cjs2026_session', Date.now().toString())
        setTutorialState(prev => ({ ...prev, skipUntilComplete: false }))
        localStorage.setItem('cjs2026_profile_tutorial', JSON.stringify({ ...tutorialState, skipUntilComplete: false }))
      }
    }
  }, [isProfileIncomplete, tutorialState])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      // Upload photo if selected
      let photoURL = editData.photoURL
      if (photoFile) {
        photoURL = await uploadPhoto()
      }

      await updateUserProfile(currentUser.uid, {
        ...editData,
        ...(photoURL !== undefined && { photoURL })
      })
      setEditing(false)
      clearPhoto() // Reset photo state
      if (editData.displayName) {
        completeTutorial()
      }
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  function toggleBadge(badgeId) {
    setEditData(prev => {
      const current = prev.badges || []
      if (current.includes(badgeId)) {
        // Always allow deselection
        return { ...prev, badges: current.filter(id => id !== badgeId) }
      }
      // Find which category this badge belongs to
      const categoryKey = Object.keys(BADGE_CATEGORIES).find(key =>
        BADGE_CATEGORIES[key].badges.some(b => b.id === badgeId)
      )
      if (!categoryKey) return prev

      // Count current picks in this category
      const categoryBadgeIds = BADGE_CATEGORIES[categoryKey].badges.map(b => b.id)
      const currentCategoryPicks = current.filter(id => categoryBadgeIds.includes(id))

      // Get max picks (special case for role if personality-hire selected)
      let maxPicks = BADGE_CATEGORIES[categoryKey].maxPicks
      if (categoryKey === 'role') {
        maxPicks = getRoleMaxPicks(current)
      }

      // Check if we can add more in this category
      if (currentCategoryPicks.length < maxPicks) {
        return { ...prev, badges: [...current, badgeId] }
      }
      return prev
    })
  }

  // Toggle summit attendance
  function toggleSummitAttendance(year, isStepperData = false) {
    const setter = isStepperData ? setStepperData : setEditData
    setter(prev => {
      const current = prev.attendedSummits || []
      if (current.includes(year)) {
        return { ...prev, attendedSummits: current.filter(y => y !== year) }
      }
      return { ...prev, attendedSummits: [...current, year] }
    })
  }

  // Custom badge validation error
  const [customBadgeError, setCustomBadgeError] = useState(null)

  // Add custom badge
  function addCustomBadge(category, emoji, label, isStepperData = false) {
    if (!label.trim() || label.length > 20) return

    // Check for profanity
    const { hasProfanity } = checkProfanity(label)
    if (hasProfanity) {
      setCustomBadgeError('Badge contains inappropriate language')
      return
    }

    setCustomBadgeError(null)
    const setter = isStepperData ? setStepperData : setEditData
    setter(prev => {
      const current = prev.customBadges || {}
      const categoryBadges = current[category] || []
      if (categoryBadges.length >= 3) return prev
      if (categoryBadges.some(b => b.label.toLowerCase() === label.toLowerCase())) return prev
      return {
        ...prev,
        customBadges: {
          ...current,
          [category]: [...categoryBadges, { emoji, label: label.trim().toLowerCase() }]
        }
      }
    })
    setNewCustomBadge({ category: null, emoji: '💡', label: '' })
  }

  // Remove custom badge
  function removeCustomBadge(category, label, isStepperData = false) {
    const setter = isStepperData ? setStepperData : setEditData
    setter(prev => {
      const current = prev.customBadges || {}
      const categoryBadges = current[category] || []
      return {
        ...prev,
        customBadges: {
          ...current,
          [category]: categoryBadges.filter(b => b.label !== label)
        }
      }
    })
  }

  const registrationStatus = userProfile?.registrationStatus || 'pending'

  const statusConfig = {
    pending: {
      label: 'Tickets available',
      bgClass: 'bg-brand-teal/10',
      textClass: 'text-brand-teal',
      icon: Ticket,
      description: "Secure your spot at CJS2026",
    },
    registered: {
      label: 'Registered',
      bgClass: 'bg-brand-teal/10',
      textClass: 'text-brand-teal',
      icon: CheckCircle,
      description: 'Your spot is reserved',
    },
    confirmed: {
      label: 'Confirmed',
      bgClass: 'bg-brand-green-dark/10',
      textClass: 'text-brand-green-dark',
      icon: CheckCircle,
      description: 'See you in Chapel Hill!',
    },
  }

  const status = statusConfig[registrationStatus]
  const StatusIcon = status.icon

  // Get badge objects from IDs
  const selectedBadges = (editData.badges || []).map(id => ALL_BADGES.find(b => b.id === id)).filter(Boolean)
  const displayBadges = (userProfile?.badges || []).map(id => ALL_BADGES.find(b => b.id === id)).filter(Boolean)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-paper pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="editorial-headline text-3xl md:text-4xl text-brand-ink mb-2">
              {userProfile?.displayName
                ? `Welcome, ${userProfile.displayName.split(' ')[0]}`
                : 'Welcome'}
            </h1>
            <p className="font-body text-brand-ink/60">
              Manage your summit registration and profile
            </p>
          </motion.div>

          {/* Profile Setup Modal */}
          <AnimatePresence>
            {showTutorial && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Backdrop */}
                <motion.div
                  className="absolute inset-0 bg-brand-ink/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => dismissTutorial(false)}
                />

                {/* Modal - wider with more breathing room */}
                <motion.div
                  className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  {/* Dismiss buttons - more prominent */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    <button
                      onClick={() => dismissTutorial(false)}
                      className="px-3 py-1.5 text-xs font-medium text-brand-ink/60 hover:text-brand-ink hover:bg-brand-ink/5 rounded-full transition-all"
                      title="Skip for now"
                    >
                      Later
                    </button>
                    <button
                      onClick={() => dismissTutorial(true)}
                      className="p-1.5 text-brand-ink/40 hover:text-brand-ink hover:bg-brand-ink/5 rounded-full transition-all"
                      title="Don't show again"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <Stepper
                    initialStep={1}
                    onFinalStepCompleted={handleStepperComplete}
                    validateStep={validateStepperStep}
                    backButtonText="Back"
                    nextButtonText="Next"
                    disableStepIndicators={false}
                    indicatorPosition="bottom"
                    indicatorSize="small"
                  >
                    <Step>
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-teal/10 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-brand-teal" />
                        </div>
                        <h2>Welcome to CJS2026!</h2>
                        <p>Let's set up your attendee profile so others can connect with you at the summit.</p>
                      </div>
                    </Step>

                    <Step>
                      <h2>What's your name?</h2>
                      <p>This will appear on your attendee profile.</p>
                      <label>Full name *</label>
                      <input
                        type="text"
                        value={stepperData.displayName}
                        onChange={(e) => {
                          setStepperData(prev => ({ ...prev, displayName: e.target.value }))
                          setValidationErrors(prev => ({ ...prev, displayName: null }))
                        }}
                        onBlur={(e) => validateTextField(e.target.value, 'displayName')}
                        placeholder="Your name"
                        autoFocus
                        className={validationErrors.displayName ? 'border-brand-cardinal' : ''}
                      />
                      {validationErrors.displayName && (
                        <p className="text-brand-cardinal text-xs mt-1">{validationErrors.displayName}</p>
                      )}
                    </Step>

                    <Step>
                      <h2>Add a profile photo</h2>
                      <p>Optional, but helps people recognize you at the summit!</p>
                      <div className="mt-4 flex flex-col items-center">
                        {/* Photo preview or upload button */}
                        <div className="relative">
                          {photoPreview ? (
                            <div className="relative">
                              <img
                                src={photoPreview}
                                alt="Profile preview"
                                className="w-32 h-32 rounded-full object-cover border-4 border-brand-teal/20"
                              />
                              <button
                                type="button"
                                onClick={clearPhoto}
                                className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-lg border border-brand-ink/10 text-brand-ink/60 hover:text-brand-cardinal transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer group">
                              <div className="w-32 h-32 rounded-full bg-brand-ink/5 border-2 border-dashed border-brand-ink/20 flex flex-col items-center justify-center gap-2 group-hover:border-brand-teal group-hover:bg-brand-teal/5 transition-all">
                                <Camera className="w-8 h-8 text-brand-ink/30 group-hover:text-brand-teal transition-colors" />
                                <span className="text-xs text-brand-ink/50 group-hover:text-brand-teal">Upload photo</span>
                              </div>
                              <input
                                ref={photoInputRef}
                                type="file"
                                accept={PHOTO_CONFIG.allowedTypes.join(',')}
                                onChange={handlePhotoSelect}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Upload status */}
                        {photoUploading && (
                          <div className="mt-3 flex items-center gap-2 text-brand-teal text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        )}

                        {/* Error message */}
                        {photoError && (
                          <p className="mt-3 text-brand-cardinal text-xs text-center">{photoError}</p>
                        )}

                        {/* File constraints info */}
                        <p className="mt-4 text-xs text-brand-ink/40 text-center">
                          Max {PHOTO_CONFIG.maxSizeMB}MB • JPG, PNG, or WebP
                        </p>
                      </div>
                    </Step>

                    <Step>
                      <h2>Where do you work?</h2>
                      <p>Help others find collaborators from their region or beat.</p>
                      <label>Organization</label>
                      <input
                        type="text"
                        value={stepperData.organization}
                        onChange={(e) => {
                          setStepperData(prev => ({ ...prev, organization: e.target.value }))
                          setValidationErrors(prev => ({ ...prev, organization: null }))
                        }}
                        onBlur={(e) => validateTextField(e.target.value, 'organization')}
                        placeholder="Your organization or company"
                        className={validationErrors.organization ? 'border-brand-cardinal' : ''}
                      />
                      {validationErrors.organization && (
                        <p className="text-brand-cardinal text-xs mt-1">{validationErrors.organization}</p>
                      )}
                      <label>Role / Title</label>
                      <input
                        type="text"
                        value={stepperData.role}
                        onChange={(e) => {
                          setStepperData(prev => ({ ...prev, role: e.target.value }))
                          setValidationErrors(prev => ({ ...prev, role: null }))
                        }}
                        onBlur={(e) => validateTextField(e.target.value, 'role')}
                        placeholder="e.g. Reporter, Editor, Director"
                        className={validationErrors.role ? 'border-brand-cardinal' : ''}
                      />
                      {validationErrors.role && (
                        <p className="text-brand-cardinal text-xs mt-1">{validationErrors.role}</p>
                      )}
                    </Step>

                    <Step>
                      <h2>CJS attendance history</h2>
                      <p>Which summits have you attended? (This unlocks badges!)</p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {CJS_SUMMITS.map(summit => {
                          const isAttended = (stepperData.attendedSummits || []).includes(summit.year)
                          return (
                            <button
                              key={summit.year}
                              type="button"
                              onClick={() => toggleSummitAttendance(summit.year, true)}
                              className={`p-2 rounded-lg text-left transition-all border-2
                                ${isAttended
                                  ? 'bg-brand-teal/10 border-brand-teal'
                                  : 'bg-white border-brand-ink/10 hover:border-brand-ink/30'
                                }`}
                            >
                              <p className={`font-heading font-semibold text-sm ${isAttended ? 'text-brand-teal' : 'text-brand-ink'}`}>
                                {summit.emoji} {summit.year}
                              </p>
                              <p className="text-xs text-brand-ink/50 truncate">
                                {summit.location}
                                {summit.note && <span className="text-brand-teal ml-1">• {summit.note}</span>}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                      {/* Show earned badges */}
                      {(stepperData.attendedSummits?.length > 0 || stepperData.attendedSummits?.length === 0) && (
                        <div className="mt-3 pt-3 border-t border-brand-ink/10">
                          <p className="text-xs text-brand-ink/50 mb-2">Your attendance badges:</p>
                          <div className="flex flex-wrap gap-1">
                            {getAttendanceBadges(stepperData.attendedSummits || []).map(badge => (
                              <span key={badge.id} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs">
                                <span>{badge.emoji}</span>
                                <span>{badge.label}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Step>

                    <Step>
                      <h2>Pick your badges</h2>
                      <p>Optional! Pick up to 1 from each category.</p>
                      <div className="mt-3 max-h-56 overflow-y-auto space-y-3">
                        {Object.entries(BADGE_CATEGORIES).map(([key, category]) => {
                          const categoryBadgeIds = category.badges.map(b => b.id)
                          const currentPicks = (stepperData.badges || []).filter(id => categoryBadgeIds.includes(id))
                          let maxPicks = category.maxPicks
                          if (key === 'role') {
                            maxPicks = getRoleMaxPicks(stepperData.badges || [])
                          }
                          const categoryFull = currentPicks.length >= maxPicks
                          const customBadges = (stepperData.customBadges || {})[key] || []

                          return (
                            <div key={key}>
                              <p className="text-xs font-medium text-brand-ink/50 mb-1">
                                {category.label}
                                {key === 'role' && (stepperData.badges || []).includes('role-personality-hire') && (
                                  <span className="text-brand-teal ml-1">(pick 2!)</span>
                                )}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {category.badges.map(badge => {
                                  const isSelected = stepperData.badges?.includes(badge.id)
                                  const isDisabled = !isSelected && categoryFull
                                  return (
                                    <button
                                      key={badge.id}
                                      type="button"
                                      onClick={() => toggleStepperBadge(badge.id)}
                                      disabled={isDisabled}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all
                                        ${isSelected
                                          ? 'bg-brand-teal text-white'
                                          : isDisabled
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'bg-white border border-brand-ink/20 text-brand-ink hover:border-brand-teal'
                                        }`}
                                    >
                                      <span>{badge.emoji}</span>
                                      <span>{badge.label}</span>
                                    </button>
                                  )
                                })}
                                {/* Custom badges */}
                                {customBadges.map(badge => (
                                  <span
                                    key={badge.label}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal text-white rounded-full text-xs"
                                  >
                                    <span>{badge.emoji}</span>
                                    <span>{badge.label}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeCustomBadge(key, badge.label, true)}
                                      className="ml-1 hover:text-brand-cardinal"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                                {/* Add custom button */}
                                {category.allowCustom && customBadges.length < 3 && (
                                  newCustomBadge.category === key ? (
                                    <div className="relative flex items-center gap-1">
                                      <select
                                        value={newCustomBadge.emoji}
                                        onChange={(e) => setNewCustomBadge(prev => ({ ...prev, emoji: e.target.value }))}
                                        className="px-1 py-1 rounded border border-brand-ink/20 text-xs"
                                      >
                                        {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                      </select>
                                      <input
                                        type="text"
                                        value={newCustomBadge.label}
                                        onChange={(e) => {
                                          setNewCustomBadge(prev => ({ ...prev, label: e.target.value.slice(0, 20) }))
                                          setCustomBadgeError(null)
                                        }}
                                        placeholder="label (20 chars)"
                                        className={`w-24 px-2 py-1 rounded border text-xs ${customBadgeError ? 'border-brand-cardinal' : 'border-brand-ink/20'}`}
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            addCustomBadge(key, newCustomBadge.emoji, newCustomBadge.label, true)
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => addCustomBadge(key, newCustomBadge.emoji, newCustomBadge.label, true)}
                                        className="px-2 py-1 bg-brand-teal text-white rounded text-xs"
                                      >
                                        +
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNewCustomBadge({ category: null, emoji: '💡', label: '' })
                                          setCustomBadgeError(null)
                                        }}
                                        className="px-1 py-1 text-brand-ink/50 text-xs"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                      {customBadgeError && (
                                        <p className="absolute top-full left-0 mt-1 text-brand-cardinal text-[10px] whitespace-nowrap">{customBadgeError}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setNewCustomBadge({ category: key, emoji: '💡', label: '' })}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-dashed border-brand-ink/30 text-brand-ink/50 hover:border-brand-teal hover:text-brand-teal"
                                    >
                                      + custom
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Step>

                    <Step>
                      <div className="text-center">
                        {/* Show photo if uploaded, otherwise checkmark */}
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Your profile"
                            className="w-20 h-20 mx-auto mb-3 rounded-full object-cover border-4 border-brand-teal/20"
                          />
                        ) : (
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-teal/10 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-brand-teal" />
                          </div>
                        )}
                        <h2>You're all set!</h2>
                        <p>You can always update your profile later. See you in Chapel Hill!</p>
                        {/* Show all badges */}
                        <div className="flex flex-wrap justify-center gap-1 mt-4">
                          {getAttendanceBadges(stepperData.attendedSummits || []).map(badge => (
                            <span key={badge.id} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs">
                              <span>{badge.emoji}</span>
                              <span>{badge.label}</span>
                            </span>
                          ))}
                          {(stepperData.badges || []).map(id => {
                            const badge = ALL_BADGES.find(b => b.id === id)
                            return badge ? (
                              <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs">
                                <span>{badge.emoji}</span>
                                <span>{badge.label}</span>
                              </span>
                            ) : null
                          })}
                          {Object.entries(stepperData.customBadges || {}).flatMap(([_, badges]) =>
                            badges.map(badge => (
                              <span key={badge.label} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs">
                                <span>{badge.emoji}</span>
                                <span>{badge.label}</span>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </Step>
                  </Stepper>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Registration status card */}
              {userProfile?.ticketsPurchased ? (
                <motion.div
                  className="card-sketch p-6 bg-brand-green-dark/5 border-brand-green-dark/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-green-dark/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-brand-green-dark" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading font-semibold text-xl text-brand-green-dark">
                        Tickets purchased
                      </h2>
                      <p className="font-body text-brand-ink/60">
                        See you in Chapel Hill!
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="card-sketch p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${status.bgClass} flex items-center justify-center`}>
                      <StatusIcon className={`w-6 h-6 ${status.textClass}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading font-semibold text-xl text-brand-ink mb-1">
                        {status.label}
                      </h2>
                      <p className="font-body text-brand-ink/60 mb-4">
                        {status.description}
                      </p>

                      {registrationStatus === 'pending' && (
                        <div className="space-y-4">
                          <a
                            href="https://www.eventbrite.com/e/2026-collaborative-journalism-summit-tickets-1977919688031?aff=oddtdtcreator"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-2"
                          >
                            <Ticket className="w-4 h-4" />
                            Get tickets on Eventbrite
                          </a>
                          <div className="border-t border-brand-ink/10 pt-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                onChange={async (e) => {
                                  if (e.target.checked) {
                                    await updateUserProfile(currentUser.uid, { ticketsPurchased: true })
                                  }
                                }}
                                className="w-4 h-4 rounded border-2 border-brand-ink/20 text-brand-teal focus:ring-brand-teal"
                              />
                              <span className="font-body text-sm text-brand-ink/60 group-hover:text-brand-ink">
                                I've already purchased my tickets
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {registrationStatus === 'registered' && (
                        <div className="bg-white rounded-lg p-4 border border-brand-ink/10">
                          <p className="font-body text-sm text-brand-ink/70">
                            Complete your registration by paying the registration fee.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Event details */}
              <motion.div
                className="card-sketch p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-heading font-semibold text-xl text-brand-ink mb-4">
                  Event details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-brand-ink">June 8–9, 2026</p>
                      <p className="font-body text-sm text-brand-ink/60">Monday & Tuesday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-brand-ink">UNC Friday Center</p>
                      <p className="font-body text-sm text-brand-ink/60">Chapel Hill, North Carolina</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-brand-ink">June 8-9, 2026</p>
                      <p className="font-body text-sm text-brand-ink/60">See schedule for session times</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick links */}
              <motion.div
                className="grid sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/schedule"
                  className="card-sketch p-5 hover:border-brand-teal/50 transition-colors flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-brand-ink">Schedule</p>
                    <p className="font-body text-sm text-brand-ink/60">View sessions & workshops</p>
                  </div>
                </Link>
                <Link
                  to="/code-of-conduct"
                  className="card-sketch p-5 hover:border-brand-teal/50 transition-colors flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-brand-ink">Code of conduct</p>
                    <p className="font-body text-sm text-brand-ink/60">Community guidelines</p>
                  </div>
                </Link>
              </motion.div>

              {/* My Schedule section */}
              <motion.div
                className="card-sketch p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-xl text-brand-ink">
                    My schedule
                  </h2>
                  <Link
                    to="/my-schedule"
                    className="text-brand-teal hover:underline text-sm font-body"
                  >
                    View all
                  </Link>
                </div>
                <MySchedule compact={true} maxSessions={5} showViewAll={false} />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile card */}
              <motion.div
                className="card-sketch p-6 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-lg text-brand-ink">
                    Your profile
                  </h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-brand-teal hover:text-brand-teal-dark transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Profile photo */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center overflow-hidden">
                          {photoPreview ? (
                            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                          ) : userProfile?.photoURL || currentUser?.photoURL ? (
                            <img src={userProfile?.photoURL || currentUser?.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-brand-teal" />
                          )}
                        </div>
                        {photoUploading && (
                          <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="edit-photo-input"
                          accept={PHOTO_CONFIG.allowedTypes.join(',')}
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-photo-input"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal rounded-lg cursor-pointer transition-colors text-sm font-body"
                        >
                          <Camera className="w-4 h-4" />
                          {userProfile?.photoURL || currentUser?.photoURL || photoPreview ? 'Change photo' : 'Add photo'}
                        </label>
                        {(photoPreview || userProfile?.photoURL || currentUser?.photoURL) && !photoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditData({ ...editData, photoURL: null })
                              clearPhoto()
                            }}
                            className="ml-2 text-xs text-brand-cardinal hover:underline"
                          >
                            Remove
                          </button>
                        )}
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="ml-2 text-xs text-brand-cardinal hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                        {photoError && (
                          <p className="mt-1 text-xs text-brand-cardinal">{photoError}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Name <span className="text-brand-cardinal">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
                        <input
                          type="text"
                          value={editData.displayName}
                          onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                          required
                          placeholder="Your full name"
                          className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Organization
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/40" />
                        <input
                          type="text"
                          value={editData.organization}
                          onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                          placeholder="Your organization or company"
                          className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-body text-sm text-brand-ink/70 mb-1">
                        Role/Title
                      </label>
                      <input
                        type="text"
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        placeholder="e.g. Editor, Reporter, Director"
                        className="w-full px-3 py-2 rounded-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Social links with forced prefixes */}
                    <div className="border-t-2 border-brand-ink/10 pt-4 mt-4">
                      <p className="font-body text-xs text-brand-ink/50 mb-3">Social links (optional)</p>

                      <div className="space-y-3">
                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">Website</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50">
                              https://
                            </span>
                            <input
                              type="text"
                              value={editData.website}
                              onChange={(e) => setEditData({ ...editData, website: e.target.value.replace(/^https?:\/\//, '') })}
                              placeholder="yoursite.com"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">Instagram</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50">
                              @
                            </span>
                            <input
                              type="text"
                              value={editData.instagram}
                              onChange={(e) => setEditData({ ...editData, instagram: e.target.value.replace(/^@/, '') })}
                              placeholder="username"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">LinkedIn</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50 whitespace-nowrap">
                              linkedin.com/in/
                            </span>
                            <input
                              type="text"
                              value={editData.linkedin}
                              onChange={(e) => setEditData({ ...editData, linkedin: e.target.value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '') })}
                              placeholder="username"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-body text-xs text-brand-ink/50 mb-1">Bluesky</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 py-2 rounded-l-lg border-2 border-r-0 border-brand-ink/20 bg-brand-ink/5 font-mono text-xs text-brand-ink/50">
                              @
                            </span>
                            <input
                              type="text"
                              value={editData.bluesky}
                              onChange={(e) => setEditData({ ...editData, bluesky: e.target.value.replace(/^@/, '') })}
                              placeholder="handle.bsky.social"
                              className="w-full px-3 py-2 rounded-r-lg border-2 border-brand-ink/20 bg-white font-body text-brand-ink text-sm focus:border-brand-teal focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summit attendance picker */}
                    <div className="border-t-2 border-brand-ink/10 pt-4 mt-4">
                      <p className="font-body text-xs text-brand-ink/50 mb-3">CJS attendance history</p>
                      <div className="grid grid-cols-3 gap-1">
                        {CJS_SUMMITS.map(summit => {
                          const isAttended = (editData.attendedSummits || []).includes(summit.year)
                          return (
                            <button
                              key={summit.year}
                              type="button"
                              onClick={() => toggleSummitAttendance(summit.year, false)}
                              className={`p-1.5 rounded text-left transition-all border
                                ${isAttended
                                  ? 'bg-brand-teal/10 border-brand-teal'
                                  : 'bg-white border-brand-ink/10 hover:border-brand-ink/30'
                                }`}
                            >
                              <p className={`font-heading font-semibold text-xs ${isAttended ? 'text-brand-teal' : 'text-brand-ink'}`}>
                                {summit.year}
                              </p>
                              <p className="text-[10px] text-brand-ink/50 truncate">{summit.location}</p>
                            </button>
                          )
                        })}
                      </div>
                      {/* Auto-generated attendance badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getAttendanceBadges(editData.attendedSummits || []).map(badge => (
                          <span key={badge.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-teal/10 rounded-full text-[10px]">
                            <span>{badge.emoji}</span>
                            <span>{badge.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Badge picker */}
                    <div className="border-t-2 border-brand-ink/10 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-body text-xs text-brand-ink/50">Profile badges (1 per category)</p>
                        <button
                          type="button"
                          onClick={() => setShowBadgePicker(!showBadgePicker)}
                          className="text-brand-teal text-xs hover:underline flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />
                          {showBadgePicker ? 'Hide' : 'Choose badges'}
                        </button>
                      </div>

                      {/* Selected badges preview */}
                      {(selectedBadges.length > 0 || Object.values(editData.customBadges || {}).some(arr => arr.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedBadges.map(badge => (
                            <span
                              key={badge.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs font-body text-brand-ink"
                            >
                              <span>{badge.emoji}</span>
                              <span>{badge.label}</span>
                              <button
                                type="button"
                                onClick={() => toggleBadge(badge.id)}
                                className="text-brand-ink/40 hover:text-brand-cardinal ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {Object.entries(editData.customBadges || {}).flatMap(([cat, badges]) =>
                            badges.map(badge => (
                              <span
                                key={`${cat}-${badge.label}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs font-body text-brand-ink"
                              >
                                <span>{badge.emoji}</span>
                                <span>{badge.label}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCustomBadge(cat, badge.label, false)}
                                  className="text-brand-ink/40 hover:text-brand-cardinal ml-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      )}

                      {/* Badge picker modal */}
                      <AnimatePresence>
                        {showBadgePicker && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-brand-ink/5 rounded-lg p-3 space-y-4 max-h-64 overflow-y-auto">
                              {Object.entries(BADGE_CATEGORIES).map(([key, category]) => {
                                const categoryBadgeIds = category.badges.map(b => b.id)
                                const currentPicks = (editData.badges || []).filter(id => categoryBadgeIds.includes(id))
                                let maxPicks = category.maxPicks
                                if (key === 'role') {
                                  maxPicks = getRoleMaxPicks(editData.badges || [])
                                }
                                const categoryFull = currentPicks.length >= maxPicks
                                const customBadges = (editData.customBadges || {})[key] || []

                                return (
                                  <div key={key}>
                                    <p className="font-body text-xs font-medium text-brand-ink/60 mb-2">
                                      {category.label}
                                      {key === 'role' && (editData.badges || []).includes('role-personality-hire') && (
                                        <span className="text-brand-teal ml-1">(pick 2!)</span>
                                      )}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {category.badges.map(badge => {
                                        const isSelected = editData.badges?.includes(badge.id)
                                        const isDisabled = !isSelected && categoryFull
                                        return (
                                          <button
                                            key={badge.id}
                                            type="button"
                                            onClick={() => !isDisabled && toggleBadge(badge.id)}
                                            disabled={isDisabled}
                                            title={badge.description}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all
                                              ${isSelected
                                                ? 'bg-brand-teal text-white'
                                                : isDisabled
                                                  ? 'bg-brand-ink/5 text-brand-ink/30 cursor-not-allowed'
                                                  : 'bg-white border border-brand-ink/20 text-brand-ink hover:border-brand-teal'
                                              }`}
                                          >
                                            <span>{badge.emoji}</span>
                                            <span>{badge.label}</span>
                                          </button>
                                        )
                                      })}
                                      {/* Custom badges */}
                                      {customBadges.map(badge => (
                                        <span
                                          key={badge.label}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal text-white rounded-full text-xs"
                                        >
                                          <span>{badge.emoji}</span>
                                          <span>{badge.label}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeCustomBadge(key, badge.label, false)}
                                            className="ml-1 hover:text-brand-cardinal"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </span>
                                      ))}
                                      {/* Add custom button */}
                                      {category.allowCustom && customBadges.length < 3 && (
                                        newCustomBadge.category === key ? (
                                          <div className="relative flex items-center gap-1">
                                            <select
                                              value={newCustomBadge.emoji}
                                              onChange={(e) => setNewCustomBadge(prev => ({ ...prev, emoji: e.target.value }))}
                                              className="px-1 py-1 rounded border border-brand-ink/20 text-xs"
                                            >
                                              {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                            </select>
                                            <input
                                              type="text"
                                              value={newCustomBadge.label}
                                              onChange={(e) => {
                                                setNewCustomBadge(prev => ({ ...prev, label: e.target.value.slice(0, 20) }))
                                                setCustomBadgeError(null)
                                              }}
                                              placeholder="label"
                                              className={`w-20 px-2 py-1 rounded border text-xs ${customBadgeError ? 'border-brand-cardinal' : 'border-brand-ink/20'}`}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  e.preventDefault()
                                                  addCustomBadge(key, newCustomBadge.emoji, newCustomBadge.label, false)
                                                }
                                              }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => addCustomBadge(key, newCustomBadge.emoji, newCustomBadge.label, false)}
                                              className="px-2 py-1 bg-brand-teal text-white rounded text-xs"
                                            >
                                              +
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setNewCustomBadge({ category: null, emoji: '💡', label: '' })
                                                setCustomBadgeError(null)
                                              }}
                                              className="text-brand-ink/50"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                            {customBadgeError && (
                                              <p className="absolute top-full left-0 mt-1 text-brand-cardinal text-[10px] whitespace-nowrap">{customBadgeError}</p>
                                            )}
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => setNewCustomBadge({ category: key, emoji: '💡', label: '' })}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-dashed border-brand-ink/30 text-brand-ink/50 hover:border-brand-teal hover:text-brand-teal"
                                          >
                                            + custom
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={saving || !editData.displayName}
                        className="btn-primary py-2 px-4 text-sm flex-1 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save profile'}
                      </button>
                      {!isProfileIncomplete && (
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="py-2 px-4 text-sm border-2 border-brand-ink/20 rounded-lg font-body text-brand-ink hover:border-brand-ink/40 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center overflow-hidden">
                        {userProfile?.photoURL || currentUser?.photoURL ? (
                          <img
                            src={userProfile?.photoURL || currentUser?.photoURL}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-brand-teal" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-brand-ink">
                          {userProfile?.displayName || 'No name set'}
                        </p>
                        <p className="font-body text-sm text-brand-ink/60">
                          {currentUser?.email}
                        </p>
                      </div>
                    </div>

                    {userProfile?.organization && (
                      <p className="font-body text-sm text-brand-ink/70">
                        <span className="text-brand-ink/50">Organization:</span> {userProfile.organization}
                      </p>
                    )}
                    {userProfile?.role && (
                      <p className="font-body text-sm text-brand-ink/70">
                        <span className="text-brand-ink/50">Role:</span> {userProfile.role}
                      </p>
                    )}

                    {/* Display badges */}
                    {(displayBadges.length > 0 || (userProfile?.attendedSummits?.length >= 0) || Object.values(userProfile?.customBadges || {}).some(arr => arr.length > 0)) && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {/* Attendance badges */}
                        {getAttendanceBadges(userProfile?.attendedSummits || []).map(badge => (
                          <span
                            key={badge.id}
                            title={badge.description}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs font-body text-brand-ink"
                          >
                            <span>{badge.emoji}</span>
                            <span>{badge.label}</span>
                          </span>
                        ))}
                        {/* Category badges */}
                        {displayBadges.map(badge => (
                          <span
                            key={badge.id}
                            title={badge.description}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs font-body text-brand-ink"
                          >
                            <span>{badge.emoji}</span>
                            <span>{badge.label}</span>
                          </span>
                        ))}
                        {/* Custom badges */}
                        {Object.entries(userProfile?.customBadges || {}).flatMap(([_, badges]) =>
                          badges.map(badge => (
                            <span
                              key={badge.label}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal/10 rounded-full text-xs font-body text-brand-ink"
                            >
                              <span>{badge.emoji}</span>
                              <span>{badge.label}</span>
                            </span>
                          ))
                        )}
                      </div>
                    )}

                    {/* Social links */}
                    {(userProfile?.website || userProfile?.instagram || userProfile?.linkedin || userProfile?.bluesky) && (
                      <div className="flex gap-2 pt-2 border-t border-brand-ink/10">
                        {userProfile.website && (
                          <a
                            href={`https://${userProfile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.instagram && (
                          <a
                            href={`https://instagram.com/${userProfile.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.linkedin && (
                          <a
                            href={`https://linkedin.com/in/${userProfile.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.bluesky && (
                          <a
                            href={`https://bsky.app/profile/${userProfile.bluesky}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-brand-ink/5 hover:bg-brand-teal/10 text-brand-ink/60 hover:text-brand-teal transition-colors"
                          >
                            <AtSign className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                className="card-sketch p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 rounded-lg border-2 border-brand-ink/20 font-body text-brand-ink/70 hover:border-brand-cardinal/50 hover:text-brand-cardinal transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>

              {/* Admin tools - only visible to admins */}
              {currentUser && ADMIN_EMAILS.includes(currentUser.email) && (
                <motion.div
                  className="card-sketch p-4 border-brand-cardinal/30 bg-brand-cardinal/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-brand-cardinal" />
                    <span className="font-body text-xs font-medium text-brand-cardinal">Admin tools</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm('Reset ticketsPurchased flag? This will show the ticket CTA again.')) {
                        await updateUserProfile(currentUser.uid, { ticketsPurchased: false })
                      }
                    }}
                    className="w-full py-2 px-4 rounded-lg border-2 border-brand-cardinal/30 font-body text-sm text-brand-cardinal hover:bg-brand-cardinal/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset ticket status
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-brand-teal text-white'
                : 'bg-brand-cardinal text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-body text-sm">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Dashboard
