## Goal
Fix `forecastedHarvestKilos` being saved as `0` when creating a Distribution by ensuring the backend:
1) calls the ML service with the correct request shape, and
2) extracts the correct forecast value from the ML response.

## Scope
- Edit backend only: `src/app/api/distributions-data/route.ts`
- Do not modify frontend pages, the ML service (FastAPI), or the forecasting chart code.

## Findings (Current Code)
- The extraction logic already reads `predictions[last].predicted_harvest` when `prediction.success === true`.
- However, the request payload currently includes `fingerlings`, which is not part of the FastAPI `/api/v1/predict` request schema and can cause a 422 / non-OK ML response, leaving `forecastedHarvestKilos = 0`.

## Plan
1. **Confirm ML endpoint and request contract**
   - Identify the configured ML URL used by the route (e.g., `ML_API_URL` env).
   - Align request payload to match the ML predict contract used by the forecasting chart: `species`, `province`, `city`, `barangay`, `dateFrom`, `dateTo`.

2. **Fix ML request payload in `POST /api/distributions-data`**
   - Remove `fingerlings` from `mlPayload`.
   - Keep the existing mapping `city: body.municipality` (unless logs show a mismatch).

3. **Make forecast extraction robust and aligned with time-series output**
   - Keep/ensure extraction uses the last item in the series:
     - `prediction?.predictions?.length`
     - `lastPrediction.predicted_harvest`
     - `forecastedHarvestKilos = Math.round(Number(...))` with finite/positive validation.
   - Keep/ensure fallback parsing for alternate schemas only if `predictions[]` is absent.

4. **Add safety fallback to prevent saving `0`**
   - After ML parsing, if forecast is missing/invalid:
     - `forecastedHarvestKilos = Math.round(body.fingerlings * 0.35)` (only when `fingerlings` is a valid positive number).

5. **Add temporary debug logging (server-side)**
   - Log the ML raw response (or parsed `prediction.predictions`) and the extracted forecast right before creating the distribution:
     - `ML predictions: ...`
     - `Extracted forecast: ...`
   - Ensure logs do not include secrets (only payload fields and response shapes).

6. **Persist the corrected value**
   - Confirm `forecastedHarvestKilos` is passed into `Distribution.create({ ... forecastedHarvestKilos })`.

## Verification Steps
- Create a new distribution with known inputs that previously produced `0`.
- Check server logs for:
  - `predictionResponse.ok === true`
  - `ML predictions` array populated
  - `Extracted forecast` matches the chart’s final value (e.g., ~603)
- Confirm the created Distribution record stores the non-zero `forecastedHarvestKilos`.

## Acceptance Checks
- Forecasting chart remains unchanged and still shows correct values.
- New distribution creation stores `forecastedHarvestKilos > 0` and matches the ML series’ last prediction.
- If ML fails/returns non-OK, a reasonable fallback value is stored instead of `0`.
