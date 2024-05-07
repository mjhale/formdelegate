import type { Metadata } from 'next';

export default async function PrivacyPage() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <h1 className="text-3xl lowercase tracking-wide font-semibold">
            Privacy Policy
          </h1>

          <div className="space-y-4">
            <p>At Form Delegate, we have a few fundamental principles:</p>

            <ul className="list-disc list-inside">
              <li>
                We are thoughtful about the personal information we ask you to
                provide and the personal information that we collect about you
                through the operation of our services.
              </li>
              <li>
                We aim to make it as simple as possible for you to control what
                information on your website is shared publicly (or kept
                private), indexed by search engines, and permanently deleted. We
                help protect you from overreaching government demands for your
                personal information.
              </li>
              <li>
                We aim for full transparency on how we gather, use, and share
                your personal information.
              </li>
            </ul>

            <p>
              Below is our Privacy Policy, which incorporates and clarifies
              these principles.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Information We Collect</h2>
            <p>
              We only collect information about you if we have a reason to do so
              — for example, to provide our services, to communicate with you,
              or to make our services better.
            </p>
            <p>
              We collect this information from three sources: if and when you
              provide information to us, automatically through operating our
              services, and from outside sources. Let's go over the information
              that we collect.
            </p>

            <h3 className="text-xl">Information You Provide to Us</h3>

            <p>
              It's probably no surprise that we collect information that you
              provide to us directly. Here are some examples:
            </p>

            <ul className="list-disc list-inside">
              <li>
                Basic account information: We ask for basic information from you
                in order to set up your account. For example, we require
                individuals who sign up for an account to provide an email
                address and password. You may provide us with more information —
                like your address and other information you want to share — but
                we don't require that information to create a free account.
              </li>
              <li>
                Payment and contact information: There are various ways in which
                you may provide us payment information and associated contact
                information. For example, if you buy one of our subscription
                plans, we'll collect information to process those payments and
                contact you. We also keep a record of the purchases you've made.
                You may also provide us with financial details to set up a
                payments integration, like the email address for your Stripe or
                account.
              </li>
              <li>
                Communications with us: You may also provide us with information
                when you respond to surveys, communicate with our support staff,
                or sign up for a newsletter. When you communicate with us via
                form, email, phone, or otherwise, we may store a copy of our
                communications (including any call recordings as permitted by
                applicable law).
              </li>
            </ul>

            <h3 className="text-xl">Information We Collect Automatically</h3>
            <p>
              Log information: Like most online service providers, we collect
              information that web browsers, mobile devices, and servers
              typically make available, including the browser type, IP address,
              unique device identifiers, language preference, referring site,
              the date and time of access, operating system, and mobile network
              information. We collect log information when you use our services
              — for example, when you set up a form integration. We also collect
              log information when third party individuals use our services
              through form submissions you route through our service.
            </p>
            <p>
              Transactional information: When you make a purchase through our
              service, we collect information about the transaction, such as
              product details, purchase price, and the date and location of the
              transaction.
            </p>
            <p>
              Information from cookies & other technologies: A cookie is a
              string of information that a website stores on a visitor's
              computer, and that the visitor's browser provides to the website
              each time the visitor returns. We use cookies to help us identify,
              track, and authenticate visitors.
            </p>

            <h3 className="text-xl">
              Information We Collect from Other Sources
            </h3>
            <p>
              Financial Account Info: If you pay for one of our subscription
              offerings, we'll receive information relating to your Stripe
              account, such as your email address and phone number.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Sharing Information</h2>

            <p>
              We share information about you in limited circumstances, and with
              appropriate safeguards on your privacy. These are spelled out
              below.
            </p>

            <ul className="list-disc list-inside">
              <li>
                Subsidiaries and independent contractors: We may disclose
                information about you to our subsidiaries and independent
                contractors who need the information to help us provide our
                services or process the information on our behalf. We require
                our subsidiaries and independent contractors to follow this
                privacy policy for any personal information that we share with
                them.
              </li>
              <li>
                Third-party vendors: We may share information about you with
                third-party vendors who need the information in order to provide
                their services to us, or to provide their services to you or
                your site. This includes vendors that help us provide our
                services to you (like Stripe, which we use as a payment
                provider, fraud prevention services that allow us to analyze
                fraudulent payment transactions, cloud storage services, spam
                detection services, postal and email delivery services that help
                us stay in touch with you, and customer chat and email support
                services that help us communicate with you).
              </li>
              <li>
                Legal and regulatory requirements: We may disclose information
                about you in response to a subpoena or court order.
              </li>
              <li>
                Business transfers: In connection with any merger, sale of
                company assets, or acquisition of all or a portion of our
                business by another company, or in the event that Form Delegate
                goes out of business or enters bankruptcy, user information
                would likely be one of the assets that is transferred or
                acquired by a third party. If any of these events were to
                happen, this Privacy Policy would continue to apply to your
                information and the party receiving your information may
                continue to use your information, but only consistent with this
                Privacy Policy.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">How Long We Keep Information</h2>

            <p>
              We generally retain information about you indefinitely. We may
              also retain information about you after you close your account.
              However, individuals may request a full account deletion as well
              as the deletion of all related data or logs. Please contact us to
              initiate this request.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Third-Party Service Providers</h2>
            <p>
              We disclose information with third-party service providers that
              require access to information to support the operation and
              delivery of our services. The third parties that Form Delegate
              discloses your information with may include:
            </p>

            <ul className="list-disc list-inside">
              <li>Vercel (USA) - Web host</li>
              <li>Fly.io (USA) - Web host and database host</li>
              <li>GitHub (USA) - Code repository provider</li>
              <li>Digital Ocean (USA) - Cloud storage provider</li>
              <li>hCaptcha (USA) - Spam detection provider</li>
              <li>Akismet (USA) - Spam detection provider</li>
              <li>
                Cloudflare (USA) - Domain registrar and DDoS mitigation provider
              </li>
              <li>Stripe (USA) - Payment processor</li>
              <li>Postmark (USA) - Mail delivery processor</li>
              <li>Fastmail (AUS) - Mail host</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">How to Reach Us</h2>
            <p>
              If you have a question about this Privacy Policy, please contact
              us through{' '}
              <a
                href="mailto:hello@formdelegate.com"
                className="font-semibold underline"
              >
                email
              </a>
              .
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Change log</h2>

            <ul className="list-disc list-inside">
              <li>May 7, 2024: Initial release of our Privacy Policy.</li>
            </ul>
          </div>

          <p className="my-4 text-sm italic">
            This policy was adapted in part from the privacy policy shared by{' '}
            <a
              href="https://automattic.com/"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              Automattic
            </a>
            , licensed via the{' '}
            <a
              href="http://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener"
              className="underline"
            >
              Creative Commons Attribution-ShareAlike 4.0 International license
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Privacy Policy - Form Delegate',
  description:
    'This privacy policy explains information we collect, cookies we use, and what is shared with partners.',
};
