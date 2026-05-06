# Backend Requirement

## Purpose

This document defines the backend API contract required by the current Softkey AI admin panel. The frontend already supports a mock mode, but the production target is a remote backend that serves all admin data and mutations from one API surface.

## Current Frontend Assumptions

- API base URL: `NEXT_PUBLIC_ADMIN_API_BASE_URL`
- Default API host: `http://localhost:4000/api/admin`
- Remote mode flag: `NEXT_PUBLIC_ADMIN_API_MODE=remote`
- Admin auth token source: `sessionStorage.admin_token`
- Auth header: `Authorization: Bearer <token>`

The backend must accept the bearer token on all protected admin endpoints.

## Required API Base

All endpoints are mounted under:

`/api/admin`

## Authentication And Authorization

The backend must support:

- Bearer-token authentication for admin routes
- Role-based access control for at least these roles:
  - `super_admin`
  - `admin`
  - `support`
  - `analyst`
  - `editor`
  - `billing`
  - `ops`
- Rejection of unauthorized requests with a consistent JSON error payload

Recommended error shape:

```json
{
  "error": "Unauthorized"
}
```

## Required Data Domains

The admin panel expects these resource domains:

- Admin users
- Users
- Subscriptions
- Plans
- AI providers
- Prompt templates
- Tools directory entries
- Notifications
- Audit logs
- Platform settings
- Feature flags
- Analytics and chart data

## Core Data Types

The backend should return objects compatible with the frontend types in `types/admin.ts`:

- `AdminUser`
- `User`
- `UserSession`
- `Subscription`
- `Plan`
- `AIProvider`
- `PromptTemplate`
- `Tool`
- `Notification`
- `AuditLog`
- `AppSettings`
- `FeatureFlags`
- `ChartDataPoint`
- `SessionRecord`

## API Endpoints

### Analytics

#### `GET /api/admin/analytics/stats`

Returns dashboard metrics as a flat object of numbers.

Expected keys:

- `totalUsers`
- `activeUsers`
- `newToday`
- `revenueMonthToDate`
- `aiCallsToday`
- `activeSubscriptions`

#### `GET /api/admin/analytics/charts`

Returns chart series grouped by key.

Expected response shape:

```json
{
  "registrations": [],
  "aiUsage": [],
  "conversions": [],
  "templateUsage": [],
  "providerDistribution": [],
  "userGrowth": []
}
```

Each series item should match `ChartDataPoint`.

### Users

#### `GET /api/admin/users`

Supports pagination and filtering.

Query params:

- `page`
- `pageSize`
- `status`
- `planId`
- `search`
- `from`
- `to`

Response shape:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 50
}
```

#### `GET /api/admin/users/:id`

Returns a single user.

#### `GET /api/admin/users/:id/sessions`

Returns the user session list.

#### `PATCH /api/admin/users/:id`

Updates a user.

#### `DELETE /api/admin/users/:id`

Deletes a user and all dependent records as appropriate.

### Plans

#### `GET /api/admin/plans`

Returns all plans.

#### `POST /api/admin/plans`

Creates a plan.

#### `PATCH /api/admin/plans/:id`

Updates a plan.

### AI Providers

#### `GET /api/admin/providers`

Returns all AI providers.

#### `PATCH /api/admin/providers/:id`

Updates provider fields such as enable state, priority, model list, fallback order, and masked key metadata.

### Settings

#### `GET /api/admin/settings`

Returns:

- `appSettings`
- `featureFlags`

#### `PATCH /api/admin/settings`

Updates `AppSettings`.

#### `PATCH /api/admin/settings/feature-flags`

Updates `FeatureFlags`.

### Prompt Templates

The frontend currently renders prompt management from local data. For production parity, the backend should expose:

- `GET /api/admin/prompts`
- `POST /api/admin/prompts`
- `PATCH /api/admin/prompts/:id`
- `DELETE /api/admin/prompts/:id`

### Tools Directory

The frontend currently renders tool management from local data. For production parity, the backend should expose:

- `GET /api/admin/tools`
- `POST /api/admin/tools`
- `PATCH /api/admin/tools/:id`
- `DELETE /api/admin/tools/:id`

### Notifications

The frontend currently renders notification management from local data. For production parity, the backend should expose:

- `GET /api/admin/notifications`
- `POST /api/admin/notifications`
- `PATCH /api/admin/notifications/:id`
- `DELETE /api/admin/notifications/:id`

### Audit Logs

The dashboard and user flows use audit activity data. For production parity, the backend should expose:

- `GET /api/admin/audit-logs`

## Mutation Behavior Requirements

When the frontend performs a successful mutation, the backend should:

- Return the updated entity in the response body
- Keep derived fields consistent, such as counts, revenue, and summary values
- Persist changes immediately
- Emit an audit log entry for admin-impacting actions where possible

## Pagination And Filtering Requirements

- Pagination should be server-side for large lists
- Filters should be case-insensitive where applicable
- Date filters should accept ISO-8601 date strings
- Sort order should be deterministic

## Error Handling Requirements

All failures should return JSON, not HTML.

Recommended statuses:

- `400` for invalid input
- `401` for missing or invalid auth
- `403` for insufficient permissions
- `404` for missing resources
- `409` for conflicting updates
- `500` for server failures

## File And Asset Requirements

- `logoUrl` and `avatarUrl` fields should resolve to publicly accessible image URLs
- If masking sensitive values, return masked strings only; never expose raw provider keys in admin responses

## Environment Variables

The backend should support at least:

- `ADMIN_API_PORT`
- `ADMIN_API_BASE_URL`
- `ADMIN_JWT_SECRET` or equivalent signing secret
- `ADMIN_DATABASE_URL`
- `ADMIN_STORAGE_URL` if asset storage is external

## Suggested Persistence Layer

Any relational database is acceptable, but the backend must reliably support:

- Users
- Subscriptions
- Plans
- Providers
- Prompts
- Tools
- Notifications
- Settings
- Feature flags
- Audit logs

## Acceptance Criteria

The backend update is complete when:

- The admin panel can load all major routes in remote mode
- Users, plans, providers, settings, and analytics all round-trip to the API
- Auth-protected routes reject invalid tokens
- No frontend code needs to fall back to mock data in production mode
- The documented endpoints return shapes compatible with the existing admin UI

## Notes

- The current frontend still contains local mock fallbacks for development.
- Once the backend is ready, the admin services can be switched fully to remote mode by setting `NEXT_PUBLIC_ADMIN_API_MODE=remote`.
