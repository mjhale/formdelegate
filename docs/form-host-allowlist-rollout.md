# Form Host Allowlist Rollout

This runbook activates host restrictions without changing existing forms implicitly. Publishing,
deploying, migrating, and changing a production form each require their own current approval.

## 1. Deploy the additive release

1. Publish immutable API and web image tags for the same reviewed revision.
2. Run the production deployment workflow with migrations enabled.
3. Verify the API is healthy before using the new form controls.
4. Confirm the migration default with a read-only query:

   ```sql
   SELECT submission_source_policy, count(*)
   FROM forms
   GROUP BY submission_source_policy;
   ```

   Every pre-existing form must remain `unrestricted`. A nonempty legacy `hosts` array must not
   activate enforcement.

5. Audit legacy host values before an owner activates restrictions. This read-only query identifies
   values that need to be re-saved through the editor; application validation remains authoritative:

   ```sql
   SELECT id, hosts
   FROM forms
   WHERE hosts IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM unnest(hosts) AS host
       WHERE host IS NULL
          OR host = ''
          OR host <> lower(btrim(host))
          OR host ~ '://|/|[?#@]'
     );
   ```

6. Submit to an existing unrestricted form without `Origin` or `Referer` and confirm it is still
   accepted.

## 2. Activate the contact-form canary

1. Resolve the current contact form ID from the deployed `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`; do
   not reuse a recorded UUID without checking the deployed configuration.
2. In the authenticated form editor, save `www.formdelegate.com` as the allowed host while leaving
   the policy unrestricted. Read the form detail screen back and verify the saved rule.
3. With fresh approval for the public behavior change, switch that form to `restricted`.
4. Submit through the real contact page and verify the final response is 2xx, the submission exists,
   billing increments once, and its configured delivery runs once.
5. Send a JSON request with `Origin: https://not-allowed.invalid` and verify:
   - HTTP status is 403.
   - `error.type` is `SUBMISSION_SOURCE_NOT_ALLOWED`.
   - No submission, attachment, billing increment, email, or integration job appears.
   - Application logs contain `submission source rejected` with `host_mismatch` metadata.
6. Repeat without `Origin` and `Referer`; verify the same 403 and a `missing_source` telemetry reason.

Do not log or retain the rejected form fields, uploaded content, full referrer URL, or IP address.

## 3. Observe and expand

Monitor the contact canary for 24 hours. Any unexpected denial from the allowed site, missing
delivery, duplicate delivery, or quota discrepancy fails the canary and requires immediate rollback.

After a clean 24-hour contact canary:

1. Repeat the same procedure for the support form.
2. Monitor it for another 24 hours.
3. Leave every other form unrestricted until its owner explicitly reviews its hosts and enables the
   policy. Do not bulk-activate existing forms.

## 4. Roll back

The first-line rollback is per form:

1. Set `submission_source_policy` back to `unrestricted` without deleting saved hosts.
2. Read the form back and verify the effective policy is unrestricted.
3. Submit with missing source headers and verify normal acceptance.

If the release itself must be rolled back, retain the additive database column and constraint; older
application code ignores them. Do not reverse the migration during an application rollback unless a
separate database change is reviewed and explicitly approved.

## Limitations

- Browser `Origin` and `Referer` checks deter cross-site browser use but can be forged by direct HTTP
  clients.
- CORS controls response visibility and does not replace server-side source enforcement.
- Exact page restrictions are deferred because cross-origin referrer paths are not reliable.
