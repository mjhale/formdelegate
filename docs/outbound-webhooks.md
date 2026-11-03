# Outbound submission webhooks

Webhooks send a signed JSON POST to a receiver you configure. They are separate
from `callback_success_url`, which redirects the submitter's browser.

## Configuration

Use **Outbound webhooks** in the form editor, or provide `webhook_integrations`
through the authenticated form create/update API:

```json
{
  "form": {
    "webhook_integrations": [
      {
        "enabled": true,
        "url": "https://hooks.yourcompany.com/formdelegate",
        "signing_secret": "REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS"
      }
    ]
  }
}
```

Replace the sample hostname with your receiver's real public DNS hostname. A
form supports at most three webhooks. Each saved entry requires a URL and a
32–1024-character signing secret, including disabled entries. Generate and copy
a secret in the editor before saving, then configure the same secret at your
receiver. Secrets are not returned by the API; readback includes
`has_signing_secret` instead. On update, include the entry's `id` and omit
`signing_secret` to retain it. Supplying a new secret rotates it. An empty
`webhook_integrations` array removes all webhooks; omitting the property in an
API update preserves them.

Destinations must use HTTPS on port 443. Credentials in the URL, fragments, IP
literals, local/reserved hostnames, and private or special-use resolved addresses
are rejected. Paths and query strings are allowed. Enabled destinations are
resolved on save and before every delivery; all returned addresses must be
public. Delivery connects to the vetted IP while retaining the original Host,
TLS SNI, and certificate hostname checks. Redirects and environment proxies are
not followed. Disabled entries retain URL syntax validation so a receiver can
be disabled even if its DNS becomes unavailable or unsafe.

These checks constrain outbound network access. They do not challenge ownership
of the destination or establish that its application processed a submission.

## Event and signature

Only accepted or approved submissions are delivered. Review/spam states remain
held. The event type is `submission.received`, with this JSON shape:

```json
{
  "id": "SUBMISSION_UUID",
  "type": "submission.received",
  "form_id": "FORM_UUID",
  "submission": {
    "id": "SUBMISSION_UUID",
    "fields": {"message": "Please contact me"},
    "sender": "Example customer",
    "body": "Please contact me",
    "inserted_at": "2026-10-31T12:00:00Z",
    "updated_at": "2026-10-31T12:00:00Z"
  }
}
```

Headers:

- `X-FormDelegate-Id`: the stable submission/event UUID.
- `X-FormDelegate-Timestamp`: Unix seconds for this delivery attempt.
- `X-FormDelegate-Signature`: `v1=` followed by lowercase hex HMAC-SHA256.

Compute the HMAC over `timestamp + "." + raw_request_body` using the signing
secret. Verify the exact received bytes before parsing JSON, compare signatures
in constant time, and reject stale timestamps (for example, outside five
minutes). Store processed event IDs and make receiver-side processing idempotent.

## Delivery and retries

Any 2xx response acknowledges delivery; response bodies are not consumed.
Redirects, other statuses, network failures, and unsafe DNS changes fail the
attempt and use the existing job retry mechanism. DNS resolution has a five-second
deadline; a complete webhook attempt has a fifteen-second deadline.

Per-integration receipts skip known successful deliveries when another
integration fails. A receiver may accept a request just before a process or
database failure, so duplicates remain possible. This is not exactly-once
delivery. The existing public submission API also does not deduplicate retried
POSTs: separate stored submissions have separate event IDs.

Delivery receipts remain internal; the inbox's approval state is permission to
deliver, not proof of receiver acceptance. This change does not add a customer
interface for retrying exhausted jobs. No historical submission backfill is
performed by the migration.

## Migration and rollback

Apply the backend migration before using the frontend controls. Rolling this
migration down deletes webhook configurations, signing secrets, and their
delivery receipts; email integrations and their receipts are retained. Stop
workers and reconcile pending deliveries before a rollback. Recreating hooks
afterward gives them new integration IDs and can cause pending submissions to
be delivered again. PostgreSQL's now-unused `webhook` enum label remains.
