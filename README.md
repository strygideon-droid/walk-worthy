# Walk Worthy Website — Version 4

Version 4 updates the existing Walk Worthy website. It keeps the same Vercel address, Supabase project, login, and saved study data.

## Version 4 updates

### Add Passage
- Smarter action-focused keyword suggestions
- Suggestions are separated into:
  - **Suggested existing keywords**
  - **Possible new keywords**
- Wider recognition of biblical commands and warnings, including phrases such as testing God, worry, retaliation, pride, quarrelling, idolatry, drunkenness, and guarding speech
- The large NIV loading button is removed
- Passages still load automatically
- A small **Load now / Retry passage** button appears only while a reference has changed or loading fails

### Browse Passages
- New Jesus Creed filter:
  - Jesus Creed only
  - Love God
  - Love Others
  - Both
  - Not Jesus Creed
- Older single-verse entries are recognised automatically instead of showing an invalid-reference error

### Dashboard
- New clickable Jesus Creed tally
- Approved gold footprint trail in the dashboard hero
- Connected bare footprints with no heel-separation line
- Winding path, larger first steps, and gradual shrinking/fading toward the upper-right

### Insights
- **Unique Keywords Used** now explicitly counts distinct connected keywords
- Top Keywords shows only the top 10 on the main page
- Books Referenced shows only the top 10 on the main page
- Clicking either panel opens the full ranked list in an in-app popup

### Keywords
- Every keyword has an **Edit** button
- Correct spelling or rename a keyword
- Change its theme/category
- All existing passage connections remain intact

### Sidebar
- Displays **Walk Worthy v4.0** near the account section

## Safe update order

1. Download a fresh JSON backup from the current website.
2. Run `SQL_MIGRATION_v4.sql` in Supabase SQL Editor.
3. Upload the replacement website files to the existing GitHub repository.
4. Commit to `main`.
5. Wait for Vercel to show the new deployment as **Ready**.
6. Open the normal Walk Worthy URL and press `Ctrl + F5` once.

## Files to upload to GitHub

Upload and replace:

- `api/`
- `app.js`
- `index.html`
- `package.json`
- `styles.css`
- `vercel.json`

Do not upload the ZIP itself. `SQL_MIGRATION_v4.sql` is run once in Supabase and does not need to be uploaded to GitHub.

## Data safety

The SQL migration only repairs the API.Bible reference format used by older single-verse entries. It does not delete passages, comments, keywords, favourites, classifications, Jesus Creed settings, or passage-keyword links.
