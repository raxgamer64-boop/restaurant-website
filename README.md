# Dutta Restaurant — Premium Website + Admin

## Public website
Open `index.html`.

## Owner dashboard
Open `admin.html`.
Demo PIN: `2026`

The dashboard lets the owner edit restaurant info, homepage copy, menu items/prices, gallery URLs, export a content backup, and reset demo content. Changes are stored in the browser without replacing website files.

## Important production note
This version has a browser-local content store so it can be tested immediately without requiring a backend account. For a real client handoff where the owner can update the site from any phone/computer, connect the same data model to Firebase Firestore or Supabase and add real authentication. The public site should never contain admin credentials.

## Sample data
Some dishes, prices, address, hours and stock photography are deliberately sample content and should be replaced with the owner's approved information before publishing.
