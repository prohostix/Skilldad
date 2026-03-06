# Partner Discount Code Dropdown Fix

## Issue
When B2B partners try to register a new student, the discount code dropdown shows "Select a code" but no discount codes appear in the list, even though admin has created discount codes.

## Root Cause
The `GET /api/partner/discounts` endpoint was filtering discount codes by `partner: req.user.id`, which only returned codes specifically assigned to that partner. However, admin-created discount codes were being created as global codes (with `partner: null`), so they weren't appearing in the partner's dropdown.

## Solution
Modified the discount code fetching logic to return both partner-specific codes AND global codes.

## Changes Made

### Backend Changes

#### 1. `server/controllers/partnerController.js` - getDiscounts function
**Before:**
```javascript
const getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find({ partner: req.user.id }).sort('-createdAt');
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

**After:**
```javascript
const getDiscounts = async (req, res) => {
    try {
        // Get discount codes that are either:
        // 1. Assigned to this partner specifically
        // 2. Global codes (no partner assigned)
        const discounts = await Discount.find({
            $or: [
                { partner: req.user.id },
                { partner: null },
                { partner: { $exists: false } }
            ],
            isActive: true // Only return active codes
        }).sort('-createdAt');
        
        res.json(discounts);
    } catch (error) {
        console.error('Error fetching partner discounts:', error);
        res.status(500).json({ message: error.message });
    }
};
```

**Changes:**
- Added `$or` query to fetch codes assigned to the partner OR global codes
- Added `isActive: true` filter to only show active discount codes
- Added error logging for debugging

#### 2. `server/controllers/discountController.js` - createDiscount function
**Before:**
```javascript
const createDiscount = async (req, res) => {
    try {
        const { code, type, value, expiryDate } = req.body;
        // ... validation ...
        const discount = await Discount.create({
            code: code.toUpperCase(),
            type: type || 'percentage',
            value,
            expiryDate: expiryDate || null,
        });
        res.status(201).json(discount);
    } catch (error) {
        // ... error handling ...
    }
};
```

**After:**
```javascript
const createDiscount = async (req, res) => {
    try {
        const { code, type, value, expiryDate, partner } = req.body;
        // ... validation ...
        const discount = await Discount.create({
            code: code.toUpperCase(),
            type: type || 'percentage',
            value,
            expiryDate: expiryDate || null,
            partner: partner || null, // Assign to specific partner or leave as global
        });
        res.status(201).json(discount);
    } catch (error) {
        // ... error handling ...
    }
};
```

**Changes:**
- Added `partner` parameter to allow admins to assign codes to specific partners
- Defaults to `null` for global codes if no partner is specified

## How It Works Now

### For Partners:
1. When a B2B partner opens the "Register New Student" modal
2. The dropdown fetches discount codes via `GET /api/partner/discounts`
3. The endpoint returns:
   - All global discount codes (created by admin without partner assignment)
   - All codes specifically assigned to this partner
   - Only active codes (`isActive: true`)
4. Partner can select any of these codes when registering a student

### For Admins:
1. When creating a discount code, admins can optionally specify a `partner` ID
2. If `partner` is provided, the code is assigned to that specific partner only
3. If `partner` is not provided (or null), the code is global and available to all partners

## Testing Checklist

- [x] Partner can see discount codes in the dropdown
- [x] Partner can select a discount code
- [x] Partner can register a student with the selected code
- [ ] Admin can create global discount codes (available to all partners)
- [ ] Admin can create partner-specific discount codes
- [ ] Only active codes appear in the dropdown
- [ ] Inactive codes are hidden from partners

## Files Modified

1. `server/controllers/partnerController.js` - Modified `getDiscounts` to return global and partner-specific codes
2. `server/controllers/discountController.js` - Added `partner` parameter to `createDiscount` function

## Next Steps (Optional Enhancements)

1. Add UI in admin panel to assign discount codes to specific partners
2. Add bulk assignment feature for multiple partners
3. Add expiry date validation in the frontend
4. Show code usage statistics to partners
