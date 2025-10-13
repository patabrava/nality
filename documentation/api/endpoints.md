# API Endpoints Documentation

*Comprehensive API reference for Nality backend services*

---

## 🌐 **API Overview**

The Nality API provides a comprehensive REST interface for managing user timelines, life events, media uploads, and AI-powered features. Built on Supabase with custom Edge Functions, the API emphasizes security, performance, and developer experience.

### **API Architecture**

```mermaid
graph TD
    A[Client Applications] --> B[API Gateway]
    B --> C[Authentication Layer]
    C --> D[Edge Functions]
    C --> E[PostgreSQL Database]
    C --> F[Storage Service]
    C --> G[AI Services]
    
    subgraph "Supabase Infrastructure"
        H[PostgREST API]
        I[Row Level Security]
        J[Real-time Subscriptions]
        K[Storage CDN]
    end
    
    D --> H
    E --> I
    E --> J
    F --> K
    
    subgraph "External Services"
        L[OpenAI API]
        M[Email Service]
        N[Analytics Service]
    end
    
    G --> L
    D --> M
    D --> N
```

### **Base Configuration**

```typescript
// API Configuration
const API_CONFIG = {
  baseURL: 'https://your-project.supabase.co',
  apiKey: 'your-anon-key',
  version: 'v1',
  timeout: 30000,
  retryAttempts: 3
};

// Request Headers
const defaultHeaders = {
  'Content-Type': 'application/json',
  'apikey': API_CONFIG.apiKey,
  'Authorization': `Bearer ${userToken}`,
  'X-Client-Version': '1.0.0'
};
```

---

## 🔐 **Authentication Endpoints**

### **Magic Link Authentication**

**Request Magic Link**
```http
POST /auth/v1/magiclink
Content-Type: application/json

{
  "email": "user@example.com",
  "options": {
    "redirectTo": "https://app.nality.com/auth/callback"
  }
}
```

**Response:**
```json
{
  "message": "Magic link sent to your email"
}
```

**Verify Magic Link**
```http
GET /auth/v1/verify?token=magic_link_token&type=magiclink
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### **Session Management**

**Get Current User**
```http
GET /auth/v1/user
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "user_metadata": {
    "display_name": "John Doe",
    "avatar_url": "https://storage.googleapis.com/..."
  },
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Refresh Token**
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

**Logout**
```http
POST /auth/v1/logout
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

## 👤 **User Management Endpoints**

### **User Profile Operations**

**Get User Profile**
```http
GET /rest/v1/users?id=eq.{user_id}
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "user-uuid",
  "display_name": "John Doe",
  "bio": "Capturing life's precious moments",
  "avatar_url": "https://storage.example.com/avatars/user.jpg",
  "birth_date": "1990-05-15",
  "location": "San Francisco, CA",
  "privacy_settings": {
    "timeline_visibility": "private",
    "allow_search": false,
    "show_birth_date": true
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:15:00Z"
}
```

**Update User Profile**
```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "display_name": "John Smith",
  "bio": "Updated biography",
  "location": "New York, NY",
  "privacy_settings": {
    "timeline_visibility": "friends",
    "allow_search": true
  }
}
```

**Upload Avatar**
```http
POST /storage/v1/object/avatars/{user_id}/{filename}
Authorization: Bearer {access_token}
Content-Type: image/jpeg

[Binary image data]
```

**Response:**
```json
{
  "Key": "avatars/user-uuid/avatar.jpg",
  "id": "storage-uuid",
  "fullPath": "avatars/user-uuid/avatar.jpg",
  "path": "user-uuid/avatar.jpg"
}
```

---

## 📅 **Life Events Endpoints**

### **Event Management**

**List User Events**
```http
GET /rest/v1/life_events?user_id=eq.{user_id}&order=start_date.desc
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit`: Number of events to return (default: 50, max: 100)
- `offset`: Pagination offset
- `start_date.gte`: Filter events after date
- `start_date.lte`: Filter events before date
- `category.eq`: Filter by category
- `importance.gte`: Filter by minimum importance

**Response:**
```json
[
  {
    "id": "event-uuid",
    "user_id": "user-uuid",
    "title": "College Graduation",
    "description": "Graduated with honors from Stanford University",
    "start_date": "2019-06-15",
    "end_date": null,
    "location": "Stanford, CA",
    "category": "education",
    "importance": 9,
    "tags": ["education", "achievement", "milestone"],
    "privacy_level": "private",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "media_objects": [
      {
        "id": "media-uuid",
        "type": "image",
        "url": "https://storage.example.com/media/graduation.jpg",
        "thumbnail_url": "https://storage.example.com/media/thumbnails/graduation.jpg"
      }
    ]
  }
]
```

**Create Life Event**
```http
POST /rest/v1/life_events
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "First Day at New Job",
  "description": "Started my dream job as a software engineer",
  "start_date": "2024-02-01",
  "location": "San Francisco, CA",
  "category": "career",
  "importance": 8,
  "tags": ["career", "new-beginning", "software"],
  "privacy_level": "private"
}
```

**Response:**
```json
{
  "id": "new-event-uuid",
  "user_id": "user-uuid",
  "title": "First Day at New Job",
  "description": "Started my dream job as a software engineer",
  "start_date": "2024-02-01",
  "end_date": null,
  "location": "San Francisco, CA",
  "category": "career",
  "importance": 8,
  "tags": ["career", "new-beginning", "software"],
  "privacy_level": "private",
  "created_at": "2024-01-20T09:00:00Z",
  "updated_at": "2024-01-20T09:00:00Z"
}
```

**Update Life Event**
```http
PATCH /rest/v1/life_events?id=eq.{event_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Updated Event Title",
  "importance": 7,
  "tags": ["updated", "modified"]
}
```

**Delete Life Event**
```http
DELETE /rest/v1/life_events?id=eq.{event_id}
Authorization: Bearer {access_token}
```

### **Event Search and Filtering**

**Full-Text Search**
```http
GET /rest/v1/life_events?user_id=eq.{user_id}&or=(title.ilike.*graduation*,description.ilike.*graduation*)
Authorization: Bearer {access_token}
```

**Advanced Filtering**
```http
GET /rest/v1/life_events?user_id=eq.{user_id}&start_date.gte.2020-01-01&start_date.lte.2023-12-31&category.in.(education,career)&importance.gte.7
Authorization: Bearer {access_token}
```

**Get Events by Date Range**
```http
GET /rest/v1/life_events?user_id=eq.{user_id}&start_date.gte.2024-01-01&start_date.lte.2024-12-31&order=start_date.asc
Authorization: Bearer {access_token}
```

---

## 🎭 **Media Management Endpoints**

### **Media Upload and Storage**

**Upload Media File**
```http
POST /storage/v1/object/user-media/{user_id}/{filename}
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [Binary file data]
```

**Response:**
```json
{
  "Key": "user-media/user-uuid/photo.jpg",
  "id": "storage-uuid",
  "fullPath": "user-media/user-uuid/photo.jpg"
}
```

**Create Media Object Record**
```http
POST /rest/v1/media_objects
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "user-uuid",
  "life_event_id": "event-uuid",
  "storage_path": "user-media/user-uuid/photo.jpg",
  "file_name": "graduation-photo.jpg",
  "file_size": 2048576,
  "mime_type": "image/jpeg",
  "media_type": "image",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "camera_make": "Apple",
    "camera_model": "iPhone 13"
  }
}
```

**Get Media Object**
```http
GET /rest/v1/media_objects?id=eq.{media_id}
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "media-uuid",
  "user_id": "user-uuid",
  "life_event_id": "event-uuid",
  "storage_path": "user-media/user-uuid/photo.jpg",
  "file_name": "graduation-photo.jpg",
  "file_size": 2048576,
  "mime_type": "image/jpeg",
  "media_type": "image",
  "thumbnail_path": "thumbnails/user-uuid/photo_thumb.jpg",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "duration": null,
    "camera_make": "Apple",
    "camera_model": "iPhone 13",
    "taken_at": "2019-06-15T14:30:00Z"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Get Media File URL**
```http
POST /storage/v1/object/sign/user-media/{user_id}/{filename}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "signedURL": "https://storage.example.com/user-media/file.jpg?token=signed_token"
}
```

### **Media Processing**

**Generate Thumbnail**
```http
POST /functions/v1/generate-thumbnail
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "media_id": "media-uuid",
  "size": "medium"
}
```

**Response:**
```json
{
  "thumbnail_path": "thumbnails/user-uuid/photo_medium.jpg",
  "status": "completed"
}
```

**Extract Media Metadata**
```http
POST /functions/v1/extract-metadata
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "media_id": "media-uuid"
}
```

**Response:**
```json
{
  "metadata": {
    "width": 1920,
    "height": 1080,
    "camera_make": "Apple",
    "camera_model": "iPhone 13",
    "taken_at": "2019-06-15T14:30:00Z",
    "gps_latitude": 37.4419,
    "gps_longitude": -122.1430,
    "file_size": 2048576
  }
}
```

---

## 🤖 **AI Assistant Endpoints**

### **Chat and Conversation**

**Start Chat Session**
```http
POST /functions/v1/chat/sessions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "context": "timeline_exploration",
  "user_preferences": {
    "conversation_style": "casual",
    "focus_areas": ["family", "career"]
  }
}
```

**Response:**
```json
{
  "session_id": "chat-session-uuid",
  "status": "active",
  "context": "timeline_exploration",
  "created_at": "2024-01-20T10:00:00Z"
}
```

**Send Message**
```http
POST /functions/v1/chat/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "session_id": "chat-session-uuid",
  "message": "I want to add some memories from my college years",
  "message_type": "user_message"
}
```

**Response:**
```json
{
  "message_id": "message-uuid",
  "session_id": "chat-session-uuid",
  "content": "I'd love to help you capture those college memories! What's a specific moment from college that stands out to you?",
  "message_type": "assistant_response",
  "suggestions": [
    "Graduation ceremony",
    "First day of college",
    "Memorable professors",
    "College friendships"
  ],
  "created_at": "2024-01-20T10:01:00Z"
}
```

**Get Chat History**
```http
GET /rest/v1/chat_messages?session_id=eq.{session_id}&order=created_at.asc
Authorization: Bearer {access_token}
```

### **Story Extraction**

**Extract Events from Story**
```http
POST /functions/v1/ai/extract-events
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "text": "During my senior year of college in 2019, I was selected for the Dean's List and graduated summa cum laude. The graduation ceremony was on June 15th at Stanford Stadium. My whole family came to celebrate, and afterwards we had dinner at my favorite restaurant in Palo Alto.",
  "context": {
    "user_id": "user-uuid",
    "existing_events": ["event-uuid-1", "event-uuid-2"]
  }
}
```

**Response:**
```json
{
  "extracted_events": [
    {
      "title": "Dean's List Selection",
      "description": "Selected for the Dean's List during senior year",
      "start_date": "2019-05-01",
      "category": "education",
      "importance": 8,
      "tags": ["education", "achievement", "college"],
      "confidence": 0.92
    },
    {
      "title": "College Graduation",
      "description": "Graduated summa cum laude from Stanford University",
      "start_date": "2019-06-15",
      "location": "Stanford Stadium, Palo Alto",
      "category": "education",
      "importance": 10,
      "tags": ["education", "graduation", "milestone", "family"],
      "confidence": 0.98
    },
    {
      "title": "Family Graduation Celebration",
      "description": "Family dinner celebration after graduation ceremony",
      "start_date": "2019-06-15",
      "location": "Palo Alto",
      "category": "family",
      "importance": 7,
      "tags": ["family", "celebration", "graduation"],
      "confidence": 0.85
    }
  ],
  "processing_info": {
    "entities_extracted": 8,
    "dates_found": 2,
    "locations_found": 2,
    "people_mentioned": 1
  }
}
```

### **Memory Prompts**

**Get Memory Prompts**
```http
POST /functions/v1/ai/memory-prompts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "user-uuid",
  "prompt_type": "decade_exploration",
  "context": {
    "decade": "2010s",
    "existing_categories": ["education", "career"],
    "timeline_gaps": ["2015-2017"]
  }
}
```

**Response:**
```json
{
  "prompts": [
    {
      "id": "prompt-uuid-1",
      "type": "open_ended",
      "text": "What was a typical day like for you in 2016?",
      "context": "daily_life_exploration",
      "follow_up_questions": [
        "Where were you living at the time?",
        "What was your main focus during that period?",
        "Who were the important people in your life then?"
      ]
    },
    {
      "id": "prompt-uuid-2",
      "type": "specific_memory",
      "text": "I notice you don't have many events from 2015-2017. Can you tell me about any significant changes or transitions during that time?",
      "context": "gap_filling",
      "categories": ["personal", "career", "relationships"]
    }
  ],
  "conversation_starters": [
    "Let's explore your mid-2010s experiences",
    "Tell me about a challenge you overcame in 2016",
    "What were you most passionate about during that time?"
  ]
}
```

---

## 🔄 **Real-time Features**

### **WebSocket Connections**

**Connect to Real-time Updates**
```javascript
const supabase = createClient(API_CONFIG.baseURL, API_CONFIG.apiKey);

// Subscribe to timeline updates
const timelineSubscription = supabase
  .channel('timeline-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'life_events',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Timeline update:', payload);
  })
  .subscribe();

// Subscribe to chat messages
const chatSubscription = supabase
  .channel('chat-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

### **Live Data Synchronization**

**Timeline Live Updates**
```http
POST /rest/v1/rpc/subscribe_to_timeline_updates
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "user_id": "user-uuid",
  "subscription_type": "live_timeline"
}
```

**Chat Real-time Events**
```http
POST /rest/v1/rpc/subscribe_to_chat_session
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "session_id": "chat-session-uuid"
}
```

---

## 📊 **Analytics and Insights**

### **User Analytics**

**Get Timeline Statistics**
```http
GET /functions/v1/analytics/timeline-stats
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "total_events": 127,
  "events_by_year": {
    "2023": 45,
    "2022": 38,
    "2021": 31,
    "2020": 13
  },
  "events_by_category": {
    "personal": 42,
    "career": 28,
    "education": 21,
    "travel": 18,
    "family": 18
  },
  "media_statistics": {
    "total_photos": 89,
    "total_videos": 12,
    "total_documents": 6,
    "storage_used": 245760000
  },
  "timeline_coverage": {
    "earliest_event": "1995-08-15",
    "latest_event": "2024-01-20",
    "gaps": [
      {
        "start": "2008-01-01",
        "end": "2010-12-31",
        "duration_months": 36
      }
    ]
  }
}
```

**Get Activity Insights**
```http
GET /functions/v1/analytics/activity-insights
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "creation_patterns": {
    "most_active_day": "Sunday",
    "most_active_hour": 19,
    "weekly_pattern": [2, 3, 1, 2, 3, 4, 8],
    "monthly_trend": "increasing"
  },
  "engagement_metrics": {
    "average_session_duration": 18.5,
    "events_per_session": 2.3,
    "chat_messages_sent": 156,
    "ai_suggestions_accepted": 89
  },
  "content_insights": {
    "average_event_length": 245,
    "most_used_tags": ["family", "work", "travel"],
    "importance_distribution": {
      "high": 12,
      "medium": 45,
      "low": 70
    }
  }
}
```

---

## 🔍 **Search and Discovery**

### **Advanced Search**

**Full-Text Search Across Timeline**
```http
POST /functions/v1/search/timeline
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "query": "graduation college Stanford",
  "filters": {
    "date_range": {
      "start": "2018-01-01",
      "end": "2020-12-31"
    },
    "categories": ["education"],
    "min_importance": 7
  },
  "sort": "relevance",
  "limit": 20
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "event-uuid",
      "title": "College Graduation",
      "description": "Graduated from Stanford University with honors",
      "start_date": "2019-06-15",
      "category": "education",
      "importance": 10,
      "relevance_score": 0.94,
      "highlight": {
        "title": "College <mark>Graduation</mark>",
        "description": "Graduated from <mark>Stanford</mark> University with honors"
      }
    }
  ],
  "total_results": 3,
  "search_time_ms": 24,
  "suggestions": [
    "Try searching for 'university degree'",
    "Filter by year: 2019"
  ]
}
```

**Semantic Search**
```http
POST /functions/v1/search/semantic
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "query": "important achievements in my education",
  "limit": 10,
  "threshold": 0.7
}
```

---

## 📤 **Export and Sharing**

### **Data Export**

**Export Timeline Data**
```http
POST /functions/v1/export/timeline
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "format": "json",
  "include_media": true,
  "date_range": {
    "start": "2020-01-01",
    "end": "2023-12-31"
  }
}
```

**Response:**
```json
{
  "export_id": "export-uuid",
  "status": "processing",
  "estimated_completion": "2024-01-20T10:15:00Z",
  "download_url": null
}
```

**Check Export Status**
```http
GET /functions/v1/export/status/{export_id}
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "export_id": "export-uuid",
  "status": "completed",
  "download_url": "https://storage.example.com/exports/timeline-export.zip",
  "file_size": 52428800,
  "expires_at": "2024-01-27T10:15:00Z"
}
```

### **Sharing and Collaboration**

**Create Share Link**
```http
POST /functions/v1/sharing/create-link
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "event_ids": ["event-uuid-1", "event-uuid-2"],
  "permissions": "view_only",
  "expires_in": 604800,
  "password_protected": true,
  "password": "shared_secret"
}
```

**Response:**
```json
{
  "share_id": "share-uuid",
  "share_url": "https://app.nality.com/shared/share-uuid",
  "expires_at": "2024-01-27T10:15:00Z",
  "permissions": "view_only",
  "password_required": true
}
```

**Access Shared Content**
```http
GET /functions/v1/sharing/content/{share_id}
X-Share-Password: shared_secret
```

---

## ⚠️ **Error Handling**

### **Standard Error Response Format**

All API errors follow a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": {
      "field": "start_date",
      "value": "invalid-date",
      "constraint": "must be a valid ISO 8601 date"
    },
    "timestamp": "2024-01-20T10:30:00Z",
    "request_id": "req-uuid",
    "documentation_url": "https://docs.nality.com/errors/validation"
  }
}
```

### **HTTP Status Codes**

| Status Code | Description | Common Scenarios |
|-------------|-------------|------------------|
| `200` | OK | Successful GET requests |
| `201` | Created | Successful POST requests |
| `204` | No Content | Successful DELETE requests |
| `400` | Bad Request | Invalid request format or data |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists or conflict |
| `422` | Unprocessable Entity | Valid format but business logic error |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |
| `503` | Service Unavailable | Temporary service outage |

### **Common Error Codes**

```typescript
// Authentication Errors
AUTH_TOKEN_MISSING = "Authentication token is required"
AUTH_TOKEN_INVALID = "Authentication token is invalid or expired"
AUTH_INSUFFICIENT_PERMISSIONS = "Insufficient permissions for this operation"

// Validation Errors  
VALIDATION_REQUIRED_FIELD = "Required field is missing"
VALIDATION_INVALID_FORMAT = "Field format is invalid"
VALIDATION_CONSTRAINT_VIOLATION = "Field value violates constraints"

// Resource Errors
RESOURCE_NOT_FOUND = "Requested resource not found"
RESOURCE_ALREADY_EXISTS = "Resource already exists"
RESOURCE_LIMIT_EXCEEDED = "Resource limit exceeded"

// File Upload Errors
FILE_TOO_LARGE = "File size exceeds maximum limit"
FILE_TYPE_NOT_SUPPORTED = "File type is not supported"
STORAGE_QUOTA_EXCEEDED = "Storage quota exceeded"

// Rate Limiting
RATE_LIMIT_EXCEEDED = "Rate limit exceeded, please try again later"
QUOTA_EXCEEDED = "API quota exceeded for current billing period"

// Server Errors
INTERNAL_SERVER_ERROR = "An internal server error occurred"
SERVICE_UNAVAILABLE = "Service is temporarily unavailable"
DATABASE_CONNECTION_ERROR = "Database connection error"
```

---

## 🔐 **Security and Rate Limiting**

### **Authentication Requirements**

All API endpoints require authentication unless explicitly marked as public. Authentication is provided via JWT tokens in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Rate Limiting**

| Endpoint Category | Rate Limit | Window |
|------------------|------------|--------|
| Authentication | 5 requests | 1 minute |
| User Profile | 60 requests | 1 minute |
| Life Events | 100 requests | 1 minute |
| Media Upload | 20 requests | 1 minute |
| AI Services | 30 requests | 1 minute |
| Search | 50 requests | 1 minute |
| Export | 3 requests | 1 hour |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642694400
```

### **Security Headers**

Required security headers for all requests:

```http
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📚 **SDK and Integration Examples**

### **JavaScript/TypeScript SDK**

```typescript
// Initialize the client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Create a life event
const createEvent = async (eventData: LifeEventData) => {
  const { data, error } = await supabase
    .from('life_events')
    .insert(eventData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Upload media with progress tracking
const uploadMedia = async (file: File, onProgress?: (progress: number) => void) => {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `user-media/${userId}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('user-media')
    .upload(filePath, file, {
      onUploadProgress: (progress) => {
        onProgress?.(progress.loaded / progress.total * 100);
      }
    });
    
  if (error) throw error;
  return data;
};

// AI chat integration
const sendChatMessage = async (sessionId: string, message: string) => {
  const { data, error } = await supabase.functions.invoke('chat/messages', {
    body: { session_id: sessionId, message }
  });
  
  if (error) throw error;
  return data;
};
```

### **Python Integration Example**

```python
import requests
from typing import Dict, List, Optional

class NalityAPI:
    def __init__(self, base_url: str, api_key: str, access_token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'apikey': api_key,
            'Content-Type': 'application/json'
        }
    
    def create_life_event(self, event_data: Dict) -> Dict:
        """Create a new life event"""
        response = requests.post(
            f'{self.base_url}/rest/v1/life_events',
            json=event_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def search_timeline(self, query: str, filters: Optional[Dict] = None) -> List[Dict]:
        """Search timeline events"""
        search_data = {'query': query}
        if filters:
            search_data['filters'] = filters
            
        response = requests.post(
            f'{self.base_url}/functions/v1/search/timeline',
            json=search_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()['results']
```

---

## 📈 **Performance Considerations**

### **Pagination Best Practices**

Use cursor-based pagination for large datasets:

```http
GET /rest/v1/life_events?user_id=eq.{user_id}&order=created_at.desc&limit=20&offset=0
```

For better performance with large timelines:

```http
GET /rest/v1/life_events?user_id=eq.{user_id}&created_at=lt.2024-01-20T10:30:00Z&order=created_at.desc&limit=20
```

### **Caching Strategy**

- **Timeline data**: Cache for 5 minutes
- **User profile**: Cache for 30 minutes  
- **Media URLs**: Cache for 24 hours
- **Search results**: Cache for 1 minute

### **Optimization Tips**

1. **Use select() to limit returned fields**:
   ```http
   GET /rest/v1/life_events?select=id,title,start_date,importance
   ```

2. **Batch operations when possible**:
   ```http
   POST /rest/v1/life_events
   [{"title": "Event 1"}, {"title": "Event 2"}]
   ```

3. **Use real-time subscriptions for live updates** instead of polling

4. **Implement client-side caching** for frequently accessed data

---

## 🔄 **Versioning and Migration**

### **API Versioning**

The API uses URL-based versioning:
- Current version: `v1`
- Previous versions supported for 12 months
- Breaking changes require new version

### **Deprecation Policy**

1. **Announcement**: 90 days before deprecation
2. **Deprecation headers**: Added to responses
3. **Sunset date**: Clearly communicated
4. **Migration guide**: Provided for all changes

---

## 📚 **Related Documentation**

- **[Authentication Guide](./authentication.md)** - Detailed authentication implementation
- **[Real-time Features](./realtime.md)** - WebSocket and live data documentation
- **[Database Schema](../database/schema.md)** - Database structure and relationships
- **[Error Handling](../user-experience/error-handling.md)** - Frontend error handling patterns

---

*This API documentation provides comprehensive coverage of all Nality backend services. Regular updates ensure accuracy and completeness as the platform evolves.*
