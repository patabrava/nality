# System Architecture Overview

*High-level architecture of the Nality life timeline application*

---

## 🏗️ **Architecture Summary**

Nality is built as a modern, scalable web application using Next.js 15 with App Router and Supabase backend infrastructure. The architecture follows a modular, component-based design with strong separation of concerns and comprehensive security measures.

### **Technology Stack**

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App Router]
        B[React 18 Components]
        C[TypeScript]
        D[Tailwind CSS]
        E[Material Design 3]
    end
    
    subgraph "Backend Layer"
        F[Supabase Platform]
        G[PostgreSQL Database]
        H[Row Level Security]
        I[Supabase Auth]
        J[Supabase Storage]
        K[Edge Functions]
    end
    
    subgraph "External Services"
        L[OpenAI API]
        M[Vercel Hosting]
        N[CDN Services]
    end
    
    A --> F
    B --> I
    G --> H
    F --> L
    M --> A
    N --> J
```

---

## 🏛️ **System Components**

### **Frontend Architecture**

**Next.js Application Structure:**
```
apps/web/
├── app/                      # App Router structure
│   ├── (protected)/         # Protected routes requiring authentication
│   ├── api/                 # API routes and server actions
│   ├── auth/                # Authentication pages
│   └── layout.tsx           # Root layout
├── components/              # Reusable UI components
├── modules/                 # Feature-specific modules
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
└── styles/                  # Styling and themes
```

**Key Principles:**
- **Observable Implementation**: Clear component hierarchy with predictable state flow
- **Dependency Transparency**: All external dependencies explicitly declared
- **Progressive Construction**: Modular architecture enabling incremental enhancement
- **Explicit Error Handling**: Comprehensive error boundaries and fallback states

### **Backend Architecture**

**Supabase Infrastructure:**
- **PostgreSQL Database**: Primary data store with advanced features
- **Row Level Security (RLS)**: Database-level access control
- **Authentication Service**: Magic link and session management
- **Storage Service**: Media file management with CDN
- **Edge Functions**: Serverless TypeScript functions for complex logic
- **Realtime Subscriptions**: Live data updates via WebSocket

### **Module Architecture**

```mermaid
graph LR
    subgraph "Application Modules"
        A[Dashboard Module]
        B[Timeline Module] 
        C[Chat Module]
        D[Contact Module]
        E[View Module]
    end
    
    subgraph "Shared Services"
        F[Authentication Service]
        G[Data Service]
        H[Media Service]
        I[Notification Service]
    end
    
    subgraph "Core Infrastructure"
        J[Database Layer]
        K[API Layer]
        L[State Management]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    
    F --> G
    G --> H
    H --> I
    
    G --> J
    I --> K
    K --> L
```

---

## 🔄 **Data Flow Architecture**

### **Request/Response Flow**

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Next.js App
    participant Auth as Supabase Auth
    participant DB as PostgreSQL
    participant Storage as Supabase Storage
    participant AI as OpenAI API
    
    User->>NextJS: Page Request
    NextJS->>Auth: Validate Session
    Auth-->>NextJS: Session Status
    
    alt Authenticated
        NextJS->>DB: Query User Data
        DB-->>NextJS: User Profile & Events
        NextJS-->>User: Rendered Page
    else Not Authenticated
        NextJS-->>User: Redirect to Login
    end
    
    User->>NextJS: Create Life Event
    NextJS->>DB: Insert Event (RLS Check)
    DB-->>NextJS: Event Created
    
    opt Media Upload
        NextJS->>Storage: Upload File
        Storage-->>NextJS: File URL
        NextJS->>DB: Link Media to Event
    end
    
    opt AI Processing
        NextJS->>AI: Process Event Text
        AI-->>NextJS: Enhanced Data
        NextJS->>DB: Update Event
    end
    
    NextJS-->>User: Success Response
```

### **State Management Flow**

1. **Local State**: Component-level state for UI interactions
2. **Client Cache**: TanStack Query for server state caching
3. **Global State**: Zustand for cross-component state
4. **Database State**: Authoritative source of truth in PostgreSQL
5. **Realtime Updates**: Supabase channels for live data synchronization

---

## 🔐 **Security Architecture**

### **Authentication & Authorization**

```mermaid
graph TD
    A[User Login Request] --> B[Supabase Auth]
    B --> C{Magic Link Sent}
    C --> D[Email Verification]
    D --> E[Session Created]
    E --> F[JWT Token Issued]
    F --> G[HTTP-Only Cookie Set]
    
    G --> H[Protected Route Access]
    H --> I[RLS Policy Check]
    I --> J{User Authorized?}
    J -->|Yes| K[Data Access Granted]
    J -->|No| L[Access Denied]
```

**Security Layers:**
1. **Transport Security**: HTTPS/TLS encryption for all communications
2. **Authentication**: Supabase Auth with magic link verification
3. **Session Management**: HTTP-only cookies with secure flags
4. **Authorization**: Row Level Security policies at database level
5. **Input Validation**: Zod schemas for all data inputs
6. **CSRF Protection**: Built-in Next.js CSRF protection
7. **XSS Prevention**: Content Security Policy and output encoding

### **Data Access Control**

**Row Level Security Policies:**
- Users can only access their own profile data
- Life events are scoped to the authenticated user
- Media objects inherit access from associated events
- Admin roles have auditing access with additional constraints

---

## 📊 **Performance Architecture**

### **Optimization Strategies**

```mermaid
graph LR
    subgraph "Frontend Optimizations"
        A[Code Splitting]
        B[Image Optimization]
        C[Static Generation]
        D[Client Caching]
    end
    
    subgraph "Backend Optimizations"
        E[Database Indexing]
        F[Query Optimization]
        G[Connection Pooling]
        H[Edge Functions]
    end
    
    subgraph "Infrastructure Optimizations"
        I[CDN Distribution]
        J[Compression]
        K[Caching Layers]
        L[Load Balancing]
    end
    
    A --> E
    B --> I
    C --> F
    D --> K
```

**Performance Targets:**
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **API Response Time**: < 200ms average

### **Scalability Considerations**

1. **Horizontal Scaling**: Serverless functions auto-scale based on demand
2. **Database Scaling**: PostgreSQL with read replicas for high availability
3. **Storage Scaling**: Supabase Storage with CDN for global distribution
4. **Cache Strategy**: Multi-level caching from browser to database
5. **Resource Optimization**: Lazy loading and code splitting for efficient resource usage

---

## 🚀 **Deployment Architecture**

### **Environment Strategy**

```mermaid
graph TB
    subgraph "Development"
        A[Local Environment]
        B[Development Database]
        C[Local Storage]
    end
    
    subgraph "Staging"
        D[Vercel Preview]
        E[Staging Database]
        F[Staging Storage]
    end
    
    subgraph "Production"
        G[Vercel Production]
        H[Production Database]
        I[Production Storage]
        J[CDN Distribution]
    end
    
    A --> D
    D --> G
    B --> E
    E --> H
    C --> F
    F --> I
    I --> J
```

**Deployment Pipeline:**
1. **Development**: Local development with hot reloading
2. **Feature Branches**: Automatic preview deployments
3. **Staging**: Full integration testing environment
4. **Production**: Blue-green deployment with rollback capability
5. **Monitoring**: Comprehensive logging and performance tracking

---

## 🔧 **Development Architecture**

### **Monorepo Structure**

```
nality/
├── apps/
│   └── web/                 # Main Next.js application
├── packages/
│   ├── schema/              # Shared TypeScript schemas
│   └── ui/                  # Shared component library
├── supabase/
│   ├── migrations/          # Database schema migrations
│   ├── functions/           # Edge Functions
│   └── config.toml          # Supabase configuration
├── docs/                    # Technical documentation
└── documentation/           # Comprehensive documentation
```

**Development Principles:**
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Quality**: ESLint, Prettier, and automated formatting
- **Testing Strategy**: Unit tests, integration tests, and E2E testing
- **Version Control**: Git with conventional commits and semantic versioning
- **CI/CD**: Automated testing, building, and deployment

### **Tool Integration**

- **Package Management**: pnpm with workspace support
- **Build System**: Turbo for monorepo build optimization
- **Development Server**: Next.js with hot module replacement
- **Database Management**: Supabase CLI for migrations and local development
- **Deployment**: Vercel with automatic deployments

---

## 📈 **Monitoring & Observability**

### **Logging Strategy**

```mermaid
graph LR
    subgraph "Application Logging"
        A[Frontend Logs]
        B[API Route Logs]
        C[Edge Function Logs]
        D[Database Query Logs]
    end
    
    subgraph "External Monitoring"
        E[Vercel Analytics]
        F[Supabase Dashboard]
        G[Error Tracking]
        H[Performance Monitoring]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
```

**Monitoring Components:**
1. **Application Performance**: Real-time performance metrics
2. **Error Tracking**: Comprehensive error logging and alerting
3. **Database Monitoring**: Query performance and connection health
4. **User Analytics**: Privacy-respecting usage analytics
5. **Security Monitoring**: Authentication and access pattern analysis

---

## 🔮 **Future Architecture Considerations**

### **Planned Enhancements**

1. **Microservices Evolution**: Gradual extraction of services for better scalability
2. **Event-Driven Architecture**: Implementation of event sourcing for complex workflows
3. **Advanced Caching**: Redis integration for high-performance caching
4. **Multi-Region Deployment**: Global distribution for improved performance
5. **AI/ML Integration**: Enhanced AI capabilities for content processing

### **Technical Debt Management**

- **Regular Refactoring**: Scheduled refactoring cycles to maintain code quality
- **Dependency Updates**: Automated dependency updates with security scanning
- **Performance Audits**: Regular performance reviews and optimizations
- **Security Reviews**: Periodic security assessments and penetration testing

---

## 📚 **Related Documentation**

- **[Component Architecture](./components.md)** - Detailed component structure
- **[Infrastructure Design](./infrastructure.md)** - Deployment and hosting architecture
- **[Database Schema](../database/schema.md)** - Database design and relationships
- **[API Documentation](../api/endpoints.md)** - Complete API reference

---

*This architecture overview provides the foundation for understanding the Nality system design. For implementation details, refer to the specific component documentation.*
