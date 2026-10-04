# Datta Restaurant Website

A GitHub Pages compatible restaurant website connected to Supabase.

## Included
- Live menu loaded from Supabase
- Admin menu management (add, edit, hide/show, delete)
- Customer registration and login
- Role-based admin access
- Cart and quantity controls
- UPI deep-link and QR checkout
- Order records in Supabase
- WhatsApp order flow
- Table and private-room booking records
- Admin dashboard for orders, bookings, customers and revenue

## Important
Run `supabase-setup.sql` in the Supabase SQL Editor if the database tables/policies are not already configured. Add the restaurant's real menu items from the Admin Panel; unavailable items are not shown on the public website.

UPI payment is not automatically verified by a static GitHub Pages site. The restaurant should verify payment in its UPI/bank app and then confirm the order.
