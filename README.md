# Form Delegate

[Form Delegate](https://formdelegate.com) is a service that allows users to process and manage form submissions.
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

## Local Development

Form Delegate uses Elixir and [Phoenix](http://www.phoenixframework.org/) for the API, JavaScript and [React](https://reactjs.org/) for the frontend, and [Postgres](https://www.postgresql.org/) for the database.

To install the necessary dependencies on your machine:

- _Recommended: Install [asdf-vm](https://github.com/asdf-vm/asdf) to manage versions of [Erlang](https://github.com/asdf-vm/asdf-erlang), [Elixir](https://github.com/asdf-vm/asdf-elixir), [Node.js](https://github.com/asdf-vm/asdf-nodejs), and [Yarn](https://github.com/twuni/asdf-yarn)._
- Install Erlang: `asdf install erlang 22.3.2`
- Install Elixir\*: `asdf install elixir 1.10.3-otp-22`
- Install Node.js: `asdf install nodejs 13.13.0`
- Install Yarn: `asdf install yarn 1.22.4`
- Install Postgres (see the [official installation instructions](https://www.postgresql.org/download/))

_\* By default, asdf-vm will install Elixir with a binary compiled for the oldest OTP release supported
by that version. To get the benefits of a more recent OTP you must specify which OTP you would like to
use._

**To start the Phoenix app:**

- Install dependencies with `mix deps.get`
- Create and migrate your database with `mix ecto.create && mix ecto.migrate`
- Ensure the [necessary environment variables](./.sample.env) are set via `source .env`
- Start the Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

You can also download
our [Postman collection of API actions](./.postman_collection.json) and [import it into your environment](https://learning.postman.com/docs/postman/collections/importing-and-exporting-data/#importing-data-into-postman). Alternatively, you can open our
collection by following this link:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/e7b20dafc2a25c1f5d20)

**To start the React app:**

- Install dependencies with `yarn --cwd ./assets/ install`
- Start the React development server with `yarn --cwd ./assets/ start`

Now you can visit [`localhost:3000`](http://localhost:3000) from your browser.

## Running Your Own Instance

Form Delegate runs on [Gigalixir](https://www.gigalixir.com/) for the Phoenix API and
[Netlify](https://www.netlify.com/) for the React frontend. Both services offer free tiers that are
suitable for development and staging.

Additionally, Form Delegate uses the following services:

- [Akismet](https://akismet.com/) for spam detection

- [hCaptcha](https://www.hcaptcha.com/) for serving CAPTCHAs

- [Amazon S3](https://aws.amazon.com/s3/) for block storage of submission files

- [Postmark](https://postmarkapp.com/) for email delivery

_Note: This repository is currently hardcoded with our official domain. You will need to create a fork
and replace `formdelegate.com` where appropriate._

### Create a Free Gigalixir Account

Visit the [Gigalixir website](https://gigalixir.com/) to create a free account.

### Install and Set Up the Gigalixir CLI

Visit [Gigalixir's getting started guide](https://gigalixir.readthedocs.io/en/latest/main.html#getting-started-guide) for instructions on how to set up the CLI and configure it for your instance.

### Set Up a Free Gigalixir Database

1. Scale down the application to 0: `gigalixir ps:scale --replicas=0`

2. _Optional: Destroy an existing database if you would like to start fresh: `gigalixir pg:destroy -d $DATABASE_ID`_

3. Provision a new Postgres database: `gigalixir pg:create --free`

4. Scale up the application: `gigalixir ps:scale --replicas=1`

5. Add an environmental variable for the new Postgres database: `gigalixir config:set DATABASE_URL="$DATABASE_URL"`

6. Run migrations against the database: `gigalixir ps:migrate`

7. Drop into a remote console for the application: `gigalixir ps:remote_console`

8. Set up your initial data:

```
FormDelegate.Repo.insert!(%FormDelegate.Accounts.User{
  name: "Your Name",
  email: "hello@yourname.com",
  password_hash: Pbkdf2.hash_pwd_salt("a randomly generated password"),
  confirmed_at: DateTime.utc_now(),
  is_admin: true
})

FormDelegate.Repo.insert!(%FormDelegate.Integrations.Integration{
  name: "E-mail",
  type_code: "email"
})
```

### Deploy to Gigalixir

Run `git push gigalixir master` to deploy the application.

### Create a Netlify Account

[Visit the Netlify website](https://www.netlify.com/) and sign up for a free Netlify account.

Read the [Netlify getting started guide](https://docs.netlify.com/) to learn how to create deploys.

## Learn More

- Official website: https://formdelegate.com
- Phoenix Docs: https://hexdocs.pm/phoenix
- React Docs: https://reactjs.org/docs
- Source: https://github.com/mjhale/formdelegate

## Build Badges

[![Semaphore](https://formdelegate.semaphoreci.com/badges/formdelegate.svg?key=9e94b382-9d19-49c0-b3f2-fb5e2a92f75b)](https://formdelegate.semaphoreci.com/projects/formdelegate)

[![Netlify Status](https://api.netlify.com/api/v1/badges/f75c7f76-9eb5-412d-ba74-cc00e856c1ea/deploy-status)](https://app.netlify.com/sites/angry-ramanujan-e322e7/deploys)
