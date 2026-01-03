# Cal.com Integration Fix

## Summary
Fixed the Cal.com booking integration to use the correct public URL: `https://app.cal.eu/nality`

## Changes Made

### 1. BookingModal.tsx
**File:** `/apps/web/src/components/booking/BookingModal.tsx`

#### Changes:
- **Cal.com Origin URL**: Updated from `https://app.cal.com` to `https://app.cal.eu`
- **Embed Configuration**: Enhanced with proper layout configuration:
  ```typescript
  {
    layout: 'month_view',
    theme: 'light'
  }
  ```
- **Data Attributes**: Added `data-cal-namespace=""` to the embed element
- **Initialization**: Added explicit UI initialization with branding colors
- **Fallback Links**: Updated all fallback URLs from `app.cal.com/nality` to `app.cal.eu/nality`

#### Key Technical Details:
```typescript
// Correct initialization
(window as any).Cal('init', {origin: 'https://app.cal.eu'})

// Explicit UI configuration
(window as any).Cal('ui', {
  styles: {branding: {brandColor: '#d4af37'}},
  hideEventTypeDetails: false,
  layout: 'month_view'
})
```

### 2. BookingIntegration.tsx
**File:** `/apps/web/src/components/booking/BookingIntegration.tsx`

#### Changes:
- **Default URLs**: Updated both `calendlyUrl` and `calcomUrl` defaults to `https://app.cal.eu/nality`

### 3. Embed Element Configuration
The inline embed element now has the correct attributes:
```tsx
<div 
  id="calendly-embed" 
  className="calendly-inline-widget"
  data-cal-link="nality"
  data-cal-namespace=""
  data-cal-config={JSON.stringify({
    layout: 'month_view',
    theme: 'light'
  })}
  style={{ 
    minWidth: '320px', 
    height: '600px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  }}
/>
```

## How It Works

1. **Consent Check**: The booking modal respects user consent preferences
2. **Script Loading**: Dynamically loads Cal.com embed script from CDN (`https://app.cal.com/embed/embed.js`)
3. **Initialization**: Initializes with correct origin (`https://app.cal.eu`)
4. **Embed Rendering**: Uses the `nality` booking link on the Cal.eu instance
5. **Fallback**: Provides direct links if embed fails

## Testing

✅ Build successful - no TypeScript errors
✅ All booking components updated with correct URLs
✅ Consent flow properly integrated
✅ Error handling with fallback links

## User Experience

1. User clicks "Book Your Free Discovery Call" button
2. Modal opens with consent request (if not already granted)
3. User grants consent for external services
4. Cal.com embed loads with the `nality` calendar
5. User can book directly in the modal
6. If embed fails, fallback link to `https://app.cal.eu/nality` is provided

## Important Notes

- **CDN URL**: The script CDN remains `app.cal.com/embed/embed.js` (this is correct)
- **Origin URL**: The origin for initialization is `app.cal.eu` (this is the custom instance)
- **Link**: The booking link is simply `nality` (Cal.com automatically uses the origin)
- **Branding**: Gold color (#d4af37) matches the Nality brand

## Files Modified

1. `/apps/web/src/components/booking/BookingModal.tsx`
2. `/apps/web/src/components/booking/BookingIntegration.tsx`

## No Breaking Changes

All changes follow the CODE_EXPANSION guidelines:
- Preserved all working functionality
- Enhanced Cal.com initialization
- Improved error handling
- Updated URLs to correct values
- Maintained existing component interfaces
