---
description: Test that the Google Sheets quoting engine is working correctly
---

# Test Quoting Engine

1. Make sure the dev server is running (see /dev workflow)

2. Open the Live Transfer script at http://localhost:5173/live.html

3. Fill in prospect data:

   - Age: 65
   - Gender: Female
   - Tobacco: No

4. Navigate to the quote calculation node

5. Verify:

   - Rates are fetched from Google Sheets
   - Annual fees and rates display correctly (no NaN or $0.00)
   - Carrier logos appear
   - Quotes are sortable

6. If quotes show $0.00 or errors:
   - Check browser console for API errors
   - Verify Google Sheet is publicly shared
   - Confirm the Sheet ID in `.env` is correct
