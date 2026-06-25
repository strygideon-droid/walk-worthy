# Walk Worthy Website — Version 4.0.1 Hotfix

This hotfix updates the existing Version 4 website. It does not require another Supabase migration and does not change or delete any saved study data.

## Fixes included

- Mobile sidebar now scrolls correctly and keeps the complete account panel and `Walk Worthy v4.0.1` label visible.
- Dashboard hero uses the approved detailed bare-footprint design: connected sole and heel, textured prints, larger first steps, a winding path, and gradual shrinking/fading toward the upper-right.
- **Unique Keywords Used** now counts normalized keyword names connected to passages, ignoring duplicate records, capitalization differences, and extra spaces.
- Dashboard and Insights keyword rankings also merge duplicate keyword names and count unique passage connections.
- Browse Passages filters use a responsive two-row layout on wider screens and stack cleanly on smaller screens, so labels are not cut off.
- Both Insights ranking popups now match the original blue-and-gold graph design.
- The conditional NIV **Load now / Retry passage** behavior remains unchanged and appears only when needed.

## Update steps

1. Download a fresh JSON backup from Walk Worthy.
2. Extract this ZIP.
3. Upload and replace these files in the existing GitHub repository:
   - `api/`
   - `app.js`
   - `index.html`
   - `package.json`
   - `styles.css`
   - `vercel.json`
4. Commit the changes to `main`.
5. Vercel should deploy automatically.
6. Open the normal Walk Worthy website and hard-refresh once.

## Important

- Do **not** run the Version 4 SQL migration again for this hotfix.
- Your existing Supabase database, passages, keywords, comments, favourites, and Jesus Creed data remain unchanged.
