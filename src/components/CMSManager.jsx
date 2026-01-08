import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  FileText,
  Calendar,
  Building,
  Clock,
  History,
  Upload,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  Search,
  Filter,
  GripVertical,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  HelpCircle,
  Undo2,
  Database
} from 'lucide-react'
import CMSTour, { TourTrigger, CMSTooltip } from './CMSTour'
import { db } from '../firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  getDocs,
  where,
  limit as firestoreLimit,
  writeBatch
} from 'firebase/firestore'

// Import CMS architecture
import {
  PAGE_CONFIGS,
  BLOCK_TYPES,
  COLOR_OPTIONS,
  getAllowedBlocksForSection,
  isSectionReorderable,
  getMaxBlocks
} from '../cms/cmsArchitecture'

// Cloud Functions URL
const FUNCTIONS_URL = 'https://us-central1-cjs2026.cloudfunctions.net'

// Session type options
const SESSION_TYPES = ['session', 'workshop', 'break', 'special', 'lightning', 'keynote']

// Sponsor tier options
const SPONSOR_TIERS = ['presenting', 'lead', 'supporting', 'partner', 'media', 'community']

// Convert PAGE_CONFIGS to array for iteration
const PAGE_STRUCTURE = Object.values(PAGE_CONFIGS)

// Flat section options for backwards compatibility
const SECTION_OPTIONS = PAGE_STRUCTURE.flatMap(page =>
  page.sections.map(section => ({
    value: section.id,
    label: section.label,
    page: page.id,
    pageLabel: page.label,
    allowedBlocks: section.allowedBlocks || [],
    reorderable: section.reorderable !== false
  }))
)

// Helper to format section names for display
const formatSectionName = (section) => {
  const found = SECTION_OPTIONS.find(s => s.value === section)
  if (found) return found.label
  // Fallback: convert snake_case to Title Case
  return section
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to format field names for display
const formatFieldName = (field) => {
  if (!field) return ''
  // Convert snake_case to Title Case with special handling
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/Url\b/g, 'URL')
    .replace(/Cta\b/g, 'CTA')
    .replace(/Inn\b/g, 'INN')
    .replace(/Ccm\b/g, 'CCM')
}

// ============================================================================
// MAIN CMS MANAGER COMPONENT
// ============================================================================
export default function CMSManager({ currentUser, userRole, isInk }) {
  const [activeSubTab, setActiveSubTab] = useState('content')
  const [pendingChanges, setPendingChanges] = useState([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState(null)
  const [toast, setToast] = useState(null)
  const [showTour, setShowTour] = useState(false)

  // Determine if user is a super admin (can see/edit all fields)
  const isSuperAdmin = userRole === 'super_admin'

  const subTabs = [
    { id: 'content', label: 'Site content', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'organizations', label: 'Organizations', icon: Building },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'history', label: 'Version history', icon: History },
    { id: 'publish', label: 'Publish', icon: Upload }
  ]

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const addPendingChange = useCallback((change) => {
    setPendingChanges(prev => [...prev, { ...change, timestamp: Date.now() }])
  }, [])

  const handlePublish = async () => {
    if (pendingChanges.length === 0) {
      showToast('No changes to publish', 'info')
      return
    }

    setIsPublishing(true)
    setPublishStatus('Triggering deploy...')

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch(`${FUNCTIONS_URL}/cmsPublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ changes: pendingChanges })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Publish failed')
      }

      showToast('Publishing started! Site will update in ~60 seconds', 'success')
      setPendingChanges([])
      setPublishStatus('Deploy triggered successfully')
    } catch (error) {
      console.error('Publish error:', error)
      showToast(`Publish failed: ${error.message}`, 'error')
      setPublishStatus(`Error: ${error.message}`)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Guided Tour */}
      <CMSTour onComplete={() => showToast('Tour complete! Happy editing.', 'success')} />

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-900/90 border border-emerald-500/50' :
              toast.type === 'error' ? 'bg-rose-900/90 border border-rose-500/50' :
              'bg-amber-900/90 border border-amber-500/50'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
             toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> :
             <AlertCircle className="w-5 h-5 text-amber-400" />}
            <span className="text-white font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-admin-heading text-xl font-semibold text-[var(--admin-text)]">
            Content management
          </h2>
          <p className="font-admin-body text-sm text-[var(--admin-text-secondary)] mt-1">
            Edit site content directly. Changes are saved to Firestore and published via GitHub Actions.
          </p>
        </div>
        <CMSTooltip content="Take a guided tour of the CMS features" position="left">
          <TourTrigger />
        </CMSTooltip>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 flex-wrap" data-tour="cms-tabs">
        {subTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              data-tour={tab.id === 'publish' ? 'publish-tab' : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-admin-body text-sm ${
                activeSubTab === tab.id
                  ? 'bg-admin-teal text-white shadow-lg shadow-admin-teal/25'
                  : 'admin-glass text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'publish' && pendingChanges.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-white">
                  {pendingChanges.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Pending changes banner */}
      <AnimatePresence>
        {pendingChanges.length > 0 && (
          <motion.div
            data-tour="publish-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <span className="font-admin-body text-amber-200 font-medium">
                  {pendingChanges.length} unpublished change{pendingChanges.length !== 1 ? 's' : ''}
                </span>
                <p className="text-sm text-amber-300/70">
                  Changes are saved to Firestore but not yet live on the website
                </p>
              </div>
            </div>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 bg-admin-teal text-white rounded-lg hover:bg-admin-teal/80 disabled:opacity-50 transition-all font-admin-body"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isPublishing ? 'Publishing...' : 'Publish now'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeSubTab === 'content' && (
            <CMSContentEditor
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              onPendingChange={addPendingChange}
              showToast={showToast}
            />
          )}
          {activeSubTab === 'schedule' && (
            <CMSScheduleEditor
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              onPendingChange={addPendingChange}
              showToast={showToast}
            />
          )}
          {activeSubTab === 'organizations' && (
            <CMSOrganizationsEditor
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              onPendingChange={addPendingChange}
              showToast={showToast}
            />
          )}
          {activeSubTab === 'timeline' && (
            <CMSTimelineEditor
              currentUser={currentUser}
              isSuperAdmin={isSuperAdmin}
              onPendingChange={addPendingChange}
              showToast={showToast}
            />
          )}
          {activeSubTab === 'history' && (
            <CMSVersionHistory currentUser={currentUser} />
          )}
          {activeSubTab === 'publish' && (
            <CMSPublishQueue
              currentUser={currentUser}
              pendingChanges={pendingChanges}
              onPublish={handlePublish}
              isPublishing={isPublishing}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// CONTENT EDITOR - Page-based approach
// ============================================================================
function CMSContentEditor({ currentUser, isSuperAdmin, onPendingChange, showToast }) {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [expandedSections, setExpandedSections] = useState({})
  const [addToSection, setAddToSection] = useState(null) // Track which section to add new content to
  const [reordering, setReordering] = useState(false) // Track if reorder operation is in progress
  const [undoStack, setUndoStack] = useState([]) // Stack of undoable actions
  const [undoing, setUndoing] = useState(false) // Track if undo operation is in progress

  // Fetch content from Firestore
  useEffect(() => {
    const q = query(collection(db, 'cmsContent'), orderBy('section'), orderBy('order'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setContent(items)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching content:', error)
      showToast('Failed to load content', 'error')
      setLoading(false)
    })
    return () => unsubscribe()
  }, [showToast])

  // Get content for a specific section
  const getContentForSection = (sectionId) => {
    return content
      .filter(item => item.section === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  // Count content items for a page
  const getPageContentCount = (page) => {
    const sectionIds = page.sections.map(s => s.id)
    return content.filter(item => sectionIds.includes(item.section)).length
  }

  const handleSave = async (itemData, isNew = false) => {
    setSaving(true)
    try {
      const token = await currentUser.getIdToken()
      const endpoint = isNew ? 'cmsCreateContent' : 'cmsUpdateContent'
      const body = isNew
        ? { collection: 'cmsContent', data: itemData }
        : { collection: 'cmsContent', documentId: editingItem.id, data: itemData }

      const response = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }

      showToast(isNew ? 'Content created' : 'Content updated', 'success')
      onPendingChange({
        collection: 'cmsContent',
        documentId: isNew ? data.id : editingItem.id,
        action: isNew ? 'create' : 'update',
        field: itemData.field
      })
      setEditingItem(null)
      setShowAddModal(false)
    } catch (error) {
      console.error('Save error:', error)
      showToast(`Save failed: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.field}"? This cannot be undone.`)) return

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch(`${FUNCTIONS_URL}/cmsDeleteContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ collection: 'cmsContent', documentId: item.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      showToast('Content deleted', 'success')
      onPendingChange({
        collection: 'cmsContent',
        documentId: item.id,
        action: 'delete',
        field: item.field
      })
    } catch (error) {
      console.error('Delete error:', error)
      showToast(`Delete failed: ${error.message}`, 'error')
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Reorder items within a section by swapping positions
  const handleReorder = async (items, fromIndex, toIndex, sectionId) => {
    // Validate indices
    if (toIndex < 0 || toIndex >= items.length) return
    if (fromIndex === toIndex) return
    if (reordering) return // Prevent concurrent reorders

    setReordering(true)

    // Save previous state for undo
    const previousOrder = items.map((item, idx) => ({ id: item.id, order: item.order ?? idx }))

    try {
      // Create a new array with swapped items
      const reorderedItems = [...items]
      const [movedItem] = reorderedItems.splice(fromIndex, 1)
      reorderedItems.splice(toIndex, 0, movedItem)

      // Update order values for all affected items
      const token = await currentUser.getIdToken()
      const batch = writeBatch(db)

      // Update order field for each item in the new order
      reorderedItems.forEach((item, index) => {
        const docRef = doc(db, 'cmsContent', item.id)
        batch.update(docRef, { order: index })
      })

      await batch.commit()

      // Add to undo stack (keep last 10 actions)
      setUndoStack(prev => [...prev.slice(-9), {
        type: 'reorder',
        collection: 'cmsContent',
        sectionId,
        previousOrder,
        description: `Moved "${items[fromIndex].field}" ${toIndex < fromIndex ? 'up' : 'down'}`
      }])

      showToast('Order updated (Ctrl+Z to undo)', 'success')
      onPendingChange({
        collection: 'cmsContent',
        action: 'reorder',
        sectionId,
        changes: reorderedItems.map((item, idx) => ({ id: item.id, newOrder: idx }))
      })
    } catch (error) {
      console.error('Reorder error:', error)
      showToast(`Reorder failed: ${error.message}`, 'error')
    } finally {
      setReordering(false)
    }
  }

  // Undo the last action
  const handleUndo = async () => {
    if (undoStack.length === 0 || undoing) return

    const lastAction = undoStack[undoStack.length - 1]
    setUndoing(true)

    try {
      if (lastAction.type === 'reorder') {
        // Restore previous order
        const batch = writeBatch(db)
        lastAction.previousOrder.forEach(({ id, order }) => {
          const docRef = doc(db, lastAction.collection, id)
          batch.update(docRef, { order })
        })
        await batch.commit()
        showToast('Undo successful', 'success')
      }

      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1))
    } catch (error) {
      console.error('Undo error:', error)
      showToast(`Undo failed: ${error.message}`, 'error')
    } finally {
      setUndoing(false)
    }
  }

  // Keyboard shortcut for undo (Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (undoStack.length > 0) {
          e.preventDefault()
          handleUndo()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoStack, undoing])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-admin-teal" />
      </div>
    )
  }

  // Page selector view (no page selected)
  if (!selectedPage) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="font-admin-heading text-lg text-[var(--admin-text)] mb-2">
            Select a page to edit
          </h3>
          <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">
            Choose which page you'd like to manage content for
          </p>
        </div>

        <div data-tour="page-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAGE_STRUCTURE.map(page => {
            const contentCount = getPageContentCount(page)
            return (
              <motion.button
                key={page.id}
                onClick={() => {
                  setSelectedPage(page)
                  // Expand all sections by default
                  const expanded = {}
                  page.sections.forEach(s => expanded[s.id] = true)
                  setExpandedSections(expanded)
                }}
                className="admin-surface p-6 text-left hover:bg-[var(--admin-surface-hover)] transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{page.icon}</span>
                  <span className="admin-badge admin-badge-info text-xs">
                    {contentCount} items
                  </span>
                </div>
                <h4 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)] group-hover:text-admin-teal transition-colors mb-1">
                  {page.label}
                </h4>
                <p className="font-admin-body text-sm text-[var(--admin-text-muted)] mb-3">
                  {page.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {page.sections.slice(0, 3).map(section => (
                    <span key={section.id} className="text-xs px-2 py-0.5 rounded-full bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)]">
                      {section.label}
                    </span>
                  ))}
                  {page.sections.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)]">
                      +{page.sections.length - 3} more
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Edit/Add Modal */}
        <AnimatePresence>
          {(editingItem || showAddModal) && (
            <ContentEditModal
              item={editingItem || { section: 'general', field: '', content: '', color: 'teal', visible: true, order: 0 }}
              isNew={showAddModal}
              onSave={handleSave}
              onClose={() => { setEditingItem(null); setShowAddModal(false) }}
              saving={saving}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Page editor view (page selected)
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedPage(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg admin-glass text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] transition-all font-admin-body text-sm"
          >
            <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
            Back to pages
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedPage.icon}</span>
            <div>
              <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">
                {selectedPage.label}
              </h3>
              <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">
                {selectedPage.description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo button - only show when there are actions to undo */}
          {undoStack.length > 0 && (
            <button
              onClick={handleUndo}
              disabled={undoing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg admin-glass text-[var(--admin-text-muted)] hover:text-admin-amber hover:bg-admin-amber/10 transition-all font-admin-body text-sm disabled:opacity-50"
              title={`Undo: ${undoStack[undoStack.length - 1]?.description || 'last action'} (Ctrl+Z)`}
            >
              {undoing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Undo2 className="w-4 h-4" />
              )}
              Undo
              <span className="text-xs opacity-60">({undoStack.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-admin-teal text-white rounded-lg hover:bg-admin-teal/80 transition-all font-admin-body text-sm"
          >
            <Plus className="w-4 h-4" />
            Add content
          </button>
        </div>
      </div>

      {/* Sections within the page */}
      <div data-tour="section-list">
      {selectedPage.sections.map((section, sectionIndex) => {
        const items = getContentForSection(section.id)
        const isExpanded = expandedSections[section.id] !== false

        return (
          <div key={section.id} className="admin-surface overflow-hidden mb-4">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-3">
                  <h4 className="font-admin-heading text-lg font-semibold text-admin-teal">
                    {section.label}
                  </h4>
                  <span className="admin-badge admin-badge-info">{items.length} items</span>
                </div>
                <p className="font-admin-body text-sm text-[var(--admin-text-muted)] mt-0.5">
                  {section.description}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-[var(--admin-text-muted)] flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--admin-text-muted)] flex-shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[var(--admin-border)]"
                >
                  {items.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="font-admin-body text-sm text-[var(--admin-text-muted)] mb-3">
                        No content in this section yet
                      </p>
                      <button
                        onClick={() => {
                          setShowAddModal(true)
                          setAddToSection(section.id)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg admin-glass text-admin-teal hover:bg-[var(--admin-surface-hover)] transition-all font-admin-body text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add first content block
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--admin-border)]">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-4 hover:bg-[var(--admin-surface-hover)] transition-colors group"
                        >
                          {/* Drag handle and order controls */}
                          <div
                            className="flex items-center gap-2 mr-3 flex-shrink-0"
                            {...(sectionIndex === 0 && index === 0 ? { 'data-tour': 'reorder-controls' } : {})}
                          >
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleReorder(items, index, index - 1, section.id)}
                                disabled={index === 0 || reordering}
                                aria-label="Move item up"
                                className="p-2 rounded hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-admin-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                {reordering ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ArrowUp className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReorder(items, index, index + 1, section.id)}
                                disabled={index === items.length - 1 || reordering}
                                aria-label="Move item down"
                                className="p-2 rounded hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-admin-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                              >
                                {reordering ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <span className="text-xs text-[var(--admin-text-muted)] font-mono w-6 text-center">
                              {index + 1}
                            </span>
                          </div>

                          {/* Content preview */}
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-admin-body font-medium text-[var(--admin-text)]">
                                {formatFieldName(item.field)}
                              </span>
                              {item.color && (
                                <span
                                  className={`w-3 h-3 rounded-full ${
                                    COLOR_OPTIONS.find(c => c.value === item.color)?.class || 'bg-gray-500'
                                  }`}
                                  title={`Color: ${item.color}`}
                                />
                              )}
                              {!item.visible && (
                                <span className="admin-badge bg-gray-600 text-gray-200 text-xs px-1.5 py-0.5">
                                  <EyeOff className="w-3 h-3 inline mr-1" />
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="font-admin-body text-sm text-[var(--admin-text-muted)] mt-1 line-clamp-2">
                              {item.content || <span className="italic text-[var(--admin-text-muted)]/50">(no content)</span>}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 rounded-lg hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-admin-teal transition-colors"
                              title="Edit content"
                              {...(sectionIndex === 0 && index === 0 ? { 'data-tour': 'edit-button' } : {})}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-2 rounded-lg hover:bg-rose-500/20 text-[var(--admin-text-muted)] hover:text-rose-400 transition-colors"
                              title="Delete content"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add content button at bottom of section */}
                      <div className="p-3 bg-[var(--admin-surface-hover)]/30">
                        <button
                          onClick={() => {
                            setShowAddModal(true)
                            setAddToSection(section.id)
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-admin-teal hover:text-admin-teal transition-all font-admin-body text-sm"
                          {...(sectionIndex === 0 ? { 'data-tour': 'add-button' } : {})}
                        >
                          <Plus className="w-4 h-4" />
                          Add content block
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editingItem || showAddModal) && (
          <ContentEditModal
            item={editingItem || {
              section: addToSection || selectedPage?.sections[0]?.id || 'general',
              field: '',
              content: '',
              color: 'teal',
              visible: true,
              order: getContentForSection(addToSection || selectedPage?.sections[0]?.id || 'general').length // Auto-set order to end of section
            }}
            isNew={showAddModal}
            isSuperAdmin={isSuperAdmin}
            onSave={handleSave}
            onClose={() => {
              setEditingItem(null)
              setShowAddModal(false)
              setAddToSection(null) // Reset section selection when closing
            }}
            saving={saving}
            selectedPageSections={selectedPage?.sections || []}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// CONTENT EDIT MODAL
// ============================================================================
function ContentEditModal({ item, isNew, isSuperAdmin = false, onSave, onClose, saving, selectedPageSections = [] }) {
  const [formData, setFormData] = useState({
    field: item.field || '',
    section: item.section || 'general',
    content: item.content || '',
    color: item.color || 'teal',
    visible: item.visible !== false,
    order: item.order || 0,
    page: item.page || '',
    component: item.component || '',
    link: item.link || ''
  })

  // Use page-specific sections if available, otherwise all sections
  const availableSections = selectedPageSections.length > 0
    ? selectedPageSections.map(s => ({ value: s.id, label: s.label, description: s.description, allowedBlocks: s.allowedBlocks || [] }))
    : SECTION_OPTIONS.map(s => ({ ...s, allowedBlocks: s.allowedBlocks || [] }))

  // Get the current section's metadata for context
  const currentSectionMeta = availableSections.find(s => s.value === formData.section)

  // Get allowed block types for the current section
  const allowedBlockTypes = currentSectionMeta?.allowedBlocks?.length > 0
    ? Object.values(BLOCK_TYPES).filter(b => currentSectionMeta.allowedBlocks.includes(b.id))
    : Object.values(BLOCK_TYPES)

  const handleSubmit = (e) => {
    e.preventDefault()
    // For regular admins editing existing content, only validate content field
    if (isSuperAdmin || isNew) {
      if (!formData.field.trim() || !formData.section) {
        alert('Content name and section are required')
        return
      }
    }
    onSave(formData, isNew)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg admin-surface p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-admin-heading text-xl font-semibold text-[var(--admin-text)]">
              {isNew ? 'Add content block' : 'Edit content'}
            </h3>
            {/* Show context info for regular admins */}
            {!isSuperAdmin && !isNew && (
              <p className="text-sm text-[var(--admin-text-muted)] font-admin-body mt-1">
                Editing: {formatFieldName(item.field)} in {formatSectionName(item.section)}
              </p>
            )}
            {isNew && currentSectionMeta && (
              <p className="text-sm text-admin-teal font-admin-body mt-1">
                Adding to: {currentSectionMeta.label}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--admin-glass-bg)] rounded-lg transition-colors" aria-label="Close modal">
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SUPER ADMIN ONLY: Section dropdown */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Section *
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value, component: '' }))}
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                required
              >
                {availableSections.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {currentSectionMeta?.description && (
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  {currentSectionMeta.description}
                </p>
              )}
            </div>
          )}

          {/* SUPER ADMIN ONLY: Block type selector */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Block type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {allowedBlockTypes.slice(0, 8).map(blockType => (
                  <button
                    key={blockType.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, component: blockType.id }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-admin-body transition-colors ${
                      formData.component === blockType.id
                        ? 'bg-admin-teal/20 border-2 border-admin-teal text-admin-teal'
                        : 'admin-glass text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)]'
                    }`}
                  >
                    <span className="text-lg">{blockType.icon}</span>
                    <span className="truncate">{blockType.label}</span>
                  </button>
                ))}
              </div>
              {allowedBlockTypes.length > 8 && (
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  +{allowedBlockTypes.length - 8} more block types available
                </p>
              )}
            </div>
          )}

          {/* SUPER ADMIN ONLY: Content name/field ID */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Content name *
              </label>
              <input
                type="text"
                value={formData.field}
                onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="e.g., main_headline, registration_button"
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                required={isSuperAdmin || isNew}
              />
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                A unique identifier for this content block (auto-formatted as snake_case)
              </p>
            </div>
          )}

          {/* Content textarea */}
          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your content text here..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50 resize-y"
              required
            />
          </div>

          {/* Color - visible to all admins */}
          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Color
            </label>
            <select
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
            >
              {COLOR_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* SUPER ADMIN ONLY: Order and advanced options */}
          {isSuperAdmin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                    Page context
                  </label>
                  <input
                    type="text"
                    value={formData.page}
                    onChange={(e) => setFormData(prev => ({ ...prev, page: e.target.value }))}
                    placeholder="e.g., Home, Schedule"
                    className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Link (optional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
            />
          </div>

          {/* SUPER ADMIN ONLY: Visibility toggle */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visible"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 text-admin-teal focus:ring-admin-teal/50"
              />
              <label htmlFor="visible" className="text-sm font-admin-body text-[var(--admin-text)]">
                Visible on website
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg admin-glass font-admin-body text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-admin-teal text-white font-admin-body hover:bg-admin-teal/80 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// SCHEDULE EDITOR
// ============================================================================
function CMSScheduleEditor({ currentUser, isSuperAdmin = false, onPendingChange, showToast }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingSession, setEditingSession] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterDay, setFilterDay] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'cmsSchedule'), orderBy('order'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSessions(items)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching schedule:', error)
      showToast('Failed to load schedule', 'error')
      setLoading(false)
    })
    return () => unsubscribe()
  }, [showToast])

  const filteredSessions = sessions.filter(s => !filterDay || s.day === filterDay)

  const handleSave = async (sessionData, isNew = false) => {
    setSaving(true)
    try {
      const token = await currentUser.getIdToken()
      const endpoint = isNew ? 'cmsCreateContent' : 'cmsUpdateContent'
      const body = isNew
        ? { collection: 'cmsSchedule', data: sessionData }
        : { collection: 'cmsSchedule', documentId: editingSession.id, data: sessionData }

      const response = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }

      showToast(isNew ? 'Session created' : 'Session updated', 'success')
      onPendingChange({
        collection: 'cmsSchedule',
        documentId: isNew ? data.id : editingSession.id,
        action: isNew ? 'create' : 'update',
        field: sessionData.title
      })
      setEditingSession(null)
      setShowAddModal(false)
    } catch (error) {
      console.error('Save error:', error)
      showToast(`Save failed: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (session) => {
    if (!confirm(`Delete "${session.title}"? This cannot be undone.`)) return

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch(`${FUNCTIONS_URL}/cmsDeleteContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ collection: 'cmsSchedule', documentId: session.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      showToast('Session deleted', 'success')
      onPendingChange({
        collection: 'cmsSchedule',
        documentId: session.id,
        action: 'delete',
        field: session.title
      })
    } catch (error) {
      console.error('Delete error:', error)
      showToast(`Delete failed: ${error.message}`, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-admin-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="px-4 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
        >
          <option value="">All days</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-admin-teal text-white rounded-lg hover:bg-admin-teal/80 transition-all font-admin-body text-sm"
        >
          <Plus className="w-4 h-4" />
          Add session
        </button>
      </div>

      {/* Sessions list */}
      <div className="admin-surface overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Title</th>
              <th>Type</th>
              <th>Day</th>
              <th>Time</th>
              <th>Visible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[var(--admin-text-muted)]">
                  No sessions found
                </td>
              </tr>
            ) : (
              filteredSessions.map(session => (
                <tr key={session.id}>
                  <td className="font-admin-mono text-xs">{session.order}</td>
                  <td className="font-admin-body font-medium">{session.title}</td>
                  <td>
                    <span className="admin-badge admin-badge-info capitalize">{session.type}</span>
                  </td>
                  <td>{session.day}</td>
                  <td className="font-admin-mono text-xs">
                    {session.startTime}{session.endTime ? ` - ${session.endTime}` : ''}
                  </td>
                  <td>
                    {session.visible !== false ? (
                      <Eye className="w-4 h-4 text-admin-emerald" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="p-1.5 rounded hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-admin-teal transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(session)}
                        className="p-1.5 rounded hover:bg-rose-500/20 text-[var(--admin-text-muted)] hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editingSession || showAddModal) && (
          <SessionEditModal
            session={editingSession || {
              sessionId: `session-${Date.now()}`,
              title: '',
              type: 'session',
              day: 'Monday',
              startTime: '',
              endTime: '',
              description: '',
              room: '',
              speakers: '',
              speakerOrgs: '',
              track: '',
              order: sessions.length + 1,
              visible: true,
              isBookmarkable: true,
              color: 'teal'
            }}
            isNew={showAddModal}
            isSuperAdmin={isSuperAdmin}
            onSave={handleSave}
            onClose={() => { setEditingSession(null); setShowAddModal(false) }}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// SESSION EDIT MODAL
// ============================================================================
function SessionEditModal({ session, isNew, isSuperAdmin = false, onSave, onClose, saving }) {
  const [formData, setFormData] = useState({
    sessionId: session.sessionId || `session-${Date.now()}`,
    title: session.title || '',
    type: session.type || 'session',
    day: session.day || 'Monday',
    startTime: session.startTime || '',
    endTime: session.endTime || '',
    description: session.description || '',
    room: session.room || '',
    speakers: session.speakers || '',
    speakerOrgs: session.speakerOrgs || '',
    track: session.track || '',
    order: session.order || 1,
    visible: session.visible !== false,
    isBookmarkable: session.isBookmarkable !== false,
    color: session.color || 'teal'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.startTime) {
      alert('Title and start time are required')
      return
    }
    onSave(formData, isNew)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl admin-surface p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-admin-heading text-xl font-semibold text-[var(--admin-text)]">
            {isNew ? 'Add session' : 'Edit session'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--admin-glass-bg)] rounded-lg transition-colors" aria-label="Close modal">
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Session title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Opening keynote"
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              required
            />
          </div>

          {/* Day - visible to all admins */}
          <div className={`grid ${isSuperAdmin ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
            {/* SUPER ADMIN ONLY: Type */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                >
                  {SESSION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Day *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                required
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
              </select>
            </div>
            {/* SUPER ADMIN ONLY: Order */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Start time *
              </label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                placeholder="9:00 AM"
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                End time
              </label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Session description..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50 resize-y"
            />
          </div>

          {/* Room - visible to all admins */}
          <div className={`grid ${isSuperAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Room
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                placeholder="Main hall"
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              />
            </div>
            {/* SUPER ADMIN ONLY: Track */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                  Track
                </label>
                <input
                  type="text"
                  value={formData.track}
                  onChange={(e) => setFormData(prev => ({ ...prev, track: e.target.value }))}
                  placeholder="Track A"
                  className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Speakers
              </label>
              <input
                type="text"
                value={formData.speakers}
                onChange={(e) => setFormData(prev => ({ ...prev, speakers: e.target.value }))}
                placeholder="Jay Rosen, Emily Bell"
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              />
            </div>
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Speaker organizations
              </label>
              <input
                type="text"
                value={formData.speakerOrgs}
                onChange={(e) => setFormData(prev => ({ ...prev, speakerOrgs: e.target.value }))}
                placeholder="NYU, Columbia"
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              />
            </div>
          </div>

          {/* SUPER ADMIN ONLY: Visibility and bookmarkability toggles */}
          {isSuperAdmin && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="session-visible"
                  checked={formData.visible}
                  onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 text-admin-teal focus:ring-admin-teal/50"
                />
                <label htmlFor="session-visible" className="text-sm font-admin-body text-[var(--admin-text)]">
                  Visible
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="session-bookmarkable"
                  checked={formData.isBookmarkable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isBookmarkable: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 text-admin-teal focus:ring-admin-teal/50"
                />
                <label htmlFor="session-bookmarkable" className="text-sm font-admin-body text-[var(--admin-text)]">
                  Can be bookmarked
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg admin-glass font-admin-body text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-admin-teal text-white font-admin-body hover:bg-admin-teal/80 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// ORGANIZATIONS EDITOR
// ============================================================================
function CMSOrganizationsEditor({ currentUser, isSuperAdmin = false, onPendingChange, showToast }) {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingOrg, setEditingOrg] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterSponsor, setFilterSponsor] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'cmsOrganizations'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setOrganizations(items)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching organizations:', error)
      showToast('Failed to load organizations', 'error')
      setLoading(false)
    })
    return () => unsubscribe()
  }, [showToast])

  const filteredOrgs = organizations.filter(o => {
    if (filterSponsor === 'sponsors') return o.isSponsor
    if (filterSponsor === 'non-sponsors') return !o.isSponsor
    return true
  })

  const handleSave = async (orgData, isNew = false) => {
    setSaving(true)
    try {
      const token = await currentUser.getIdToken()
      const endpoint = isNew ? 'cmsCreateContent' : 'cmsUpdateContent'
      const body = isNew
        ? { collection: 'cmsOrganizations', data: orgData }
        : { collection: 'cmsOrganizations', documentId: editingOrg.id, data: orgData }

      const response = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }

      showToast(isNew ? 'Organization created' : 'Organization updated', 'success')
      onPendingChange({
        collection: 'cmsOrganizations',
        documentId: isNew ? data.id : editingOrg.id,
        action: isNew ? 'create' : 'update',
        field: orgData.name
      })
      setEditingOrg(null)
      setShowAddModal(false)
    } catch (error) {
      console.error('Save error:', error)
      showToast(`Save failed: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (org) => {
    if (!confirm(`Delete "${org.name}"? This cannot be undone.`)) return

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch(`${FUNCTIONS_URL}/cmsDeleteContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ collection: 'cmsOrganizations', documentId: org.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      showToast('Organization deleted', 'success')
      onPendingChange({
        collection: 'cmsOrganizations',
        documentId: org.id,
        action: 'delete',
        field: org.name
      })
    } catch (error) {
      console.error('Delete error:', error)
      showToast(`Delete failed: ${error.message}`, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-admin-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterSponsor}
          onChange={(e) => setFilterSponsor(e.target.value)}
          className="px-4 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
        >
          <option value="">All organizations</option>
          <option value="sponsors">Sponsors only</option>
          <option value="non-sponsors">Non-sponsors only</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-admin-teal text-white rounded-lg hover:bg-admin-teal/80 transition-all font-admin-body text-sm"
        >
          <Plus className="w-4 h-4" />
          Add organization
        </button>
      </div>

      {/* Organizations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrgs.length === 0 ? (
          <div className="col-span-full admin-surface p-8 text-center">
            <p className="text-[var(--admin-text-muted)] font-admin-body">
              No organizations found
            </p>
          </div>
        ) : (
          filteredOrgs.map(org => (
            <div key={org.id} className="admin-surface p-4">
              <div className="flex items-start gap-4">
                {org.logoUrl ? (
                  <img
                    src={org.logoUrl}
                    alt={org.name}
                    className="w-12 h-12 object-contain bg-white rounded"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-[var(--admin-glass-bg)] flex items-center justify-center">
                    <Building className="w-6 h-6 text-[var(--admin-text-muted)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-admin-body font-medium text-[var(--admin-text)] truncate">
                    {org.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {org.isSponsor && (
                      <span className="admin-badge admin-badge-success text-xs">
                        Sponsor
                      </span>
                    )}
                    {org.sponsorTier && (
                      <span className="admin-badge admin-badge-info text-xs capitalize">
                        {org.sponsorTier}
                      </span>
                    )}
                    {!org.visible && (
                      <span className="admin-badge bg-gray-600 text-gray-200 text-xs">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--admin-border)]">
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-admin-teal transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => setEditingOrg(org)}
                  className="p-1.5 rounded hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-admin-teal transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(org)}
                  className="p-1.5 rounded hover:bg-rose-500/20 text-[var(--admin-text-muted)] hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editingOrg || showAddModal) && (
          <OrganizationEditModal
            org={editingOrg || {
              name: '',
              logoUrl: '',
              logoPath: '',
              website: '',
              isSponsor: false,
              sponsorTier: '',
              sponsorOrder: 99,
              description: '',
              type: '',
              visible: true
            }}
            isNew={showAddModal}
            isSuperAdmin={isSuperAdmin}
            onSave={handleSave}
            onClose={() => { setEditingOrg(null); setShowAddModal(false) }}
            saving={saving}
            currentUser={currentUser}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// ORGANIZATION EDIT MODAL
// ============================================================================
function OrganizationEditModal({ org, isNew, isSuperAdmin = false, onSave, onClose, saving, currentUser, showToast }) {
  const [formData, setFormData] = useState({
    name: org.name || '',
    logoUrl: org.logoUrl || '',
    logoPath: org.logoPath || '',
    website: org.website || '',
    isSponsor: org.isSponsor || false,
    sponsorTier: org.sponsorTier || '',
    sponsorOrder: org.sponsorOrder || 99,
    description: org.description || '',
    type: org.type || '',
    visible: org.visible !== false
  })
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error')
      return
    }

    setUploading(true)
    try {
      const token = await currentUser.getIdToken()
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('category', 'sponsors')

      const response = await fetch(`${FUNCTIONS_URL}/cmsUploadImage`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFormData(prev => ({
        ...prev,
        logoUrl: data.url,
        logoPath: data.path
      }))
      showToast('Image uploaded', 'success')
    } catch (error) {
      console.error('Upload error:', error)
      showToast(`Upload failed: ${error.message}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Name is required')
      return
    }
    onSave(formData, isNew)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg admin-surface p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-admin-heading text-xl font-semibold text-[var(--admin-text)]">
            {isNew ? 'Add organization' : 'Edit organization'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--admin-glass-bg)] rounded-lg transition-colors" aria-label="Close modal">
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Organization name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Knight Foundation"
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              required
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain bg-white rounded"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-[var(--admin-glass-bg)] flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-[var(--admin-text-muted)]" />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg admin-glass cursor-pointer hover:bg-[var(--admin-surface-hover)] transition-colors">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="font-admin-body text-sm text-[var(--admin-text)]">
                    {uploading ? 'Uploading...' : 'Upload image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoUrl: '', logoPath: '' }))}
                    className="mt-2 text-sm text-rose-400 hover:text-rose-300 font-admin-body"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
            />
          </div>

          {/* Sponsor settings (all admins can edit) */}
          <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSponsor"
                  checked={formData.isSponsor}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSponsor: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-600 text-admin-teal focus:ring-admin-teal/50"
                />
                <label htmlFor="isSponsor" className="text-sm font-admin-body text-[var(--admin-text)]">
                  This is a sponsor
                </label>
              </div>

              {formData.isSponsor && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--admin-glass-bg)]">
                  <div>
                    <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                      Sponsor tier
                    </label>
                    <select
                      value={formData.sponsorTier}
                      onChange={(e) => setFormData(prev => ({ ...prev, sponsorTier: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                    >
                      <option value="">Select tier</option>
                      {SPONSOR_TIERS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                      Display order
                    </label>
                    <input
                      type="number"
                      value={formData.sponsorOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, sponsorOrder: parseInt(e.target.value) || 99 }))}
                      className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                    />
                  </div>
                </div>
              )}
          </>

          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Organization description..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50 resize-y"
            />
          </div>

          {/* SUPER ADMIN ONLY: Visibility toggle */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="org-visible"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 text-admin-teal focus:ring-admin-teal/50"
              />
              <label htmlFor="org-visible" className="text-sm font-admin-body text-[var(--admin-text)]">
                Visible on website
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg admin-glass font-admin-body text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-admin-teal text-white font-admin-body hover:bg-admin-teal/80 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// TIMELINE EDITOR
// ============================================================================
function CMSTimelineEditor({ currentUser, isSuperAdmin = false, onPendingChange, showToast }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'cmsTimeline'), orderBy('order'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEntries(items)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching timeline:', error)
      showToast('Failed to load timeline', 'error')
      setLoading(false)
    })
    return () => unsubscribe()
  }, [showToast])

  const handleSave = async (entryData, isNew = false) => {
    setSaving(true)
    try {
      const token = await currentUser.getIdToken()
      const endpoint = isNew ? 'cmsCreateContent' : 'cmsUpdateContent'
      const body = isNew
        ? { collection: 'cmsTimeline', data: entryData }
        : { collection: 'cmsTimeline', documentId: editingEntry.id, data: entryData }

      const response = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }

      showToast(isNew ? 'Timeline entry created' : 'Timeline entry updated', 'success')
      onPendingChange({
        collection: 'cmsTimeline',
        documentId: isNew ? data.id : editingEntry.id,
        action: isNew ? 'create' : 'update',
        field: entryData.year
      })
      setEditingEntry(null)
      setShowAddModal(false)
    } catch (error) {
      console.error('Save error:', error)
      showToast(`Save failed: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entry) => {
    if (!confirm(`Delete timeline entry for ${entry.year}? This cannot be undone.`)) return

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch(`${FUNCTIONS_URL}/cmsDeleteContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ collection: 'cmsTimeline', documentId: entry.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      showToast('Timeline entry deleted', 'success')
      onPendingChange({
        collection: 'cmsTimeline',
        documentId: entry.id,
        action: 'delete',
        field: entry.year
      })
    } catch (error) {
      console.error('Delete error:', error)
      showToast(`Delete failed: ${error.message}`, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-admin-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-admin-teal text-white rounded-lg hover:bg-admin-teal/80 transition-all font-admin-body text-sm"
        >
          <Plus className="w-4 h-4" />
          Add year
        </button>
      </div>

      {/* Timeline entries */}
      <div className="admin-surface overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Location</th>
              <th>Theme</th>
              <th>Link</th>
              <th>Visible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[var(--admin-text-muted)]">
                  No timeline entries found
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id}>
                  <td className="font-admin-mono font-bold text-admin-teal">{entry.year}</td>
                  <td className="font-admin-body">{entry.location}</td>
                  <td className="font-admin-body text-sm text-[var(--admin-text-muted)]">{entry.theme || '—'}</td>
                  <td>
                    {entry.link ? (
                      <a
                        href={entry.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-admin-teal hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : '—'}
                  </td>
                  <td>
                    {entry.visible !== false ? (
                      <Eye className="w-4 h-4 text-admin-emerald" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[var(--admin-text-muted)]" />
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="p-1.5 rounded hover:bg-[var(--admin-glass-bg)] text-[var(--admin-text-muted)] hover:text-admin-teal transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry)}
                        className="p-1.5 rounded hover:bg-rose-500/20 text-[var(--admin-text-muted)] hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editingEntry || showAddModal) && (
          <TimelineEditModal
            entry={editingEntry || {
              year: new Date().getFullYear().toString(),
              location: '',
              theme: '',
              link: '',
              emoji: '',
              order: entries.length + 1,
              visible: true
            }}
            isNew={showAddModal}
            isSuperAdmin={isSuperAdmin}
            onSave={handleSave}
            onClose={() => { setEditingEntry(null); setShowAddModal(false) }}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// TIMELINE EDIT MODAL
// ============================================================================
function TimelineEditModal({ entry, isNew, isSuperAdmin = false, onSave, onClose, saving }) {
  const [formData, setFormData] = useState({
    year: entry.year || '',
    location: entry.location || '',
    theme: entry.theme || '',
    link: entry.link || '',
    emoji: entry.emoji || '',
    order: entry.order || 1,
    visible: entry.visible !== false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.year.trim() || !formData.location.trim()) {
      alert('Year and location are required')
      return
    }
    onSave(formData, isNew)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md admin-surface p-6 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-admin-heading text-xl font-semibold text-[var(--admin-text)]">
            {isNew ? 'Add timeline entry' : 'Edit timeline entry'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--admin-glass-bg)] rounded-lg transition-colors" aria-label="Close modal">
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SUPER ADMIN ONLY: Year and Order */}
          {isSuperAdmin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                  Year *
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="2026"
                  className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
                />
              </div>
            </div>
          )}

          {/* Show year label for regular admins (read-only context) */}
          {!isSuperAdmin && !isNew && (
            <p className="text-sm text-admin-teal font-admin-body">
              Editing: {entry.year} summit
            </p>
          )}

          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Pittsburgh, PA"
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
              Theme
            </label>
            <input
              type="text"
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
              placeholder="From experiment to ecosystem"
              className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Link (archive URL)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
              />
            </div>
            <div>
              <label className="block text-sm font-admin-body text-[var(--admin-text-muted)] mb-1">
                Emoji
              </label>
              <input
                type="text"
                value={formData.emoji}
                onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                placeholder="🎓"
                className="w-full px-3 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50 text-center"
              />
            </div>
          </div>

          {/* SUPER ADMIN ONLY: Visibility toggle */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="timeline-visible"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 text-admin-teal focus:ring-admin-teal/50"
              />
              <label htmlFor="timeline-visible" className="text-sm font-admin-body text-[var(--admin-text)]">
                Visible on website
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg admin-glass font-admin-body text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-admin-teal text-white font-admin-body hover:bg-admin-teal/80 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// VERSION HISTORY
// ============================================================================
function CMSVersionHistory({ currentUser }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ collection: '' })

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = await currentUser.getIdToken()
        const params = new URLSearchParams({ limit: '50' })
        if (filter.collection) params.append('collection', filter.collection)

        const response = await fetch(`${FUNCTIONS_URL}/cmsGetVersionHistory?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) throw new Error('Failed to fetch history')

        const data = await response.json()
        setHistory(data.history || [])
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [currentUser, filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-admin-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter.collection}
          onChange={(e) => setFilter(prev => ({ ...prev, collection: e.target.value }))}
          className="px-4 py-2 rounded-lg admin-glass font-admin-body text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-admin-teal/50"
        >
          <option value="">All collections</option>
          <option value="cmsContent">Site content</option>
          <option value="cmsSchedule">Schedule</option>
          <option value="cmsOrganizations">Organizations</option>
          <option value="cmsTimeline">Timeline</option>
        </select>
      </div>

      {/* History list */}
      {history.length === 0 ? (
        <div className="admin-surface p-8 text-center">
          <p className="text-[var(--admin-text-muted)] font-admin-body">
            No version history found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(entry => (
            <div key={entry.id} className="admin-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`admin-badge text-xs ${
                    entry.action === 'create' ? 'admin-badge-success' :
                    entry.action === 'update' ? 'admin-badge-info' :
                    'admin-badge-error'
                  }`}>
                    {entry.action}
                  </span>
                  <span className="font-admin-mono text-xs text-[var(--admin-text-muted)]">
                    {entry.collection?.replace('cms', '')}
                  </span>
                  {entry.field && (
                    <span className="font-admin-body text-sm text-admin-teal">
                      → {entry.field}
                    </span>
                  )}
                </div>
                <span className="font-admin-mono text-xs text-[var(--admin-text-muted)]">
                  {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown'}
                </span>
              </div>
              <p className="font-admin-body text-sm text-[var(--admin-text-muted)]">
                by {entry.userEmail || 'Unknown'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// PUBLISH QUEUE
// ============================================================================
function CMSPublishQueue({ currentUser, pendingChanges, onPublish, isPublishing }) {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState(null)

  // Sync all CMS collections to Airtable
  const handleSyncToAirtable = async () => {
    setIsSyncing(true)
    setSyncResults(null)
    const results = { content: null, schedule: null, organizations: null, timeline: null }

    try {
      const token = await currentUser.getIdToken()
      const collections = ['cmsContent', 'cmsSchedule', 'cmsOrganizations', 'cmsTimeline']

      for (const collection of collections) {
        try {
          const response = await fetch(`${FUNCTIONS_URL}/syncCMSToAirtable`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collection })
          })

          const data = await response.json()
          const key = collection.replace('cms', '').toLowerCase()
          results[key] = response.ok ? data : { error: data.error }
        } catch (err) {
          const key = collection.replace('cms', '').toLowerCase()
          results[key] = { error: err.message }
        }
      }

      setSyncResults(results)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncResults({ error: error.message })
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    async function fetchQueue() {
      try {
        const token = await currentUser.getIdToken()
        const response = await fetch(`${FUNCTIONS_URL}/cmsGetPublishQueue`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) throw new Error('Failed to fetch queue')

        const data = await response.json()
        setQueue(data.queue || [])
      } catch (error) {
        console.error('Error fetching queue:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchQueue()

    // Refresh every 10 seconds if something is publishing
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [currentUser])

  return (
    <div className="space-y-6">
      {/* Pending changes */}
      <div className="admin-surface p-6">
        <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)] mb-4">
          Pending changes
        </h3>
        {pendingChanges.length === 0 ? (
          <p className="text-[var(--admin-text-muted)] font-admin-body">
            No pending changes. All content is up to date.
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {pendingChanges.map((change, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg admin-glass">
                <span className={`admin-badge text-xs ${
                  change.action === 'create' ? 'admin-badge-success' :
                  change.action === 'update' ? 'admin-badge-info' :
                  'admin-badge-error'
                }`}>
                  {change.action}
                </span>
                <span className="font-admin-mono text-xs text-[var(--admin-text-muted)]">
                  {change.collection?.replace('cms', '')}
                </span>
                <span className="font-admin-body text-sm text-[var(--admin-text)]">
                  {change.field}
                </span>
              </div>
            ))}
          </div>
        )}
        {pendingChanges.length > 0 && (
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 bg-admin-teal text-white rounded-lg hover:bg-admin-teal/80 disabled:opacity-50 transition-all font-admin-body"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isPublishing ? 'Publishing...' : 'Publish all changes'}
          </button>
        )}
      </div>

      {/* Recent publishes */}
      <div className="admin-surface p-6">
        <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)] mb-4">
          Recent publishes
        </h3>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-admin-teal" />
          </div>
        ) : queue.length === 0 ? (
          <p className="text-[var(--admin-text-muted)] font-admin-body">
            No publish history yet
          </p>
        ) : (
          <div className="space-y-3">
            {queue.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl admin-glass">
                {item.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-admin-emerald flex-shrink-0" />
                ) : item.status === 'failed' ? (
                  <AlertCircle className="w-5 h-5 text-admin-rose flex-shrink-0" />
                ) : item.status === 'publishing' ? (
                  <Loader2 className="w-5 h-5 text-admin-amber animate-spin flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-[var(--admin-text-muted)] flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-admin-body text-sm text-[var(--admin-text)]">
                    {item.changes?.length || 0} change{item.changes?.length !== 1 ? 's' : ''} published
                  </p>
                  <p className="font-admin-mono text-xs text-[var(--admin-text-muted)]">
                    {item.triggeredAt ? new Date(item.triggeredAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <span className={`admin-badge ${
                  item.status === 'success' ? 'admin-badge-success' :
                  item.status === 'failed' ? 'admin-badge-error' :
                  item.status === 'publishing' ? 'admin-badge-warning' :
                  'admin-badge-info'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="admin-surface p-6">
        <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)] mb-4">
          How publishing works
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl admin-glass text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-admin-teal/20 flex items-center justify-center">
              <span className="font-admin-mono text-admin-teal font-bold">1</span>
            </div>
            <p className="font-admin-body text-sm text-[var(--admin-text)]">Edit content in this CMS</p>
          </div>
          <div className="p-4 rounded-xl admin-glass text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-admin-teal/20 flex items-center justify-center">
              <span className="font-admin-mono text-admin-teal font-bold">2</span>
            </div>
            <p className="font-admin-body text-sm text-[var(--admin-text)]">Click "Publish" button</p>
          </div>
          <div className="p-4 rounded-xl admin-glass text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-admin-teal/20 flex items-center justify-center">
              <span className="font-admin-mono text-admin-teal font-bold">3</span>
            </div>
            <p className="font-admin-body text-sm text-[var(--admin-text)]">GitHub Actions builds site</p>
          </div>
          <div className="p-4 rounded-xl admin-glass text-center">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-admin-teal/20 flex items-center justify-center">
              <span className="font-admin-mono text-admin-teal font-bold">4</span>
            </div>
            <p className="font-admin-body text-sm text-[var(--admin-text)]">Live in ~60 seconds</p>
          </div>
        </div>
      </div>

      {/* Airtable sync */}
      <div className="admin-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-admin-heading text-lg font-semibold text-[var(--admin-text)]">
              Sync to Airtable
            </h3>
            <p className="font-admin-body text-sm text-[var(--admin-text-muted)] mt-1">
              Push CMS content back to Airtable for backup and visibility
            </p>
          </div>
          <button
            onClick={handleSyncToAirtable}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-admin-amber text-white rounded-lg hover:bg-admin-amber/80 disabled:opacity-50 transition-all font-admin-body"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync all to Airtable'}
          </button>
        </div>

        {/* Sync results */}
        {syncResults && (
          <div className="space-y-2 mt-4">
            {syncResults.error ? (
              <div className="p-3 rounded-lg bg-admin-rose/10 border border-admin-rose/20">
                <div className="flex items-center gap-2 text-admin-rose">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-admin-body text-sm">{syncResults.error}</span>
                </div>
              </div>
            ) : (
              <>
                {Object.entries(syncResults).map(([key, result]) => (
                  result && (
                    <div
                      key={key}
                      className={`p-3 rounded-lg ${
                        result.error
                          ? 'bg-admin-rose/10 border border-admin-rose/20'
                          : 'bg-admin-emerald/10 border border-admin-emerald/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-admin-body text-sm text-[var(--admin-text)] capitalize">
                          {key}
                        </span>
                        {result.error ? (
                          <span className="font-admin-mono text-xs text-admin-rose">{result.error}</span>
                        ) : (
                          <span className="font-admin-mono text-xs text-admin-emerald">
                            {result.created} created, {result.updated} updated
                          </span>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </>
            )}
          </div>
        )}

        <p className="font-admin-body text-xs text-[var(--admin-text-muted)] mt-4">
          Note: This syncs Site content, Schedule, Organizations, and Timeline to their respective Airtable tables.
          Logo images are not synced (they remain in Firebase Storage).
        </p>
      </div>
    </div>
  )
}
