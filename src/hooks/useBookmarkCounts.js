import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Hook to fetch and subscribe to bookmark counts for all sessions
 * Returns an object mapping sessionId -> count
 */
export function useBookmarkCounts() {
  const [bookmarkCounts, setBookmarkCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to the sessionBookmarks collection
    const unsubscribe = onSnapshot(
      collection(db, 'sessionBookmarks'),
      (snapshot) => {
        const counts = {}
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Only include positive counts
          if (data.count > 0) {
            counts[doc.id] = data.count
          }
        })
        setBookmarkCounts(counts)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching bookmark counts:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { bookmarkCounts, loading }
}

export default useBookmarkCounts
