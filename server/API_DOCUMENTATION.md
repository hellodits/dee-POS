# DeepOS API Documentation

## Overview

Base URL: `http://localhost:5000/api`

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Multi-Branch Architecture

### Branch Filtering Behavior

| Role | Behavior |
|------|----------|
| **OWNER** | Can access all branches. Use `?branch_id=xxx` to filter specific branch |
| **ADMIN/MANAGER** | Strictly filtered to assigned branch |
| **CASHIER** | Strictly filtered to assigned branch |

### Query Parameters for OWNER

OWNER can filter data by branch using query parameter:
```
GET /api/products?branch_id=64abc123def456
```

---

## Authentication

### POST /api/auth/login
Login and get JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "owner@deepos.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64abc123def456",
      "username": "owner",
      "email": "owner@deepos.com",
      "role": "owner",
      "branch_id": null,
      "permissions": { ... }
    }
  }
}
```

### POST /api/auth/register
Register new user (Admin only).

**Access:** Private (Admin)

### GET /api/auth/me
Get current user profile.

**Access:** Private

---

## Branches

### GET /api/branches
Get all branches.

**Access:** Private (Owner only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123def456",
      "name": "Jakarta Pusat",
      "address": "Jl. Sudirman No. 1",
      "phone": "021-1234567",
      "is_active": true
    }
  ]
}
```

### POST /api/branches
Create new branch.

**Access:** Private (Owner only)

### PUT /api/branches/:id
Update branch.

**Access:** Private (Owner only)

### DELETE /api/branches/:id
Delete branch.

**Access:** Private (Owner only)

---

## Products

### GET /api/products
Get all products with branch filtering.

**Access:** Public (with optionalAuth)

**Branch Filtering:**
- Unauthenticated: Uses `branch_id` query param (for Customer App)
- OWNER: No filter (sees all) or uses `branch_id` query param
- Non-OWNER: Strictly filtered to user's branch

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| branch_id | ObjectId | Filter by branch (required for Customer App) |
| category | string | Filter by category |
| search | string | Text search in name |
| active_only | boolean | Only active products (default: true) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123def456",
      "name": "Nasi Goreng",
      "sku": "NG001",
      "category": "Makanan",
      "price": 25000,
      "stock": 100,
      "is_active": true,
      "branch_id": "64abc123def456",
      "image_url": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "pages": 1
  }
}
```

### GET /api/products/pos/all
Get all products for POS (includes cost_price).

**Access:** Private

**Branch Filtering:** Automatic based on user role

### GET /api/products/:id
Get single product.

**Access:** Public

### GET /api/products/categories
Get product categories.

**Access:** Public

### POST /api/products
Create product with image upload.

**Access:** Private (Admin/Manager)

**Content-Type:** multipart/form-data

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| sku | string | Yes | Unique SKU |
| category | string | Yes | Category name |
| price | number | Yes | Selling price |
| cost_price | number | No | Cost price |
| stock | number | No | Initial stock |
| image | file | No | Product image |
| attributes | JSON | No | Product variants |

**Note:** `branch_id` is auto-assigned from user's branch (prevents spoofing)

### PUT /api/products/:id
Update product.

**Access:** Private (Admin/Manager)

**Branch Filtering:** Can only update products in user's branch

### DELETE /api/products/:id
Soft delete product (marks as inactive).

**Access:** Private (Admin)

### POST /api/products/:id/stock
Update stock (restock/adjustment).

**Access:** Private (requires `can_manage_inventory` permission)

**Request Body:**
```json
{
  "qty_change": 10,
  "reason": "RESTOCK",
  "notes": "Weekly restock"
}
```

**Valid reasons:** `RESTOCK`, `WASTAGE`, `ADJUSTMENT`

### GET /api/products/:id/stock-history
Get stock change history.

**Access:** Private

---

## Tables

### GET /api/tables
Get all tables with branch filtering.

**Access:** Public (with optionalAuth)

**Branch Filtering:**
- Unauthenticated: Uses `branch_id` query param
- OWNER: No filter or uses `branch_id` query param
- Non-OWNER: Strictly filtered to user's branch

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| branch_id | ObjectId | Filter by branch |
| status | string | Filter by status |
| available_only | boolean | Only available tables |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123def456",
      "number": 1,
      "capacity": 4,
      "status": "Available",
      "branch_id": "64abc123def456",
      "current_order_id": null
    }
  ]
}
```

### GET /api/tables/summary
Get table status summary.

**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "available": 7,
    "occupied": 2,
    "reserved": 1
  }
}
```

### GET /api/tables/:id
Get single table with current order.

**Access:** Private

### POST /api/tables
Create table.

**Access:** Private (Admin/Manager)

**Note:** `branch_id` is auto-assigned from user's branch

### PUT /api/tables/:id
Update table.

**Access:** Private (Admin/Manager)

### DELETE /api/tables/:id
Delete table.

**Access:** Private (Admin)

### POST /api/tables/:id/reserve
Reserve table (Customer App).

**Access:** Public (with optionalAuth)

**Request Body:**
```json
{
  "name": "John Doe",
  "whatsapp": "08123456789",
  "pax": 4,
  "reservation_time": "2024-01-15T19:00:00"
}
```

### POST /api/tables/:id/release
Release table (clear reservation/occupation).

**Access:** Private

### PATCH /api/tables/:id/reset
Reset table to Available with safety check.

**Access:** Private

**Request Body:**
```json
{
  "force": false
}
```

---

## Orders

### GET /api/orders
Get all orders.

**Access:** Private

**Branch Filtering:** Automatic based on user role

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| branch_id | ObjectId | Filter by branch (OWNER only) |
| status | string | Filter by status |
| payment_status | string | Filter by payment status |
| date_from | date | Start date |
| date_to | date | End date |
| page | number | Page number |
| limit | number | Items per page |

### POST /api/orders
Create new order.

**Access:** Private

**Note:** `branch_id` is auto-assigned from user's branch

### GET /api/orders/:id
Get single order.

**Access:** Private

### PUT /api/orders/:id
Update order.

**Access:** Private

### POST /api/orders/:id/pay
Process payment.

**Access:** Private

---

## Staff

### GET /api/staff
Get all staff.

**Access:** Private (Owner/Admin/Manager)

**Branch Filtering:** Automatic based on user role

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| role | string | Filter by role |
| search | string | Search by name/email/phone |
| active_only | boolean | Only active staff |
| page | number | Page number |
| limit | number | Items per page |

### GET /api/staff/roles
Get available staff roles.

**Access:** Private

### GET /api/staff/:id
Get single staff.

**Access:** Private (Owner/Admin/Manager)

### POST /api/staff
Create staff with profile image.

**Access:** Private (Owner/Admin/Manager)

**Content-Type:** multipart/form-data

**Note:** `branch_id` is auto-assigned from user's branch

### PUT /api/staff/:id
Update staff.

**Access:** Private (Owner/Admin/Manager)

### DELETE /api/staff/:id
Delete staff.

**Access:** Private (Owner/Admin)

---

## Staff Attendance

### GET /api/staff/attendance
Get attendance records.

**Access:** Private (Owner/Admin/Manager)

**Branch Filtering:** Automatic (filters staff by branch first)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| staff_id | ObjectId | Filter by staff |
| date | date | Filter by specific date |
| date_from | date | Start date |
| date_to | date | End date |
| status | string | Filter by status |

### GET /api/staff/attendance/today
Get today's attendance summary.

**Access:** Private

### POST /api/staff/attendance
Create attendance record.

**Access:** Private (Owner/Admin/Manager)

### POST /api/staff/attendance/clock-in
Quick clock in.

**Access:** Private

**Request Body:**
```json
{
  "staff_id": "64abc123def456"
}
```

### POST /api/staff/attendance/clock-out
Quick clock out.

**Access:** Private

### PUT /api/staff/attendance/:id
Update attendance.

**Access:** Private (Owner/Admin/Manager)

### DELETE /api/staff/attendance/:id
Delete attendance.

**Access:** Private (Owner/Admin/Manager)

---

## Inventory

### GET /api/inventory
Get all inventory items.

**Access:** Private

**Branch Filtering:** Automatic based on user role

### POST /api/inventory
Create inventory item.

**Access:** Private (Admin/Manager)

### PUT /api/inventory/:id
Update inventory item.

**Access:** Private (Admin/Manager)

### DELETE /api/inventory/:id
Delete inventory item.

**Access:** Private (Admin)

### POST /api/inventory/:id/adjust
Adjust inventory stock.

**Access:** Private (requires `can_manage_inventory`)

---

## Reservations

### GET /api/reservations
Get all reservations.

**Access:** Private

**Branch Filtering:** Automatic based on user role

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| date | date | Filter by date |
| date_from | date | Start date |
| date_to | date | End date |

### POST /api/reservations
Create reservation.

**Access:** Private

### PUT /api/reservations/:id
Update reservation.

**Access:** Private

### DELETE /api/reservations/:id
Cancel reservation.

**Access:** Private

---

## Reports

### GET /api/reports/dashboard
Get dashboard summary.

**Access:** Private

**Branch Filtering:** Automatic based on user role

**Response:**
```json
{
  "success": true,
  "data": {
    "today_sales": 1500000,
    "today_orders": 25,
    "pending_orders": 3,
    "low_stock_items": 5
  }
}
```

### GET /api/reports/sales
Get sales report.

**Access:** Private (Owner/Admin/Manager)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| branch_id | ObjectId | Filter by branch (OWNER) |
| date_from | date | Start date |
| date_to | date | End date |
| group_by | string | day/week/month |

### GET /api/reports/products
Get product performance report.

**Access:** Private (Owner/Admin/Manager)

### GET /api/reports/staff
Get staff performance report.

**Access:** Private (Owner/Admin/Manager)

---

## Notifications

### GET /api/notifications
Get notifications.

**Access:** Private

**Branch Filtering:** Returns notifications for user's branch + system-wide (branch_id: null)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| unread_only | boolean | Only unread notifications |
| type | string | Filter by type |
| limit | number | Items per page |

### POST /api/notifications
Create notification.

**Access:** Private (Admin/Manager)

**Note:** `branch_id` is auto-assigned from user's branch

### PUT /api/notifications/:id/read
Mark notification as read.

**Access:** Private

### PUT /api/notifications/read-all
Mark all notifications as read.

**Access:** Private

### DELETE /api/notifications/:id
Delete notification.

**Access:** Private

---

## Users

### GET /api/users
Get all users.

**Access:** Private (Owner/Admin)

**Branch Filtering:** Automatic based on user role

### POST /api/users
Create user.

**Access:** Private (Owner/Admin)

### PUT /api/users/:id
Update user.

**Access:** Private (Owner/Admin)

### DELETE /api/users/:id
Deactivate user.

**Access:** Private (Owner/Admin)

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## Testing

Run multi-branch tests:
```bash
cd server
npm run seed:multi-branch  # Seed test data
npm run test:multi-branch  # Run tests
```

Test accounts:
| Email | Password | Role | Branch |
|-------|----------|------|--------|
| owner@deepos.com | password123 | Owner | All |
| admin@deepos.com | password123 | Admin | Jakarta Pusat |
| manager@deepos.com | password123 | Manager | Jakarta Pusat |
| kasir.pusat@deepos.com | password123 | Cashier | Jakarta Pusat |
| kasir.selatan@deepos.com | password123 | Cashier | Jakarta Selatan |
