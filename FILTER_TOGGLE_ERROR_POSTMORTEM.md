# Filter Toggle Error Post-Mortem: Router Update During Render

**Date**: October 24, 2025  
**Incident**: React error when clicking "Filters & Sort" button  
**Status**: ✅ RESOLVED

## Problem Summary

Users encountered a React error when clicking the "Filters & Sort" toggle button:
```
Cannot update a component (`Router`) while rendering a different component (`TimelineFilters`). 
To locate the bad setState() call inside `TimelineFilters`, follow the stack trace...
```

## Root Cause Analysis

**Primary Cause**: Synchronous router navigation during React render cycle.

**Technical Details**:
1. User clicks "Filters & Sort" button
2. `toggleVisibility()` function is called
3. `setFilterState()` updates component state synchronously
4. The state update callback immediately calls `updateURL()`
5. `updateURL()` calls `router.replace()` during the render cycle
6. React throws error because Router component is being updated while TimelineFilters is rendering

**Error Pattern**: This is a classic React anti-pattern where side effects (router navigation) occur during render instead of being deferred to effects or event handlers.

## Technical Root Cause

The issue was in `/src/hooks/useTimelineFilters.ts` where the `updateURL` function was being called synchronously within state update callbacks:

```typescript
// PROBLEMATIC CODE:
const toggleVisibility = useCallback(() => {
  setFilterState(prev => {
    const newState = { ...prev, isVisible: !prev.isVisible }
    updateURL(newState) // ❌ Router update during render!
    return newState
  })
}, [updateURL])
```

## Resolution

Applied **CODE_EXPANSION** principles to implement minimal changes that preserve all existing functionality:

### 1. Deferred URL Updates
- Introduced `pendingURLUpdate` state to track URL changes that need to be applied
- Created `scheduleURLUpdate()` function to queue URL updates instead of executing them immediately
- Added `useEffect` to process pending URL updates after render completion

### 2. Separation of Concerns
- Separated synchronous state updates from asynchronous side effects
- Maintained the same external API for the hook
- Preserved all existing filter functionality

### 3. React Best Practices
- URL updates now happen in effects, not during render
- Eliminated render-time side effects
- Maintained proper React component lifecycle

## Code Changes

**File Modified**: `/src/hooks/useTimelineFilters.ts`

**Key Changes**:
```typescript
// Before: Immediate URL update (caused error)
const updateURL = useCallback((newState: FilterState) => {
  // ... URL building logic
  router.replace(newURL, { scroll: false }) // ❌ During render
}, [router])

// After: Deferred URL update (safe)
const scheduleURLUpdate = useCallback((newState: FilterState) => {
  setPendingURLUpdate(newState) // ✅ Schedule for later
}, [])

// Process pending updates in effect
useEffect(() => {
  if (pendingURLUpdate) {
    // ... URL building logic
    router.replace(newURL, { scroll: false }) // ✅ After render
    setPendingURLUpdate(null)
  }
}, [pendingURLUpdate, router])
```

## Resolution Strategy

**MONOCODE Systematic Isolation**: 
- Identified exact call stack: toggleVisibility → setFilterState → updateURL → router.replace
- Located timing issue: router.replace happening during render cycle
- Isolated working parts: state management worked fine, only URL sync had timing issue

**Hypothesis-Driven Fixing**:
- Hypothesis: Router updates need to be deferred from render cycle
- Solution: Use useEffect to handle URL updates after state changes
- Validation: No more render-time side effects

**Minimal Changes Applied**:
- Added `pendingURLUpdate` state (1 new state variable)
- Renamed `updateURL` to `scheduleURLUpdate` (function rename)
- Added `useEffect` for processing pending updates (1 new effect)
- Updated all callback dependencies (dependency array updates)

## Prevention Measures

1. **Side Effect Guidelines**: Always use useEffect for router navigation and other side effects
2. **Render Purity**: Never call external APIs or navigation during render
3. **State Update Patterns**: Separate state updates from side effects
4. **Testing Strategy**: Test user interactions that trigger multiple state changes

## Lessons Learned

1. **React Patterns**: Router navigation is a side effect and must be handled in effects
2. **Timing Matters**: Understanding React's render cycle is crucial for avoiding timing issues
3. **CODE_EXPANSION Value**: Small, focused changes can resolve complex timing issues without breaking functionality
4. **Error Messages**: React's error messages provide clear guidance on the problem location

## Verification

✅ "Filters & Sort" button works without console errors  
✅ URL updates correctly reflect filter state changes  
✅ All filter functionality preserved (topics, keywords, dates, sorting)  
✅ Browser history and URL sharing work correctly  
✅ No breaking changes to existing timeline features  

## Impact Assessment

- **Before**: React error on every filter toggle, potentially breaking user experience
- **After**: Smooth filter toggling with proper URL synchronization
- **Performance**: Negligible impact, actually cleaner with proper effect usage
- **Backward Compatibility**: ✅ Full compatibility maintained
- **User Experience**: ✅ Seamless operation, no visible changes to user
