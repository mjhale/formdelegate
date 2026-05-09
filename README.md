# Form Delegate

[Form Delegate](https://formdelegate.com) is a service that allows users to process and manage HTML form submissions.
It is ideal for static websites and in situations where form processing requires considerable
effort.

Using this service requires signing up for an account and creating an endpoint for your
submissions. Your generated endpoint will look similar to:

`https://formdelegate.com/submissions/6b7bed67-adc5-44cb-ac9d-e37aa1943735`

As an example of using Form Delegate, consider this existing HTML form:

```
<form action="https://www.cdc.gov/DCS/" method="post">
    <input name="Subject" placeholder="Enter a subject" required="required" type="text" value="" />

    <select name="From" required="required">
      <option value="0">Select:</option>
      <option value="1">Clinician</option>
      <option value="2">Media</option>
      <option value="3">Educator</option>
      <option value="4">General Public</option>
    </select>

    <textarea name="Question" cols="60" maxlength="2000" required="required" rows="6" title="Question"></textarea>
  </form>
```

To use this form with Form Delegate, replace the first line with:

```
<form action="https://formdelegate.com/submissions/6b7bed67-adc5-44cb-ac9d-e37aa1943735" method="post">
```

And that's it. You can configure your endpoint to automatically send an email when a new submission is
received, and you can also set up integration hooks with services such as Zapier. Submissions are
automatically filtered for spam via [Akismet](https://akismet.com/).

## TODO

- Integrate Stripe payments into frontend
- Refactor notification and alert system

## Email Provider Verification (BYO Credentials)

Form email integrations now require user-owned provider credentials.
Integrations are verified against the configured provider before they can become `verified`.

### Supported Providers

- `smtp`
- `postmark`
- `sendgrid`

### Form Create/Update Verification Trigger

When creating/updating forms with enabled email integrations, set:

- `email_provider_status: "pending_verification"`
- `verify_provider: true`

The backend will verify credentials during the same request and either:

- Persist integration with `email_provider_status: "verified"` and `email_provider_last_verified_at`
- Return `400` with typed verification error and roll back the mutation

### Manual Verification Endpoint

Authenticated users can verify an integration directly:

- `POST /v1/forms/:form_id/email_integrations/:id/verify`

Successful response returns the updated integration with:

- `email_provider_status`
- `email_provider_last_verified_at`

### Verification Error Types

`400` responses use one of:

- `UNSUPPORTED_EMAIL_PROVIDER`
- `EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CREDENTIALS`
- `EMAIL_PROVIDER_VERIFICATION_FAILED_CONNECTION_FAILED`
- `EMAIL_PROVIDER_VERIFICATION_FAILED_INVALID_CONFIGURATION`
- `EMAIL_PROVIDER_VERIFICATION_FAILED_UNSUPPORTED_AUTH_METHOD`
- `EMAIL_PROVIDER_VERIFICATION_FAILED_UNKNOWN`

## Local Development

Form Delegate uses Elixir and [Phoenix](http://www.phoenixframework.org/) for the API, JavaScript and [React](https://reactjs.org/) for the frontend, and [Postgres](https://www.postgresql.org/) for the database.

To install the necessary dependencies on your machine:

- _Recommended: Install [asdf-vm](https://github.com/asdf-vm/asdf) to manage versions of [Erlang](https://github.com/asdf-vm/asdf-erlang), [Elixir](https://github.com/asdf-vm/asdf-elixir), and [Node.js](https://github.com/asdf-vm/asdf-nodejs)._
- Install Erlang: `asdf install erlang 26.2.4`
- Install Elixir\*: `asdf install elixir 1.16.2-otp-26`
- Install Node.js: `asdf install nodejs latest`
- Install Postgres (see the [official installation instructions](https://www.postgresql.org/download/))

_\* By default, asdf-vm will install Elixir with a binary compiled for the oldest OTP release supported
by that version. To get the benefits of a more recent OTP you must specify which OTP you would like to
use._

**To start the Phoenix app:**

- Install dependencies with `mix deps.get`
- Create and migrate your database with `mix ecto.create && mix ecto.migrate`
- Ensure the [necessary environment variables](./.sample.env) are set via `source .env`
- Start the Phoenix endpoint with `mix phx.server`
- Start a local Stripe listener with `stripe listen --forward-to localhost:4000/webhooks/stripe --api-key sk_test_...`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

You can also download
our [Postman collection of API actions](./.postman_collection.json) and [import it into your environment](https://learning.postman.com/docs/postman/collections/importing-and-exporting-data/#importing-data-into-postman). Alternatively, you can open our
collection by following this link:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/e7b20dafc2a25c1f5d20)

**To start the React app:**

- Install dependencies with `npm install --prefix ./assets`
- Start the React development server with `npm run dev --prefix ./assets`

Now you can visit [`localhost:3000`](http://localhost:3000) from your browser.

## Running Your Own Instance

Form Delegate is self-hosted with container images. The Phoenix API and Next.js frontend are
published as separate images and are intended to run behind a reverse proxy such as Traefik.

The runtime stack should include:

- The Phoenix API container, published as `ghcr.io/mjhale/formdelegate-api`
- The Next.js frontend container, published as `ghcr.io/mjhale/formdelegate-web`
- Postgres for application data
- A reverse proxy for HTTPS, routing, compression, and redirects
- An S3-compatible object storage service for submission files

Additionally, Form Delegate uses the following services:

- [Akismet](https://akismet.com/) for spam detection

- [hCaptcha](https://www.hcaptcha.com/) for serving CAPTCHAs

- [Amazon S3](https://aws.amazon.com/s3/) for block storage of submission files

- [Postmark](https://postmarkapp.com/) for transactional email delivery

_Note: Production domains, CORS origins, frontend URLs, and public form endpoints must match your
own deployment. Update environment variables rather than reusing the official Form Delegate domains._

### Container Environment

Set the API container environment from your Compose stack or container orchestrator:

- `DATABASE_URL`
- `POOL_SIZE`
- `SECRET_KEY_BASE`
- `GUARDIAN_SECRET`
- `POSTMARK_API_KEY`
- `AKISMET_API_KEY`
- `HCAPTCHA_SECRET_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_SCHEME`
- `AWS_S3_HOST`
- `AWS_S3_BUCKET`
- `AWS_S3_ASSET_HOST`
- `STRIPE_SECRET`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `PHX_HOST`
- `PORT`

Build the frontend image with the public Next.js environment values for your deployment:

- `NEXT_PUBLIC_API_HOST`
- `NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT`
- `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`
- `NEXT_PUBLIC_CAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_DEPLOYMENT_ENV`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### First Run

Run database migrations before starting traffic against the API:

```bash
docker compose run --rm api /app/bin/migrate
```

Then start the stack:

```bash
docker compose up -d
```

Set up your initial data via a remote shell in the API container:

```bash
docker compose exec api /app/bin/form_delegate remote
```

Then run:

```
team = FormDelegate.Repo.insert!(%FormDelegate.Teams.Team{})
```

```
FormDelegate.Repo.insert!(%FormDelegate.Accounts.User{
  name: "Your Name",
  email: "hello@yourname.com",
  password_hash: Pbkdf2.hash_pwd_salt("a randomly generated password"),
  confirmed_at: DateTime.utc_now(),
  team: team,
  is_admin: true
})
```

```
FormDelegate.BillingCounts.create_billing_count(%FormDelegate.BillingCounts.BillingCount{}, %{
  team_id: team.id
})
```

```
FormDelegate.Repo.insert!(%FormDelegate.Plans.Plan{
  name: "Free",
  limit_submissions: 100,
  limit_forms: 5,
  limit_storage: 1000000000,
  # Replace with your Stripe product ID
  stripe_product_id: ""
})
```

### Deployment Checklist

- Route the frontend domain to the web container.
- Route the API domain to the API container.
- Configure Stripe webhooks to post to `/webhooks/stripe` on the API domain.
- Allow your production frontend origins in `CORS_ORIGINS`.
- Configure hCaptcha allowed domains.
- Configure Postmark sender/domain authentication.
- Confirm S3 upload and asset URLs work.
- Back up Postgres and your object storage bucket.

## Publishing Container Images

The API and web containers are published to GHCR as multi-architecture images for `linux/amd64`
and `linux/arm64`.

Log in to GHCR with a GitHub personal access token that has `write:packages` access:

```bash
podman login ghcr.io
```

If local `latest` tags already exist as regular images or stale manifests, remove them first:

```bash
podman rmi ghcr.io/mjhale/formdelegate-api:latest 2>/dev/null || true
podman rmi ghcr.io/mjhale/formdelegate-web:latest 2>/dev/null || true
podman manifest rm ghcr.io/mjhale/formdelegate-api:latest 2>/dev/null || true
podman manifest rm ghcr.io/mjhale/formdelegate-web:latest 2>/dev/null || true
```

Build both architectures into local manifest lists:

```bash
podman build \
  --platform linux/amd64,linux/arm64 \
  --manifest ghcr.io/mjhale/formdelegate-api:latest \
  .

podman build \
  --platform linux/amd64,linux/arm64 \
  --manifest ghcr.io/mjhale/formdelegate-web:latest \
  --build-arg NEXT_PUBLIC_API_HOST=https://api.formdelegate.com \
  --build-arg NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT=https://www.formdelegate.com/f/ce88c8f2-f9a2-4e59-b3d5-72d69e4eb17c \
  --build-arg NEXT_PUBLIC_CONTACT_FORM_ENDPOINT=https://www.formdelegate.com/f/7c052c73-c5e2-488c-bead-4625b6a7c8d7 \
  --build-arg NEXT_PUBLIC_CAPTCHA_SITE_KEY=d60280d0-5ee7-4371-8a16-070cb0dc5297 \
  --build-arg NEXT_PUBLIC_DEPLOYMENT_ENV=production \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_replace_me \
  ./assets
```

The `NEXT_PUBLIC_*` values are embedded in the browser bundle during the Next.js build. Rebuild and
republish the web image whenever one of these values changes.

Push the manifests to GHCR:

```bash
podman manifest push --format docker \
  ghcr.io/mjhale/formdelegate-api:latest \
  docker://ghcr.io/mjhale/formdelegate-api:latest

podman manifest push --format docker \
  ghcr.io/mjhale/formdelegate-web:latest \
  docker://ghcr.io/mjhale/formdelegate-web:latest
```

Verify the published manifests:

```bash
podman manifest inspect ghcr.io/mjhale/formdelegate-api:latest
podman manifest inspect ghcr.io/mjhale/formdelegate-web:latest
```

When building the API image under QEMU emulation, the Dockerfile sets `ERL_FLAGS="+JMsingle true"`
to avoid Erlang JIT issues during `mix` compilation.

## Learn More

- Official website: https://formdelegate.com
- Phoenix Docs: https://hexdocs.pm/phoenix
- React Docs: https://reactjs.org/docs
- Source: https://github.com/mjhale/formdelegate
