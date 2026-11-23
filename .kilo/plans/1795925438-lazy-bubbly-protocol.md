# Fix TypeScript Build Errors (TS6133 — unused declarations)

## Context
`npm run build` fails because `tsc -b` reports 5 unused-import/variable errors under `noUnusedLocals`. All five symbols appear only at their declaration site (confirmed via grep across each file), so they are dead code and can be removed safely.

## Tasks

1. **`src/features/companies/CompanyInfo.tsx`** (line 2)
   - Remove `Select` from the antd import.
   - `import { Button, Form, Input, Modal, Space, Typography, message } from 'antd';`

2. **`src/features/purchases/PurchaseRecord.tsx`** (lines 2–12)
   - Remove the `Card,` line from the antd import block.

3. **`src/features/devices/device-status/DeviceStatus.tsx`**
   - Line 3: remove `SlidersHorizontal` from the `lucide-react` import.
     - `import { Activity, Edit, Plus, Search, Trash } from 'lucide-react';`
   - Line 27: remove the unused state declaration `const [filtersOpen, setFiltersOpen] = useState(false);`.

## Notes / Decisions
- Each symbol is used only at its declaration (verified), so removal — not prefixing with `_` or wiring them up — is the correct fix.
- No behavior change; `filtersOpen` state is dead and nothing reads it.

## Validation
1. `npm run build` (runs `tsc -b && vite build`) — expect 0 TypeScript errors.
2. Confirm the dev server still renders the three affected pages (Companies, Purchases, Device Status) without runtime errors.