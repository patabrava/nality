# Filter Removal Bug Post-Mortem

## Issue Summary
**Problem**: Clicking the "x" button on filter chips was not removing the active filters from the timeline filtering system.

**Root Cause**: The `parseFiltersFromURL` effect in `useTimelineFilters` hook was overriding filter removal actions due to URL state synchronization timing issues.

**Resolution**: Added `isInitialized` state to prevent URL parsing from re-initializing filters after user-initiated changes.

## Timeline
- **Discovery**: User reported that filter removal via "x" buttons was not working
- **Investigation**: Systematic isolation revealed FilterChips component was calling removal functions correctly
- **Root Cause**: URL synchronization effect was overriding state changes when URL updates occurred
- **Fix Applied**: Added initialization guard to prevent URL parsing override

## Technical Details

### Problem Analysis
1. FilterChips component was correctly calling removal functions (`removeTopicFilter`, `clearKeywords`, etc.)
2. The removal functions were updating state correctly
3. However, the `parseFiltersFromURL` effect had `router.asPath` as a dependency
4. When filters were removed, the URL was updated, triggering the parsing effect
5. This caused the filters to be re-initialized from the URL state

### Code Changes

**File**: `apps/web/src/hooks/useTimelineFilters.ts`

**Before**:
```typescript
useEffect(() => {
  const urlFilters = parseFiltersFromURL(searchParams);
  setTopicFilters(urlFilters.topicFilters);
  setKeywordFilter(urlFilters.keywordFilter);
  setDateRange(urlFilters.dateRange);
  setSortBy(urlFilters.sortBy);
  setSortOrder(urlFilters.sortOrder);
}, [searchParams]);
```

**After**:
```typescript
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  if (!isInitialized) {
    const urlFilters = parseFiltersFromURL(searchParams);
    setTopicFilters(urlFilters.topicFilters);
    setKeywordFilter(urlFilters.keywordFilter);
    setDateRange(urlFilters.dateRange);
    setSortBy(urlFilters.sortBy);
    setSortOrder(urlFilters.sortOrder);
    setIsInitialized(true);
  }
}, [searchParams, isInitialized]);
```

### Impact
- **Before**: Filter removal appeared to work momentarily but filters were immediately restored
- **After**: Filter removal works correctly and persists as expected
- **URL State**: Still properly synchronized but doesn't override user actions

## Prevention Strategies
1. **State Management**: Consider timing of URL synchronization effects
2. **Initialization Guards**: Use initialization flags for URL-based state restoration
3. **React Patterns**: Be mindful of effect dependencies that can cause unexpected re-runs
4. **Testing**: Test filter removal in addition to filter application

## Validation
- ✅ Filter chips can be removed by clicking "x" buttons
- ✅ URL updates correctly when filters are removed
- ✅ No console errors during filter operations
- ✅ Filter state persists correctly across page interactions

## Related Issues
- Builds on previous fixes for Router update during render
- Part of comprehensive timeline filtering system implementation
- Demonstrates importance of careful state management in URL-synchronized components
