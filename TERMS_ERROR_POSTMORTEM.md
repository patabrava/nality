# Post-Mortem: Terms Acceptance Error.message Undefined

## Issue Summary
**Date**: September 7, 2025  
**Duration**: Brief - Fixed immediately after identification  
**Severity**: Medium - Blocked terms acceptance functionality  

## Root Cause
Unsafe property access on `error.message` in the `recordTermsAcceptance` function. Supabase errors don't always have a `message` property, causing `TypeError: Cannot read property 'includes' of undefined` when attempting to call `error.message.includes('does not exist')`.

## Timeline
1. User accepted terms on terms page
2. `recordTermsAcceptance()` function called
3. Supabase returned error without `message` property  
4. Code attempted `error.message.includes()` on undefined
5. JavaScript threw TypeError, preventing localStorage fallback

## Fix Applied
Changed unsafe property access to use optional chaining:
```typescript
// Before (unsafe):
if (error.code === '42P01' || error.message.includes('does not exist'))

// After (safe):
if (error.code === '42P01' || error.message?.includes('does not exist'))
```

Applied to both instances in `checkTermsAcceptance()` and `recordTermsAcceptance()` functions.

## Lessons Learned
1. **Always use optional chaining** for error object properties that might not exist
2. **Supabase errors can have varying structures** - don't assume all properties exist
3. **Test error paths thoroughly** - happy path worked, error path failed

## Prevention
- Add ESLint rule to warn about unsafe optional property access
- Consider creating a helper function for safe error message checking
- Add unit tests for error handling scenarios

## Files Modified
- `/apps/web/src/lib/supabase/terms.ts` (lines 34 and 114)

## Testing
- ✅ Terms acceptance now works with localStorage fallback
- ✅ No more TypeError on error.message access
- ✅ Development server compiles without errors
- ✅ Terms → Dashboard redirect flow working
