import React, { createContext, useContext, useState, useEffect } from 'react'

const ContentContext = createContext()

// Cloud Function URL
const CONTENT_API_URL = 'https://us-central1-cjs2026.cloudfunctions.net/getSiteContent'

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Fetch content from API
  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(CONTENT_API_URL)
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.content) {
        setContent(data.content)
        setLastUpdated(data.content.lastUpdated)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching content:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchContent()
  }, [])

  // Helper function to get content by section and field
  const getContent = (section, field, defaultValue = '') => {
    if (!content?.sections?.[section]?.[field]) {
      return defaultValue
    }
    return content.sections[section][field].value || defaultValue
  }

  // Helper function to get content with metadata
  const getContentWithMeta = (section, field) => {
    return content?.sections?.[section]?.[field] || null
  }

  // Helper function to get all content for a section
  const getSection = (section) => {
    return content?.sections?.[section] || {}
  }

  // Helper function to get content by page
  const getPageContent = (page) => {
    return content?.byPage?.[page] || {}
  }

  // Helper function to get timeline data
  const getTimeline = () => {
    return content?.timeline || []
  }

  // Helper function to get stats data
  const getStats = () => {
    return content?.stats || []
  }

  // Helper to get color class from color name
  const getColorClass = (colorName, type = 'text') => {
    const colorMap = {
      teal: {
        text: 'text-brand-teal',
        bg: 'bg-brand-teal',
        border: 'border-brand-teal',
      },
      cardinal: {
        text: 'text-brand-cardinal',
        bg: 'bg-brand-cardinal',
        border: 'border-brand-cardinal',
      },
      'green-dark': {
        text: 'text-brand-green-dark',
        bg: 'bg-brand-green-dark',
        border: 'border-brand-green-dark',
      },
      ink: {
        text: 'text-brand-ink',
        bg: 'bg-brand-ink',
        border: 'border-brand-ink',
      },
      cream: {
        text: 'text-brand-cream',
        bg: 'bg-brand-cream',
        border: 'border-brand-cream',
      },
      gold: {
        text: 'text-brand-gold',
        bg: 'bg-brand-gold',
        border: 'border-brand-gold',
      },
      white: {
        text: 'text-white',
        bg: 'bg-white',
        border: 'border-white',
      },
    }
    return colorMap[colorName]?.[type] || ''
  }

  const value = {
    content,
    loading,
    error,
    lastUpdated,
    refetch: fetchContent,
    getContent,
    getContentWithMeta,
    getSection,
    getPageContent,
    getTimeline,
    getStats,
    getColorClass,
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

export default ContentContext
