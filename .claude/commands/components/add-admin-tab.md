---
allowed-tools: Read, Edit, Grep, Glob
argument-hint: <tab-name>
description: Add a new tab to the Admin panel following existing 10-tab structure
---

# Add Admin Tab

Add a new tab to `src/pages/Admin.jsx`.

**Argument:** $1 = tab name (lowercase, e.g., "reports", "emails")

## Admin Structure

The Admin panel has 10 existing tabs:
1. dashboard - Stats overview
2. settings - Configuration
3. broadcast - Announcements
4. attendees - User management
5. sessions - Session analytics
6. activity - User action logs
7. errors - System errors
8. jobs - Background tasks
9. admins - Role management
10. audit - Admin action trail

## Adding a New Tab

### 1. Add to tabs array (around line 150)
```jsx
const tabs = [
  // ... existing tabs
  { id: '$1', label: 'Tab Label', icon: IconComponent },
];
```

### 2. Add render function
```jsx
const render$1Tab = () => (
  <div className="space-y-6">
    <h2 className="font-admin-heading text-2xl font-bold text-admin-ink dark:text-white">
      Tab Title
    </h2>

    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className={cardClass}>
        <div className="text-3xl font-bold text-admin-teal">123</div>
        <div className="text-sm text-gray-500">Metric Label</div>
      </div>
    </div>

    {/* Main content */}
    <div className={cardClass}>
      {/* ... */}
    </div>
  </div>
);
```

### 3. Add to renderTabContent switch
```jsx
case '$1':
  return render$1Tab();
```

## Admin Styling Classes

```jsx
// Card container
const cardClass = `rounded-lg border ${
  theme === 'ink'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200'
} p-6`;

// Button styles
const buttonClass = `px-4 py-2 rounded-lg font-medium ${
  theme === 'ink'
    ? 'bg-admin-teal text-white hover:bg-admin-teal/90'
    : 'bg-brand-teal text-white hover:bg-brand-teal-dark'
}`;
```

## Data Fetching Pattern

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await apiCall(
        'https://us-central1-cjs2026.cloudfunctions.net/endpointName',
        currentUser
      );
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [currentUser]);
```

## Admin-Only Cloud Function Call

```jsx
const apiCall = async (endpoint, currentUser, options = {}) => {
  const token = await currentUser.getIdToken();
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};
```
