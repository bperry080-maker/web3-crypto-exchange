import { neon } from '@neondatabase/serverless';

const CUSTOMER_ID = /^cus_[A-Za-z0-9]+$/;

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured on the server.');
  }
  return neon(connectionString);
}

function assertCustomerId(customerId: string) {
  if (!CUSTOMER_ID.test(customerId)) {
    throw new Error('A valid Stripe customer ID is required.');
  }
}

/**
 * Read the current subscription snapshot mirrored by Stripe Data Pipeline.
 *
 * IMPORTANT: customerId must come from a verified server-side identity mapping.
 * Never pass a customer ID supplied directly by an unauthenticated browser.
 */
export async function getStripeSubscriptionSnapshot(customerId: string) {
  assertCustomerId(customerId);
  const sql = getSql();

  const rows = await sql`
    SELECT
      status,
      cancel_at_period_end,
      current_period_end,
      items -> 'data' -> 0 -> 'price' ->> 'lookup_key' AS plan_lookup_key
    FROM stripe.subscriptions
    WHERE customer = ${customerId}
      AND status IN ('active', 'trialing')
    ORDER BY created DESC
    LIMIT 1
  `;

  return rows[0] ?? null;
}

/**
 * Read recent invoice metadata for a Stripe customer.
 * Invoice URLs are private customer billing data; only return them to the
 * authenticated owner after a server-side identity-to-customer lookup.
 */
export async function getStripeInvoiceHistory(customerId: string) {
  assertCustomerId(customerId);
  const sql = getSql();

  return sql`
    SELECT
      number,
      status,
      amount_due,
      amount_paid,
      currency,
      hosted_invoice_url,
      created
    FROM stripe.invoices
    WHERE customer = ${customerId}
    ORDER BY created DESC
    LIMIT 12
  `;
}
