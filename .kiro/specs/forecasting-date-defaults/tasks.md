# Implementation Plan: Forecasting Date Defaults

## Overview

All work is contained in a single client component, `HarvestForecast` in `src/app/admin/forecasting/page.tsx`. The change has four moving parts: a new `getStartOfCurrentYear()` helper, a new default pair (`Start_Of_Current_Year` / `Today_Local`) in the `useState<FormData>` initializer, the removal of silent date clamping in `handleInputChange` and `min`/`max` attributes on the two `<input type="date">` elements, and a single empty-input guard at the top of `validateDateRange`. Everything else (dropdown reset logic, validation message copy, the auto-refetch effect, the request shape, and the rest of the page) is preserved verbatim.

Per the approved design, property-based testing does not apply — the change is a UI default plus a set of removed branches with no general invariant to quantify over. Verification is the 12 manual scenarios documented in `design.md` § Testing Strategy.

## Tasks

- [x] 1. Add module-scope helper for `Start_Of_Current_Year`
  - [x] 1.1 Add `getStartOfCurrentYear()` to `src/app/admin/forecasting/page.tsx`
    - Define `const getStartOfCurrentYear = (): string => { const now = new Date(); return \`${now.getFullYear()}-01-01\`; };` at module scope
    - Place adjacent to the existing `getTodayInputValue` helper for discoverability
    - Do not modify `formatDateInputValue`, `getTodayInputValue`, or `getMinStartDateFor12MonthWindow` in this task
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Apply new defaults and remove silent date mutations
  - [x] 2.1 Update the `useState<FormData>` initializer for `dateFrom` and `dateTo`
    - Replace `dateFrom: getMinStartDateFor12MonthWindow(today)` with `dateFrom: getStartOfCurrentYear()`
    - Set `dateTo: getTodayInputValue()` (drop the local `today` variable inside the initializer if it becomes unused)
    - Leave `species`, `province`, `city`, `barangay`, `facilityType` initial values exactly as they are
    - _Requirements: 1.1, 1.5, 3.1, 3.2, 6.2, 7.2_

  - [x] 2.2 Strip the four silent date clamps from `handleInputChange`
    - Remove the entire `if (field === 'dateTo')` block: the today-cap on `dateTo`, the `minStart` push-forward of `dateFrom`, and the `dateFrom > dateTo` back-pull
    - Remove the entire `if (field === 'dateFrom')` block: the `minStart` push-forward of `dateFrom`, the `dateTo = dateFrom` bump, and the today-cap on `dateTo`
    - Preserve the dropdown reset logic untouched: `field === 'province'` resets `city` and `barangay` to `'all'`; `field === 'city'` resets `barangay` to `'all'`
    - The handler must end with `setFormData(prev => { const newData = { ...prev, [field]: value }; /* dropdown resets only */ return newData; })` — no date branch should remain
    - Drop the now-unused local `today` constant from the handler if present
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.3 Remove `min` and `max` from both `<input type="date">` elements
    - On the Date From input, delete the `min={getMinStartDateFor12MonthWindow(formData.dateTo)}` and `max={formData.dateTo || getTodayInputValue()}` attributes
    - On the Date To input, delete the `min={formData.dateFrom}` and `max={getTodayInputValue()}` attributes
    - Keep `type="date"`, `value`, `onChange`, `className`, the surrounding label, and the calendar icon exactly as they are
    - Do not introduce `disabled` or `readonly`; neither is present today and neither is added
    - _Requirements: 2.1, 2.2, 5.5, 7.2_

  - [x]* 2.4 Optional cleanup: remove unused `getMinStartDateFor12MonthWindow`
    - Only proceed if no callsites remain after tasks 2.1, 2.2, and 2.3 land (current grep shows the helper is referenced exclusively from those four sites inside `src/app/admin/forecasting/page.tsx`)
    - If any other caller appears anywhere under `src/`, leave the helper in place and skip this sub-task
    - When removed, delete the helper definition only — do not touch `formatDateInputValue` or `getTodayInputValue`
    - _Requirements: 7.2_

- [x] 3. Harden `validateDateRange` for cleared inputs
  - [x] 3.1 Add an empty-input guard at the top of `validateDateRange`
    - Insert as the first statement of the function: `if (!formData.dateFrom || !formData.dateTo) { return { isValid: false, errorMessage: 'Error: End date must be after start date.' }; }`
    - Keep the rest of the function verbatim: the `endDate < startDate` check, the inclusive 12-month-span check with its existing message format, and the `{ isValid: true, errorMessage: '' }` success branch
    - Do not add a new error string — the design intentionally reuses the existing one
    - Do not modify the `useEffect` that calls `validateDateRange` on `[formData.dateFrom, formData.dateTo, formData.species]` or the `generateForecastForCurrentFilters` short-circuit on `validation.isValid`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Final checkpoint — manual verification of the 12 scenarios
  - Run each scenario from `design.md` § Testing Strategy against `/admin/forecasting` in a freshly reloaded browser session, with DevTools → Network open:
    1. Fresh mount this year: defaults render as `YYYY-01-01` (current year) and `Today_Local`; no validation message
    2. Year rollover: with the system clock mocked to Jan 2 of next year, hard reload — defaults become `(Y+1)-01-01` and the mocked `Today_Local`
    3. Edit Date From within range: Date To stays unchanged; no validation message
    4. Edit Date From past Date To (e.g. tomorrow): Date To stays unchanged; inline message reads `"Error: End date must be after start date."`
    5. Edit Date To freely (e.g. two weeks ahead): Date From stays unchanged; no validation message
    6. Edit Date To 13+ months past Date From: inline message reads `"Error: Date range cannot exceed 12 months. Current selection: {n} months."`
    7. Clear Date From: inline message reads `"Error: End date must be after start date."`; Network shows no `/api/distributions-data` request from the change
    8. Clear Date To: inline message reads `"Error: End date must be after start date."`; Network shows no `/api/distributions-data` request from the change
    9. Restore from cleared with a valid pair: validation message disappears
    10. Generate gated by error: while a validation message is showing, triggering forecast generation issues no `/api/distributions-data` request and leaves the existing chart / API-error UI unchanged
    11. Persistence across filters: editing species, province, city, barangay does not reset the user-edited Date From / Date To pair
    12. Reports page is unaffected: `/admin/reports` date defaults render exactly as before this change
  - Confirm the auto-refetch path still issues exactly one debounced `/api/distributions-data` call when Date To moves to a valid value after a forecast was already generated (see scenario 5 with auto-refetch active)
  - Ensure all scenarios pass; ask the user if questions arise.

## Notes

- Sub-tasks marked with `*` are optional and may be skipped without affecting correctness. Only 2.4 (helper cleanup) is optional.
- Property-based tests are intentionally not included: per `design.md` § Testing Strategy, the change is a UI default plus removed branches, with no general invariant to quantify over. Verification is the 12 manual scenarios in task 4.
- All implementation tasks (1.1, 2.1, 2.2, 2.3, 2.4, 3.1) modify the same file (`src/app/admin/forecasting/page.tsx`) and are therefore sequenced into separate waves to avoid edit conflicts.
- Each task references granular sub-requirements from `requirements.md` for traceability. Requirement 6.1 (persistence within a session) and Requirement 7.1 (no API/computation changes) are satisfied implicitly by leaving the existing state model and auto-refetch effect untouched, so they are not pinned to a specific task.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["2.4"] }
  ]
}
```
