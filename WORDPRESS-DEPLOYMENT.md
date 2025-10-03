# WordPress Deployment Guide

## Complete Conversion: Node.js → WordPress

This document explains the complete conversion of the Research Profile Platform from Node.js/PostgreSQL to WordPress/PHP/MySQL.

## Architecture Changes

### Backend Conversion

**Original (Node.js)**:
- Node.js + Express + TypeScript
- PostgreSQL database
- Drizzle ORM
- Replit Auth (OIDC)
- Google Cloud Storage
- Server-Sent Events (SSE)
- Bearer token authentication

**WordPress (PHP)**:
- PHP WordPress plugin
- MySQL database  
- WordPress wpdb
- WordPress users + capabilities
- WordPress Media Library
- **NO SSE** (WordPress limitation - see below)
- WordPress authentication cookies

### Security Enhancements ✓ ADDED

**New Security Features**:
1. **Audit Logging**: All admin actions logged to `wp_rpp_audit_log` table
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **IP Tracking**: Full IP address logging for security monitoring
4. **Error Logging**: Both database and PHP error_log for visibility

### OpenAlex Sync Improvements ✓ FIXED

**Pagination Handling**:
- Now fetches **all publications** (up to 500 max)
- Loops through OpenAlex API pages automatically
- 250ms delay between requests (API-friendly)

### Export Functionality ✓ ADDED

Static HTML export of researcher profiles available at:
```
GET /wp-json/research-profile/v1/researcher/{id}/export
```

## Important Limitations

### Server-Sent Events (SSE) Removed

**Why**: WordPress doesn't support long-running connections. Use polling as alternative.

**Polling Alternative**:
```javascript
setInterval(async () => {
  const data = await fetch('/wp-json/research-profile/v1/researcher/{id}/data');
}, 30000); // Poll every 30 seconds
```

## Installation

See research-profile-wordpress-complete.zip for complete package with installation instructions.

## Features

✅ OpenAlex data fetching
✅ Researcher profiles
✅ Publications, topics, affiliations
✅ CV uploads (WordPress Media Library)
✅ Admin dashboard
✅ Data caching
✅ **Static HTML export** ✓ NEW
✅ **Security audit logging** ✓ NEW
✅ **Rate limiting** ✓ NEW
✅ **Paginated publication sync** ✓ FIXED

⚠️ **Server-Sent Events**: Removed (use polling)
