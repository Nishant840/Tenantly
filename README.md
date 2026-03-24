
# 🚀 Tenantly — Multi-Tenant SaaS Platform

🔗 **Live Demo:** [https://tenantly-six.vercel.app/](https://tenantly-six.vercel.app/)

----------

## 🧠 Overview

**Tenantly** is a full-stack multi-tenant SaaS backend + dashboard that enables organizations to manage teams, projects, permissions, API access, and activity logs — similar to tools like Notion, Linear, or Stripe dashboards.

This project focuses on **real-world SaaS architecture**, including:

-   Multi-tenant data isolation
    
-   Role-based access control (RBAC)
    
-   API key authentication
    
-   Invite-based onboarding
    
-   Audit logging for traceability
    

----------

## 🎯 Key Features

### 🏢 Multi-Tenancy

-   Users can belong to multiple organizations
    
-   Strict tenant isolation using `organizationId`
    
-   Active organization context via `activeOrgId`
    

----------

### 🔐 Authentication & Authorization

-   Secure authentication using NextAuth
    
-   RBAC at two levels:
    
    -   **Organization roles:** OWNER, ADMIN, MEMBER
        
    -   **Project roles:** PROJECT_ADMIN, PROJECT_MEMBER
        
-   Server-side access enforcement (no client trust)
    

----------

### 👥 Organization & Team Management

-   Invite users via email
    
-   Accept invite → membership created
    
-   View members and their roles
    
-   Remove users from organization
    
-   Leave organization
    

----------

### 📁 Project Management

-   Create and manage projects inside organizations
    
-   Assign/remove users from projects
    
-   Track project-level roles
    
-   View project members
    

----------

### 🔑 API Key System

-   Generate API keys for external access
    
-   Secure storage using hashed keys (`sha256`)
    
-   Revoke keys anytime
    
-   Use API keys for programmatic access
    

----------

### 📜 Audit Logging

-   Track all important actions:
    
    -   Invites
        
    -   Membership changes
        
    -   Project operations
        
-   Useful for debugging and compliance
    

----------

## 🧱 Tech Stack

### 💻 Frontend

-   React (via Next.js App Router)
    
-   Tailwind CSS (clean, minimal UI)
    

### ⚙️ Backend

-   Next.js API Routes + Server Actions
    
-   TypeScript
    

### 🗄️ Database

-   PostgreSQL (Neon DB)
    
-   Prisma ORM
    

### ☁️ Deployment

-   Vercel
    

----------

## 🏗️ Architecture

### Multi-Tenant Model

![DataBase Schema](./Database_schema/db-schema.svg)

```
User → Organization → Project → Membership

```

-   Users belong to organizations via `OrgMembership`
    
-   Projects are scoped under organizations
    
-   Access is controlled via join tables (not flags)
    

----------

## 🧩 Database Schema (Simplified)

```
User
 ├── OrgMembership ── Organization ── Project ── ProjectMembership
 │                         │
 │                         ├── ApiKey
 │                         ├── AuditLog
 │                         └── OrgInvite

```

----------

### 🔑 Core Relationships

-   **User ↔ Organization** → via `OrgMembership`
    
-   **User ↔ Project** → via `ProjectMembership`
    
-   **Organization → Projects**
    
-   **Organization → API Keys**
    
-   **Organization → Audit Logs**
    
-   **Organization → Invites**
    

----------

## 📊 Data Models (Highlights)

### 👤 User

-   Email-based identity
    
-   Can belong to multiple organizations
    
-   Stores `activeOrgId` for context switching
    

----------

### 🏢 Organization

-   Contains projects, members, API keys, logs
    
-   Supports plans: FREE, PRO, ENTERPRISE
    

----------

### 👥 OrgMembership

-   Defines user role inside organization
    
-   Ensures unique membership per org
    

----------

### 📁 Project

-   Scoped under organization
    
-   Has project-level members
    

----------

### 🔑 ApiKey

-   Stored as hashed value
    
-   Can be revoked
    

----------

### 📜 AuditLog

-   Tracks system actions
    
-   Stores metadata like user, resource, timestamp
    

----------

### 📩 OrgInvite

-   Invite-based onboarding system
    
-   Tracks invite status (PENDING, ACCEPTED, EXPIRED)
    

----------

## 🔌 API Overview

### Auth & Organization

-   `POST /api/org/invite`
    
-   `POST /api/org/invite/accept`
    
-   `GET /api/org/members`
    

----------

### Projects

-   `POST /api/projects/assign`
    
-   `POST /api/projects/remove-user`
    
-   `GET /api/v1/projects`
    

----------

### API Keys

-   `POST /api/apikeys/create`
    
-   `GET /api/apikeys`
    
-   `POST /api/apikeys/revoke`
    

----------

### Audit Logs

-   `GET /api/audit`
    

----------

## 🧠 Key Design Decisions

-   ✅ Tenant isolation via `organizationId`
    
-   ✅ RBAC using relational tables (scalable)
    
-   ✅ API keys stored as hashes (security-first)
    
-   ✅ Server-side authorization (no client trust)
    
-   ✅ Active organization context (`activeOrgId`) instead of `[0]` hack
    

----------

## 🚧 Current Features

-   ✅ Authentication
    
-   ✅ Multi-tenant architecture
    
-   ✅ RBAC (org + project)
    
-   ✅ Invite system
    
-   ✅ Project assignment
    
-   ✅ API keys
    
-   ✅ Audit logs
    
-   ✅ Dashboard UI
    
-   ✅ Deployment (Vercel)
    

----------

## 🔮 Future Improvements

-   Pagination for APIs
    
-   Rate limiting (Redis / middleware)
    
-   Role update (promote/demote users)
    
-   Better onboarding flow
    
-   Activity feed improvements
    
-   Caching layer for performance
    
-   Notifications (email/webhooks)
    

----------

## 💡 What This Project Demonstrates

-   Real-world SaaS backend architecture
    
-   Clean database design with Prisma
    
-   Secure API design (auth + API keys)
    
-   Multi-tenant system thinking
    
-   Full-stack integration (Next.js + DB + UI)
    
-   Production deployment workflow
    

----------

## 🧑‍💻 Author

Nishant Kumar
B.Tech, Computer Science  
Indian Institute of Information Technology (IIIT) Bhopal

----------

## ⭐ Final Note

This project goes beyond basic CRUD apps and focuses on **building a production-like SaaS system** with real-world considerations like security, scalability, and maintainability.

----------

If you found this interesting, feel free to ⭐ the repo or explore the live demo!

🔗 [https://tenantly-six.vercel.app/](https://tenantly-six.vercel.app/)