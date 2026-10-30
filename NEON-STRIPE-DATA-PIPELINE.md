

## Optional Stripe billing data with Neon

This branch adds a **read-only application helper** for querying Stripe Data Pipeline tables mirrored into Neon. It does not create charges, subscriptions, refunds, payouts, or transfers.

### Provision the data pipeline

1. Create or select a Neon project and database in the Neon Console.
2. In the Stripe Dashboard, open **Data Pipeline**, choose Neon as the destination, select the Neon project, and create a pipeline.
3. Select only the Stripe tables needed by the app. Start with `customers`, `subscriptions`, and `invoices`.
4. Wait for Stripe's initial backfill and confirm that the tables are present in the `stripe` schema in Neon.
5. Add the Neon connection string as `DATABASE_URL` in `apps/web/.env.local` for local testing and as a server-side environment variable in the hosting platform. Never use a `NEXT_PUBLIC_` prefix and never commit the connection string.
6. Install dependencies with `npm install`.

Stripe's Data Pipeline is configured in the Stripe Dashboard; repository code cannot create or authorize that external pipeline. Availability and preview terms are controlled by Stripe.

### Code added

- `lib/billing/stripe-data.ts` uses Neon's serverless SQL driver and parameterized queries.
- It exposes read-only helpers for a customer's active/trialing subscription and recent invoices.
- The caller must supply a Stripe customer ID obtained from a **verified server-side authentication/session-to-customer mapping**. Never accept an arbitrary customer ID from a browser request.
- This repository branch does not yet have a verified user-authentication/customer-mapping layer, so these helpers are intentionally not exposed through a public API route and do not unlock paid features.
- Do not use mirrored Stripe data as the sole authority for payment execution or entitlement decisions until identity mapping, access controls, and reconciliation are implemented and tested.

### Safety boundary

No Stripe secret key is required for Data Pipeline reads. The Neon connection string is server-only. This integration is read-only and does not touch wallet signing, blockchain RPC, or funds movement.
