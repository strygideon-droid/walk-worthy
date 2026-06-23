# Walk Worthy Cloud v2

This package is ready for GitHub and Vercel.

## Included
- Supabase email login and cloud sync
- Automatic NIV display through a server-side Vercel function
- Quick entry: passage → keywords → one comment
- Exact duplicate and overlapping-passage warnings
- Search, favourites, keywords, and insights
- JSON backup/restore and CSV export
- API.Bible FUMS view reporting

## Vercel environment variables
Add these exact names before deploying:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `API_BIBLE_KEY`

Optional: `API_BIBLE_ID`. The default is the NIV Bible ID.

Never use a Supabase secret or service-role key.

## Deployment
1. Unzip this package.
2. Create a new private GitHub repository called `walk-worthy`.
3. Upload the actual files and the `api` folder. Do not upload only the ZIP.
4. In Vercel choose Add New → Project and import the GitHub repository.
5. Framework preset: Other.
6. Add the three environment variables above.
7. Deploy.
8. Copy the final `.vercel.app` URL.
9. In Supabase open Authentication → URL Configuration.
10. Set Site URL to the Vercel URL and add the same URL under Redirect URLs.
11. Open the app, create your account, confirm your email, and sign in.

The app stores references and your own notes. NIV wording is fetched when shown and is not included in database exports.
