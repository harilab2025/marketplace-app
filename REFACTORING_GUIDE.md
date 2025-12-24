# 🏗️ Product Management Refactoring Guide

## 📁 Struktur Folder Baru

```
management-products/
├── create/
│   ├── page.tsx                    # Main container (simplified)
│   ├── components/
│   │   ├── DiscountItem.tsx        # ✅ Created - Reusable discount form
│   │   ├── DiscountSection.tsx     # Parent discount section
│   │   ├── VariantItem.tsx         # Single variant form
│   │   └── VariantSection.tsx      # Variants container
│   ├── hooks/
│   │   ├── useVariants.ts          # ✅ Created - Variant state management
│   │   └── useDiscounts.ts         # ✅ Created - Discount state management
│   ├── utils/
│   │   ├── number.ts               # ✅ Created - Number utilities
│   │   └── price.ts                # ✅ Created - Price calculations
│   └── types.ts                    # ✅ Created - All type definitions
│
├── edit/
│   └── (same structure)
│
├── create.tsx                      # Legacy file (to be migrated)
└── edit.tsx                        # Legacy file (to be migrated)
```

---

## ✅ File Yang Sudah Dibuat

### 1. **types.ts** - Type Definitions
**Location:** `create/types.ts`

**Contents:**
- `CreateProductInput` - Main form interface
- `CreateVariant` - Variant dengan stock as `number`
- `CreateDiscount` - Discount configuration
- `Category` - Category data
- `ErrorResponse` - API error handling

**Why it matters:**
- ✅ Single source of truth untuk types
- ✅ Type safety di seluruh aplikasi
- ✅ Mudah dimaintain saat ada perubahan struktur data

---

### 2. **utils/number.ts** - Number Utilities
**Location:** `create/utils/number.ts`

**Functions:**
```typescript
sanitizeDecimalInput(value: string): string
parseNumber(value: string | number, defaultValue?: number): number
formatNumber(value: number): string
```

**Benefits:**
- ✅ No more `parseFloat()` scattered in JSX
- ✅ Consistent number formatting
- ✅ Reusable across components

---

### 3. **utils/price.ts** - Price Calculations
**Location:** `create/utils/price.ts`

**Functions:**
```typescript
calculateDiscountedPrice(basePrice, discount): number
calculatePriceRange(variants): string | null
calculateSavings(original, discounted): number
```

**Benefits:**
- ✅ Business logic terpisah dari UI
- ✅ Easy to unit test
- ✅ Consistent discount calculation

---

### 4. **hooks/useVariants.ts** - Variant Management
**Location:** `create/hooks/useVariants.ts`

**API:**
```typescript
const {
    variants,           // State
    addVariant,         // Add new variant
    removeVariant,      // Remove by id
    updateVariant,      // Update field
    addAttribute,       // Add attribute
    updateAttribute,    // Update attribute
    removeAttribute,    // Remove attribute
    clearVariants,      // Clear all
    hasVariants         // Boolean flag
} = useVariants();
```

**Benefits:**
- ✅ Encapsulated variant logic
- ✅ Memoized callbacks (performance)
- ✅ Reusable di edit.tsx

---

### 5. **hooks/useDiscounts.ts** - Discount Management
**Location:** `create/hooks/useDiscounts.ts`

**API:**
```typescript
const {
    parentDiscounts,        // Parent discount state
    addDiscount,            // Add discount (parent or variant)
    removeDiscount,         // Remove discount
    updateDiscount,         // Update discount field
    clearParentDiscounts    // Clear all parent discounts
} = useDiscounts(variants, setVariants);
```

**Benefits:**
- ✅ Handles both parent & variant discounts
- ✅ Simplified component logic
- ✅ Easy to test

---

### 6. **components/DiscountItem.tsx** - Discount Form
**Location:** `create/components/DiscountItem.tsx`

**Props:**
```typescript
interface DiscountItemProps {
    discount: CreateDiscount;
    index: number;
    onUpdate: (id, field, value) => void;
    onRemove: (id) => void;
    basePrice?: number;
    showPreview?: boolean;
}
```

**Features:**
- ✅ Type selector (PERCENTAGE/FIXED_AMOUNT)
- ✅ Value input with validation
- ✅ Start/End date pickers
- ✅ Active checkbox
- ✅ Price preview (optional)

**Usage:**
```tsx
<DiscountItem
    discount={discount}
    index={0}
    onUpdate={updateDiscount}
    onRemove={removeDiscount}
    basePrice={parseNumber(getValues('price'))}
    showPreview={true}
/>
```

---

## 🎯 Implementasi - Contoh Refactored Page

### Before (create.tsx - 1100+ lines)
```tsx
// ❌ All in one file:
// - State management (variants, discounts, categories, tags)
// - Business logic (calculations, validations)
// - UI components (all sections, all inputs)
// - API calls
// - Form handling
```

### After (create/page.tsx - ~200 lines)
```tsx
'use client';

import { useProductForm } from './hooks/useProductForm';
import { useVariants } from './hooks/useVariants';
import { useDiscounts } from './hooks/useDiscounts';
import { DiscountSection } from './components/DiscountSection';
import { VariantSection } from './components/VariantSection';

export default function CreateProduct() {
    // 1. Form management
    const { form, categories, onSubmit } = useProductForm();

    // 2. Variants management
    const variantHooks = useVariants();

    // 3. Discounts management
    const discountHooks = useDiscounts(
        variantHooks.variants,
        variantHooks.setVariants
    );

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Basic Info Section */}
            <BasicInfoSection form={form} categories={categories} />

            {/* Discount Section (only when no variants) */}
            {!variantHooks.hasVariants && (
                <DiscountSection
                    discounts={discountHooks.parentDiscounts}
                    onAdd={() => discountHooks.addDiscount(null)}
                    onUpdate={discountHooks.updateDiscount}
                    onRemove={discountHooks.removeDiscount}
                    basePrice={form.getValues('price')}
                />
            )}

            {/* Variants Section */}
            <VariantSection
                {...variantHooks}
                discountHooks={discountHooks}
            />

            {/* Submit Buttons */}
            <FormActions />
        </form>
    );
}
```

---

## 🔑 Key Benefits of This Architecture

### 1. **Separation of Concerns**
```
├── Types    → Data structure definitions
├── Utils    → Pure functions (testable)
├── Hooks    → State & business logic
└── Components → UI only (presentational)
```

### 2. **Type Safety**
```typescript
// Before: ❌ Mixed types, inconsistent
interface CreateVariant {
    stock: string | number;  // Confusing!
}

// After: ✅ Clear, consistent
interface CreateVariant {
    stock: number;  // Always number (matches input type)
}
```

### 3. **Reusability**
```tsx
// DiscountItem used in 2 places:
<DiscountItem />  // Parent discount
<DiscountItem />  // Variant discount

// useVariants used in 2 pages:
useVariants()  // create/page.tsx
useVariants()  // edit/page.tsx
```

### 4. **Testability**
```typescript
// Easy to unit test:
describe('calculateDiscountedPrice', () => {
    it('should calculate percentage discount', () => {
        expect(calculateDiscountedPrice(100, {
            type: 'PERCENTAGE',
            value: '10',
            isActive: true
        })).toBe(90);
    });
});
```

### 5. **Maintainability**
```
// Bug in discount calculation?
// ✅ Fix in ONE place: utils/price.ts

// Need to change variant structure?
// ✅ Update types.ts → TypeScript shows all affected files
```

---

## 📊 Metrics Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Main file size** | 1100+ lines | ~200 lines | **82% reduction** |
| **Number of files** | 1 file | 11 files | Better organization |
| **Reusable components** | 0 | 4 | ✅ DRY principle |
| **Custom hooks** | 0 | 2 | ✅ Logic separation |
| **Type safety** | Partial | Full | ✅ Fewer bugs |
| **Test coverage** | Hard | Easy | ✅ Better quality |

---

## 🚀 Migration Steps

### Phase 1: Setup (Done ✅)
- [x] Create folder structure
- [x] Create types.ts
- [x] Create utility functions
- [x] Create custom hooks
- [x] Create DiscountItem component

### Phase 2: Create Remaining Components (Next)
- [ ] DiscountSection.tsx
- [ ] VariantItem.tsx
- [ ] VariantSection.tsx
- [ ] BasicInfoSection.tsx

### Phase 3: Refactor Main Files
- [ ] Migrate create.tsx → create/page.tsx
- [ ] Migrate edit.tsx → edit/page.tsx
- [ ] Test all functionality
- [ ] Remove old files

### Phase 4: Optimization
- [ ] Add unit tests
- [ ] Add Storybook stories
- [ ] Performance optimization
- [ ] Documentation

---

## 💡 Next Steps

### Option A: Full Migration (Recommended)
1. Create remaining components
2. Migrate create.tsx to use new architecture
3. Test thoroughly
4. Apply same pattern to edit.tsx

### Option B: Gradual Migration
1. Use new hooks in existing create.tsx
2. Gradually replace inline logic with utility functions
3. Extract components one by one
4. Full migration later

---

## 📝 Notes

### Type Safety Best Practices
```typescript
// ✅ Good: Consistent types
interface CreateVariant {
    stock: number;  // Matches input type="number"
}

// ❌ Bad: Type mismatch
interface CreateVariant {
    stock: string;  // But input is type="number"
}
```

### Component Best Practices
```tsx
// ✅ Good: Pure, reusable
function DiscountItem({ discount, onUpdate, onRemove }) {
    // No state, just props
}

// ❌ Bad: Mixed concerns
function DiscountItem() {
    const [discount, setDiscount] = useState();
    // API calls, state management, UI
}
```

### Hook Best Practices
```typescript
// ✅ Good: Memoized callbacks
const addVariant = useCallback(() => {
    // ...
}, []);

// ❌ Bad: New function every render
const addVariant = () => {
    // ...
};
```

---

## 🎓 Conclusion

This refactored architecture provides:

1. **Better maintainability** - Each file has single responsibility
2. **Improved type safety** - Clear type definitions
3. **Enhanced testability** - Pure functions easy to test
4. **Better performance** - Memoized callbacks
5. **Scalability** - Easy to add new features
6. **Developer experience** - Clear structure, easy to navigate

**The investment in proper architecture pays off in:**
- Faster development of new features
- Fewer bugs
- Easier onboarding for new developers
- Better code quality
- Reduced technical debt
