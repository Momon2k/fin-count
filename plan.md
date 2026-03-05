## Goal
Replace blocking browser alerts in the “New Fingerling Distribution” modal with a non-blocking inline error panel that shows user-friendly messages (especially for ML forecast failures), without changing backend logic.

## Scope
- Edit frontend only: `src/app/admin/distribution/page.tsx`
- Do not change backend routes, ML service, or `/api/predict`

## Plan
1. Add a new submission error state in the “New Fingerling Distribution” modal component:
   - `const [submitError, setSubmitError] = useState<string>("")`

2. Clear the submission error when the user edits any form field:
   - In `handleInputChange(...)`, call `setSubmitError("")` before/alongside updating `formData`

3. Reset the submission error before submitting:
   - At the beginning of `handleSubmit`, call `setSubmitError("")`

4. Replace `alert(...)` calls with `setSubmitError(...)`:
   - When `result.success` is false:
     - If `response.status === 502` OR `result.error` contains forecast-related text, set:
       - `Harvest forecast could not be generated due to insufficient historical data. Please verify the location or try again later.`
     - Otherwise set:
       - `result.error || "Unable to save distribution. Please try again."`
   - In the `catch` block:
     - Keep `console.error(...)` for debugging
     - Set:
       - `An unexpected error occurred while saving the distribution. Please try again.`

5. Render the inline error panel inside the modal UI, directly under the “Additional Details” textarea section:
   - Use consistent styling (matching the Forecasting page’s inline warning pattern)
   - Show it only when `submitError` is non-empty

6. Prevent double submission:
   - Ensure the submit button is disabled while `isSubmitting` is true
   - Keep existing loading UI behavior (if any) consistent

## Acceptance Checks
- Trigger an ML-related failure (e.g., backend returns 502): no browser popup; inline panel shows the exact specified message.
- Trigger a non-ML failure: inline panel shows a friendly fallback message.
- Change any field after an error: inline panel disappears.
- Re-submit after an error: old message does not persist.
- Successful save: no inline error shown.
