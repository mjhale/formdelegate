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

Form Delegate runs on [Fly.io](https://fly.io/) for the Phoenix API and
[Vercel](https://vercel.com/) for the React frontend. Both services offer free tiers that are
suitable for development.

Additionally, Form Delegate uses the following services:

- [Akismet](https://akismet.com/) for spam detection

- [hCaptcha](https://www.hcaptcha.com/) for serving CAPTCHAs

- [Amazon S3](https://aws.amazon.com/s3/) for block storage of submission files

- [Postmark](https://postmarkapp.com/) for email delivery

_Note: This repository is currently hardcoded with our official domain. You will need to create a fork
and replace `formdelegate.com` where appropriate._

### Create a Free Fly.io Account

Visit the [Fly.io website](https://fly.io/docs/speedrun/) to create a free account.

### Install and Set Up the Fly.io CLI

Visit [Fly.io's flyctl installation guide](https://fly.io/docs/hands-on/install-flyctl/) for instructions on how to set up and configure the CLI.

### Set Up Your Fly.io Instance

1. Run `fly launch` inside the project directory and follow the configuration prompts. Set up the Postgres database during this process.

2. Configure the project secrets found in `.env` via the flyctl: e.g., `fly secrets set HCAPTCHA_SECRET_API_KEY=0x9623`

3. Deploy the project: `fly deploy`

4. Run the following one-time setup commands to enable SSH access to the Fly.io app: `fly ssh establish`
and `fly ssh issue --agent`

5. Open a shell connection to the app's machine: `fly ssh console`

6. Set up your initial data via the remote IEx shell `app/bin/form_delegate remote`:

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

### Create a Vercel account

[Visit the Vercel website](https://vercel.com/) and sign up for a free Vercel account.

Add a new project via the Git repository import. Add the project's environment variables found in `assets/.env.production`.

## Learn More

- Official website: https://formdelegate.com
- Phoenix Docs: https://hexdocs.pm/phoenix
- React Docs: https://reactjs.org/docs
- Source: https://github.com/mjhale/formdelegate
