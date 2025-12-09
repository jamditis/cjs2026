import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyALqSUcQhvOMxU9obR_eFtdDryJlXw03bA",
  authDomain: "cjs2026.firebaseapp.com",
  projectId: "cjs2026",
  storageBucket: "cjs2026.firebasestorage.app",
  messagingSenderId: "223497615906",
  appId: "1:223497615906:web:1ce3ae6d4252f97a6be87b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app
