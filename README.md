# Walk Worthy Website — Version 3

This is a website update for the existing Walk Worthy Vercel project. It is **not** an installable app/PWA.

## Version 3 features

- Action-focused keyword suggestions after the NIV passage and Do/Don't choice
- Suggestions focus on how Christians should live, not merely general words in the passage
- Study Snapshot moved to the top of Insights
- Compact Browse Passage cards
- Comments hidden from Browse cards
- Full NIV text, classifications, keywords, and optional comment in an in-app popup
- Non-consecutive verses such as `12,15` and mixed selections such as `12-13,15`
- Comments are optional
- Dashboard wording changed to **Keywords Used**
- Recent Passages shows keywords instead of comments
- Jesus Creed checkbox with Love God / Love Others / Both
- Dedicated Jesus Creed visual page with clickable verse bubbles
- Existing login, cloud sync, JSON backup, CSV export, duplicate protection, and mobile browser access remain

## Important update order

1. Keep the JSON backup you already downloaded.
2. Run `SQL_MIGRATION_v3.sql` in Supabase SQL Editor.
3. Upload the website files to the existing GitHub `walk-worthy` repository.
4. Commit the changes to the `main` branch.
5. Vercel should redeploy automatically.
6. When Vercel shows **Ready**, open the existing website address and press `Ctrl + F5` once.

## Files to upload to GitHub

Upload these files and folders from this package:

- `api/`
- `app.js`
- `index.html`
- `package.json`
- `styles.css`
- `vercel.json`

You do not need to upload the SQL migration to GitHub. It is only run once in Supabase.

## Data safety

The migration adds new columns and a new save function. It does not delete existing passages, keywords, or passage-keyword connections.

Existing passages are automatically converted into Version 3's verse-segment format.

## Keyword suggestions

Suggestions are generated inside the website from the NIV wording and your Do/Don't selection. They are never selected automatically. A suggested keyword is created only when you click it.

## Website only

This package deliberately contains no app manifest, service worker, install prompt, app icons, or offline mode.
