## Implementation Plan

### Phase 1: Dashboard Shell Infrastructure

#### Task 1.1: Create Dashboard Layout Shell
**Start:** Current (protected) layout exists  
**End:** New dashboard shell with right-side tab navigation  
**Test:** Can navigate between placeholder tabs, layout renders correctly  
**Focus:** Navigation infrastructure  
**Files:** 
- `apps/web/src/app/(protected)/dash/layout.tsx` - Main dashboard shell
- `apps/web/src/components/navigation/TabNavigation.tsx` - Right-side tab rail
- `apps/web/src/components/navigation/TabButton.tsx` - Individual tab button

**Failure Modes:** Tab state desync, navigation accessibility issues  
**Instrumentation:** Console logs for tab switches, error boundaries per tab  

#### Task 1.2: Create Module Loading Infrastructure
**Start:** Dashboard shell exists  
**End:** Dynamic module loading system with loading states  
**Test:** Modules load on demand, show proper loading/error states  
**Focus:** Code splitting and performance  
**Files:**
- `apps/web/src/lib/module-loader.ts` - Dynamic import wrapper
- `apps/web/src/components/modules/ModuleContainer.tsx` - Module wrapper with suspense
- `apps/web/src/hooks/useModuleLoader.ts` - Module loading state management

**Failure Modes:** Module loading failures, memory leaks from unloaded modules  
**Instrumentation:** Loading time metrics, module load success/failure tracking  

#### Task 1.3: Setup Global Dashboard State
**Start:** Module loading infrastructure exists  
**End:** Zustand store for dashboard-wide state management  
**Test:** Can share state between modules, state persists across tab switches  
**Focus:** State management  
**Files:**
- `apps/web/src/store/dashboard.ts` - Dashboard state slice
- `apps/web/src/hooks/useDashboard.ts` - Dashboard state hook
- `apps/web/src/types/dashboard.ts` - Dashboard type definitions

**Failure Modes:** State corruption, memory leaks, hydration mismatches  
**Instrumentation:** State change logging, hydration error tracking  

### Phase 2: Dashboard Module Implementation

#### Task 2.1: Create Dashboard API Endpoints
**Start:** Global state setup complete  
**End:** API routes for dashboard KPIs  
**Test:** Endpoints return correct data, handle errors gracefully  
**Focus:** Data layer for dashboard widgets  
**Files:**
- `apps/web/src/app/api/dashboard/stats/route.ts` - Life event statistics
- `apps/web/src/app/api/dashboard/range/route.ts` - Timeline date range
- `apps/web/src/app/api/dashboard/categories/route.ts` - Category breakdown

**Failure Modes:** Database query failures, slow query performance  
**Instrumentation:** Query execution time, error rates per endpoint  

#### Task 2.2: Create Dashboard Widget Components
**Start:** API endpoints exist  
**End:** Reusable KPI widgets for dashboard  
**Test:** Widgets display data correctly, handle loading/error states  
**Focus:** Dashboard UI components  
**Files:**
- `apps/web/src/components/dashboard/KPICard.tsx` - Basic KPI display
- `apps/web/src/components/dashboard/DurationWidget.tsx` - Timeline duration display
- `apps/web/src/components/dashboard/CategoryChart.tsx` - Category breakdown visualization

**Failure Modes:** Data visualization errors, responsive layout issues  
**Instrumentation:** Widget render success tracking, user interaction metrics  

#### Task 2.3: Create Dashboard Module Page
**Start:** Widget components exist  
**End:** Complete dashboard module with all KPI widgets  
**Test:** Dashboard shows user statistics, updates in real-time  
**Focus:** Dashboard module integration  
**Files:**
- page.tsx - Main dashboard page
- `apps/web/src/hooks/useDashboardData.ts` - Dashboard data fetching

**Failure Modes:** Real-time update failures, data staleness  
**Instrumentation:** Data freshness tracking, real-time connection status  

### Phase 3: Timeline Module Migration

#### Task 3.1: Extract Timeline into Module Structure
**Start:** Dashboard module complete, existing timeline working  
**End:** Timeline refactored as loadable module  
**Test:** Timeline functionality preserved, loads within dashboard shell  
**Focus:** Module migration without breaking changes  
**Files:**
- page.tsx - Timeline module entry
- `apps/web/src/modules/timeline/TimelineModule.tsx` - Extracted timeline component
- Migration of existing timeline components to module structure

**Failure Modes:** Timeline functionality regression, routing conflicts  
**Instrumentation:** Timeline action success rates, performance comparison  

#### Task 3.2: Update Timeline Navigation
**Start:** Timeline extracted as module  
**End:** Timeline accessible via dashboard tab navigation  
**Test:** Can switch between dashboard and timeline, state preserved  
**Focus:** Navigation integration  
**Files:**
- Updated tab navigation configuration
- Route updates for new timeline path

**Failure Modes:** Deep linking issues, browser history problems  
**Instrumentation:** Navigation success tracking, route resolution metrics  

### Phase 4: Placeholder Modules

#### Task 4.1: Create Chat Module Placeholder
**Start:** Timeline migration complete  
**End:** Chat module with "coming soon" interface  
**Test:** Chat tab loads, shows proper placeholder content  
**Focus:** Module scaffold for future development  
**Files:**
- page.tsx - Chat placeholder
- `apps/web/src/modules/chat/ChatPlaceholder.tsx` - Placeholder component

**Failure Modes:** Placeholder rendering issues  
**Instrumentation:** Module access tracking for future prioritization  

#### Task 4.2: Create Contact Module Placeholder
**Start:** Chat placeholder exists  
**End:** Contact module with form preview  
**Test:** Contact tab loads, shows contact form preview  
**Focus:** Contact module scaffold  
**Files:**
- page.tsx - Contact placeholder
- `apps/web/src/modules/contact/ContactPlaceholder.tsx` - Contact form preview

**Failure Modes:** Form submission handling in placeholder mode  
**Instrumentation:** User engagement with placeholder features  

#### Task 4.3: Create View Module Placeholder
**Start:** Contact placeholder exists  
**End:** View configurator module preview  
**Test:** View tab loads, shows configurator preview  
**Focus:** View module scaffold  
**Files:**
- page.tsx - View placeholder
- `apps/web/src/modules/view/ViewPlaceholder.tsx` - Configurator preview

**Failure Modes:** Preview interface confusion  
**Instrumentation:** Feature request tracking from preview interactions  

### Phase 5: Navigation and UX Enhancement

#### Task 5.1: Implement Tab State Persistence
**Start:** All modules have placeholder/working implementations  
**End:** Tab selection persists across browser sessions  
**Test:** Returns to last active tab on refresh  
**Focus:** User experience improvement  
**Files:**
- Enhanced dashboard state with persistence
- Local storage integration for tab state

**Failure Modes:** Storage quota exceeded, state corruption  
**Instrumentation:** State persistence success rates  

#### Task 5.2: Add Keyboard Navigation
**Start:** Tab persistence working  
**End:** Full keyboard navigation support for tabs  
**Test:** Can navigate tabs with keyboard, proper focus management  
**Focus:** Accessibility compliance  
**Files:**
- Enhanced TabNavigation component with keyboard handlers
- Focus management utilities

**Failure Modes:** Focus trap issues, screen reader compatibility  
**Instrumentation:** Accessibility audit compliance tracking  

#### Task 5.3: Add Loading and Error States
**Start:** Keyboard navigation complete  
**End:** Comprehensive loading and error states across all modules  
**Test:** Graceful handling of all failure scenarios  
**Focus:** Error resilience  
**Files:**
- Error boundary components per module
- Loading state components
- Error recovery mechanisms

**Failure Modes:** Error boundary infinite loops, loading state stuck  
**Instrumentation:** Error recovery success rates, user retry behavior  

### Phase 6: Integration and Testing

#### Task 6.1: End-to-End Integration Testing
**Start:** All modules and navigation complete  
**End:** Comprehensive test suite for dashboard functionality  
**Test:** All user flows work correctly, performance acceptable  
**Focus:** System integration validation  
**Files:**
- Integration test files for dashboard flows
- Performance benchmarks

**Failure Modes:** Test flakiness, performance regressions  
**Instrumentation:** Test execution metrics, performance budgets  

#### Task 6.2: Migration Path for Existing Users
**Start:** Integration testing complete  
**End:** Seamless migration from old timeline to new dashboard  
**Test:** Existing users automatically redirected to new interface  
**Focus:** Backward compatibility  
**Files:**
- Redirect rules from old routes
- Migration tracking

**Failure Modes:** Lost user data during migration, broken bookmarks  
**Instrumentation:** Migration success tracking, user feedback collection  

## Preventive Architecture Considerations

### Failure Catalogue
1. **Module Loading Failures:** Implement retry logic and fallback to basic timeline
2. **State Corruption:** Version state schema, provide reset mechanism
3. **Navigation Deadlocks:** Ensure always-available home/dashboard fallback
4. **Performance Degradation:** Implement module unloading, memory cleanup
5. **API Timeout Issues:** Implement progressive data loading, cache strategies

### Non-Functional Goals
- **Tab Switch Performance:** < 100ms for cached modules
- **Module Load Time:** < 500ms on 3G connection
- **Memory Usage:** < 50MB additional overhead for dashboard shell
- **Accessibility:** WCAG 2.1 AA compliance for all navigation
- **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+

### Example-Driven Specs
```typescript
// Tab Navigation
expectTabSwitch('dashboard' → 'timeline'): completes in < 100ms
expectModuleLoad('chat'): shows loading state → placeholder content
expectKeyboardNav(['Tab', 'Arrow keys']): focuses correct elements

// Dashboard Data
expectDashboardStats(): returns {eventCount: number, dateRange: [Date, Date], categories: Record<string, number>}
expectRealTimeUpdate(): dashboard reflects new timeline events within 1s
```