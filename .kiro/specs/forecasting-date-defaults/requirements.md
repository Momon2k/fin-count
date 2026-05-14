# Requirements Document

## Introduction

The Forecasting page (`src/app/admin/forecasting/page.tsx`) exposes a "Forecasting Parameters" panel with two date inputs, **Date From** and **Date To**, that drive the harvest forecast query. Today, **Date From** defaults to the first day of the month twelve months before the current date (e.g., `2025-06-01` when today is `2026-05-14`), and **Date To** defaults to today but is constrained by a rolling 12-month window plus a `max=today` cap. The combined effect is that **Date To** behaves as if it were disabled: changes to **Date From** can silently move it, and the user cannot push it past today.

This feature redefines the default values and editability of these two fields so administrators can:

1. See a **Date From** default that anchors to the start of the current calendar year and rolls forward automatically each year.
2. Freely edit **Date To** without it being silently clamped or locked by the date-from change handler.

The forecasting query, the API contract, the validation envelope (Date From must be on or before Date To, range cannot exceed 12 months), and the visual layout of the page are out of scope.

## Glossary

- **Forecasting_Page**: The admin route at `src/app/admin/forecasting/page.tsx` that renders the Forecasting Parameters panel.
- **Date_From_Input**: The `<input type="date">` labeled "Date From" inside the Forecasting Parameters panel.
- **Date_To_Input**: The `<input type="date">` labeled "Date To" inside the Forecasting Parameters panel.
- **Current_Year**: The four-digit calendar year of the user's local system clock at the moment `Forecasting_Page` first mounts.
- **Start_Of_Current_Year**: January 1 of `Current_Year`, formatted as `YYYY-01-01`.
- **Today_Local**: The user's local current date, formatted as `YYYY-MM-DD`.
- **Date_Range_Validator**: The existing client-side check that requires Date From ≤ Date To and a span of no more than 12 inclusive months.
- **Forecast_Request**: The outbound `/api/distributions-data` request triggered when the user generates or auto-refreshes a forecast.

## Requirements

### Requirement 1: Date From defaults to the start of the current year

**User Story:** As an administrator opening the Forecasting page, I want **Date From** to default to January 1 of the current year, so that my forecast view is anchored to a familiar year-to-date window without manual adjustment.

#### Acceptance Criteria

1. WHEN the `Forecasting_Page` mounts for the first time in a session, THE `Forecasting_Page` SHALL initialize `Date_From_Input` to `Start_Of_Current_Year`.
2. WHEN the system clock crosses into a new calendar year between two mounts of the `Forecasting_Page`, THE `Forecasting_Page` SHALL recompute `Start_Of_Current_Year` so that the next mount uses January 1 of the new year as the `Date_From_Input` default.
3. THE `Forecasting_Page` SHALL format the `Date_From_Input` default as a `YYYY-MM-DD` string compatible with HTML `<input type="date">` value semantics.
4. WHILE the user remains in the same session on the `Forecasting_Page` after manually changing `Date_From_Input`, THE `Forecasting_Page` SHALL preserve the user's chosen value and SHALL NOT reset it back to `Start_Of_Current_Year`.
5. WHEN the `Forecasting_Page` mounts and no manual change to `Date_From_Input` exists from a prior mount of the same component instance, THE `Forecasting_Page` SHALL initialize `Date_From_Input` to the `Start_Of_Current_Year` value computed at that mount.

### Requirement 2: Date To remains user-editable

**User Story:** As an administrator generating a forecast, I want **Date To** to remain editable at all times, so that I can extend or shorten the forecast window without the field locking or snapping back.

#### Acceptance Criteria

1. THE `Forecasting_Page` SHALL render `Date_To_Input` without the HTML `disabled` or `readonly` attributes.
2. WHEN the user opens the native date picker for `Date_To_Input`, THE `Forecasting_Page` SHALL keep the picker enabled and SHALL allow selection of any date that satisfies `Date_Range_Validator`.
3. WHEN the user edits `Date_From_Input`, THE `Forecasting_Page` SHALL leave the current `Date_To_Input` value unchanged as long as it satisfies `Date_Range_Validator`.
4. IF a change to `Date_From_Input` causes the existing `Date_To_Input` value to violate `Date_Range_Validator`, THEN THE `Forecasting_Page` SHALL display the corresponding inline validation message and SHALL leave `Date_To_Input` editable so the user can correct it.

### Requirement 3: Date To default value

**User Story:** As an administrator opening the Forecasting page, I want **Date To** to start at a sensible default that pairs with the new Date From, so that I see a meaningful range without configuring every field.

#### Acceptance Criteria

1. WHEN the `Forecasting_Page` mounts for the first time in a session, THE `Forecasting_Page` SHALL initialize `Date_To_Input` to `Today_Local`.
2. IF `Today_Local` is earlier than `Start_Of_Current_Year` (which cannot occur under normal clocks but is included for completeness), THEN THE `Forecasting_Page` SHALL initialize `Date_To_Input` to `Start_Of_Current_Year`.
3. WHERE the user has manually changed `Date_To_Input` during the current session, THE `Forecasting_Page` SHALL preserve the user's chosen value and SHALL NOT reset it on subsequent re-renders of the same session.

> Resolved during requirements review: Date To defaults to **today** (`Today_Local`). The "December 31 of current year" and "+12 months from Date From" alternatives were considered and rejected to keep the change minimal and preserve the existing year-to-date framing.

### Requirement 4: Validation and range constraints are preserved

**User Story:** As an administrator, I want the existing date validation rules to keep guarding the forecast query, so that invalid ranges still surface clear feedback.

#### Acceptance Criteria

1. IF `Date_From_Input` is later than `Date_To_Input`, THEN THE `Forecasting_Page` SHALL display the message `"Error: End date must be after start date."` and SHALL NOT issue a `Forecast_Request`.
2. IF the inclusive month span between `Date_From_Input` and `Date_To_Input` exceeds 12, THEN THE `Forecasting_Page` SHALL display a message that names the current span in months and SHALL NOT issue a `Forecast_Request`.
3. WHEN both date inputs hold values that satisfy `Date_Range_Validator`, THE `Forecasting_Page` SHALL clear any prior date-range validation message.
4. THE `Forecasting_Page` SHALL apply `Date_Range_Validator` using the same 12-month inclusive rule already in use, without expanding or shrinking the allowed span as part of this feature.

### Requirement 5: Empty or invalid input handling

**User Story:** As an administrator, I want the date inputs to behave predictably when I clear them or type an invalid value, so that I am never stuck with a frozen form.

#### Acceptance Criteria

1. IF the user clears `Date_From_Input`, THEN THE `Forecasting_Page` SHALL display the standard date-range validation message and SHALL NOT issue a `Forecast_Request` until a valid value is supplied.
2. IF the user clears `Date_To_Input`, THEN THE `Forecasting_Page` SHALL display the standard date-range validation message and SHALL NOT issue a `Forecast_Request` until a valid value is supplied.
3. WHEN the user supplies a previously cleared value with a date that satisfies `Date_Range_Validator`, THE `Forecasting_Page` SHALL clear the date-range validation message.
4. WHEN the user supplies a value to a previously cleared `Date_From_Input` or `Date_To_Input` that violates `Date_Range_Validator`, THE `Forecasting_Page` SHALL update the validation message to describe the specific violation produced by the new value.
5. THE `Forecasting_Page` SHALL keep both `Date_From_Input` and `Date_To_Input` editable while a date-range validation message is displayed.

### Requirement 6: Persistence across navigation within the session

**User Story:** As an administrator, I want my chosen date range to remain stable while I work on the forecasting page, so that I do not lose context after generating a forecast or interacting with other filters.

#### Acceptance Criteria

1. WHILE the user remains on the `Forecasting_Page` without a full page reload, THE `Forecasting_Page` SHALL continuously retain the current `Date_From_Input` and `Date_To_Input` values across forecast generations, filter changes (species, province, city, barangay), and re-renders, without resetting them to defaults at any point during the session.
2. WHEN the user reloads the `Forecasting_Page` or navigates away and returns, THE `Forecasting_Page` SHALL re-initialize `Date_From_Input` and `Date_To_Input` to the defaults defined in Requirements 1 and 3.
3. THE `Forecasting_Page` SHALL NOT introduce any new persistent storage (localStorage, cookies, server state) for date values as part of this feature.

### Requirement 7: Non-goals

**User Story:** As a maintainer, I want the scope of this change to stay narrow, so that unrelated forecasting behavior is not disturbed.

#### Acceptance Criteria

1. THE `Forecasting_Page` SHALL leave the forecast computation, the `/api/distributions-data` request shape, and the response handling unchanged by this feature.
2. THE `Forecasting_Page` SHALL leave the layout, labels, icons, and styling of the Forecasting Parameters panel unchanged except for the default values and editability of the two date inputs.
3. THE `Forecasting_Page` SHALL NOT change the date-input behavior of any other admin page, including `src/app/admin/reports/page.tsx`.
