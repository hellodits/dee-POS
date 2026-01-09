# Multi-Branch Migration Guide

## Overview
This document outlines the database schema changes required to upgrade the POS System from single-branch to multi-branch (multi-tenancy) architecture.

## Schema Changes

### 1. New Branch Model
**File:** `src/models/Branch.ts`

```typescript
interface IBranch {
  _id: ObjectId
  name: string          // Branch name (unique)
  address: string       // Full address
  phone: string         // Contact number
  is_active: boolean    // Active status
  createdAt: Date
  updatedAt: Date
}
```

### 2. Updated Models with `branch_id`

#### User Model (`src/models/User.ts`)
- **Added:** `branch_id?: ObjectId` (null for OWNER role)
- **Updated:** Role enum now includes `'owner'`
- **Logic:** OWNER can access all branches, other roles are restricted to their assigned branch

#### Product Model (`src/models/Product.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Updated:** Indexes now include branch_id for performance
- **Impact:** Each branch maintains its own product catalog

#### Order Model (`src/models/Order.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Updated:** Order numbering is now per-branch
- **Updated:** Indexes optimized for branch-specific queries

#### Table Model (`src/models/Table.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Updated:** Table numbers are unique per branch (not globally)
- **Impact:** Each branch can have its own Table #1, #2, etc.

#### InventoryLog Model (`src/models/InventoryLog.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Updated:** Inventory tracking is now branch-specific

#### Staff Model (`src/models/Staff.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Impact:** Staff members are assigned to specific branches

#### Reservation Model (`src/models/Reservation.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Impact:** Reservations are branch-specific

#### Transaction Model (`src/models/Transaction.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Impact:** Financial reporting is now per-branch

#### Notification Model (`src/models/Notification.ts`)
- **Added:** `branch_id?: ObjectId` (null for system-wide notifications)
- **Impact:** Notifications can be branch-specific or system-wide

#### Inventory Model (`src/models/Inventory.ts`)
- **Added:** `branch_id: ObjectId` (required)
- **Impact:** Raw materials/ingredients are tracked per branch

## Migration Script

### File: `src/scripts/seedMultiBranch.ts`

**Usage:**
```bash
npm run seed:multi-branch
```

**What it does:**
1. **Clears all existing data** (⚠️ DESTRUCTIVE OPERATION)
2. Creates 2 branches: "Jakarta Pusat" and "Jakarta Selatan"
3. Creates 1 OWNER user (access to all branches)
4. Creates 2 CASHIER users (one per branch)
5. Creates 5 products per branch (10 total)
6. Creates 5 tables per branch (10 total)

**Default Credentials:**
| Role | Username | Password | Branch Access |
|------|----------|----------|---------------|
| Owner | owner | password123 | All Branches |
| Cashier | kasir_pusat | password123 | Jakarta Pusat |
| Cashier | kasir_selatan | password123 | Jakarta Selatan |

## Key Features

### 1. Branch Isolation
- Each branch has its own products, tables, orders, and inventory
- Data is completely isolated between branches
- Prevents cross-branch data contamination

### 2. Role-Based Access
- **OWNER:** Full access to all branches and system management
- **ADMIN/MANAGER:** Branch-specific access with elevated permissions
- **CASHIER/KITCHEN:** Branch-specific access with limited permissions

### 3. Optimized Indexing
All models now include compound indexes with `branch_id` for optimal query performance:
```javascript
// Example: Products by branch and category
{ branch_id: 1, is_active: 1, category: 1 }

// Example: Orders by branch and status
{ branch_id: 1, status: 1, createdAt: -1 }
```

### 4. Order Numbering
Order numbers are now generated per-branch:
- **Before:** `POS-20240107-0001` (global counter)
- **After:** `POS-20240107-0001` (per-branch counter)

### 5. Table Management
Table numbers are unique per branch:
- Jakarta Pusat can have Table #1
- Jakarta Selatan can also have Table #1
- No conflicts between branches

## Breaking Changes

⚠️ **IMPORTANT:** This is a breaking change that requires data migration.

### Before Migration
- Single restaurant with global data
- All users can access all data
- Global table numbering
- Single inventory pool

### After Migration
- Multi-branch restaurant chain
- Branch-specific data isolation
- Per-branch table numbering
- Branch-specific inventory

## Database Indexes

### New Indexes Added
```javascript
// Branch model
{ is_active: 1, name: 1 }

// User model
{ branch_id: 1 } // For non-OWNER users

// Product model
{ branch_id: 1, is_active: 1, category: 1 }

// Order model
{ branch_id: 1, createdAt: -1 }
{ branch_id: 1, status: 1, createdAt: -1 }

// Table model
{ branch_id: 1, number: 1 } // Unique constraint

// And similar patterns for all other models...
```

## API Impact

### Required Changes in Controllers/Routes
1. **Authentication:** Extract user's branch_id from JWT token
2. **Filtering:** Add branch_id filter to all database queries
3. **Validation:** Ensure users can only access their branch data
4. **OWNER Role:** Special handling for cross-branch access

### Example Query Changes
```javascript
// Before (single-branch)
const products = await Product.find({ is_active: true })

// After (multi-branch)
const products = await Product.find({ 
  branch_id: user.branch_id, 
  is_active: true 
})

// For OWNER role
const products = user.role === 'owner' 
  ? await Product.find({ is_active: true })
  : await Product.find({ branch_id: user.branch_id, is_active: true })
```

## Testing the Migration

1. **Backup your database** before running the migration
2. Run the migration script:
   ```bash
   cd server
   npm run seed:multi-branch
   ```
3. Verify the data:
   - Check that 2 branches were created
   - Verify 3 users (1 owner + 2 cashiers)
   - Confirm 10 products (5 per branch)
   - Confirm 10 tables (5 per branch)

## Next Steps

1. **Update API Controllers** to handle branch_id filtering
2. **Update Frontend** to show branch selection for OWNER users
3. **Update Authentication** to include branch context
4. **Test Multi-Branch Workflows** thoroughly
5. **Update Documentation** for API endpoints

## Rollback Plan

If you need to rollback:
1. Restore database from backup
2. Use the original `npm run seed` command
3. Remove branch-related code changes

---

**⚠️ Warning:** This migration will delete all existing data. Make sure to backup your database before proceeding.