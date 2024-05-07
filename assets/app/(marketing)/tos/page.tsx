import type { Metadata } from 'next';

import Link from 'next/link';

export default async function TosPage() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <h1 className="text-3xl lowercase tracking-wide font-semibold">
            Terms of Service
          </h1>

          <div className="space-y-4">
            <p>
              These Terms of Service (“Terms”) describe our commitments to you,
              and your rights and responsibilities when using our services.
              Please read them carefully and reach out to us if you have any
              questions. If you don't agree to these Terms, don't use our
              services.
            </p>

            <p>
              These Terms govern your access to and use of the software,
              applications, extensions, and other products and services we
              provide through or for FormDelegate.com (our “Services”).
            </p>

            <p>
              These Terms also govern visitors' access to and use of any
              websites that use our Services. For example, visitors who are
              routed through our Services through HTML forms served by third
              parties. Please note though that the operators of those websites
              may also have their own separate terms of use.
            </p>

            <p>
              Please read these Terms carefully before accessing or using our
              Services. By accessing or using any part of our Services, you
              agree to be bound by all of the Terms and all other operating
              rules, policies, and procedures that we may publish via the
              Services from time to time (collectively, the “Agreement”). You
              also agree that we may automatically change, update, or add on to
              our Services as stated in the Terms, and the Agreement will apply
              to any changes.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Who's Who</h2>
            <p>
              “You” means any individual or entity using our Services. If you
              use our Services on behalf of another person or entity, you
              represent and warrant that you're authorized to accept the
              Agreement on that person's or entity's behalf, that by using our
              Services you're accepting the Agreement on behalf of that person
              or entity, and that if you, or that person or entity, violates the
              Agreement, you and that person or entity agree to be responsible
              to us.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Your Account</h2>

            <p>
              When using our Services requires an account, you agree to provide
              us with complete and accurate information and to keep the
              information current so that we can communicate with you about your
              account. We may need to send you emails about notable updates
              (like changes to our Terms of Service or Privacy Policy), or to
              let you know about legal inquiries or complaints we receive about
              the ways you use our Services so you can make informed choices in
              response.
            </p>

            <p>
              We may limit your access to our Services until we're able to
              verify your account information, like your email address.
            </p>

            <p>
              When you create an account, we consider that to be an inquiry
              about our products and services, which means that we may also
              contact you to share more details about what we have to offer
              (i.e., marketing). Don't worry — if you aren't interested, you can
              opt out of all marketing communications.
            </p>

            <p>
              You're solely responsible and liable for all activity under your
              account. You're also fully responsible for maintaining the
              security of your account (which includes keeping your password
              secure). We're not liable for any acts or omissions by you,
              including any damages of any kind incurred as a result of your
              acts or omissions.
            </p>

            <p>
              Don't share or misuse your access credentials. And notify us
              immediately of any unauthorized uses of your account, store, or
              website, or of any other breach of security. If we believe your
              account has been compromised, we may suspend or disable it.
            </p>

            <p>
              If you'd like to learn about how we handle the data you provide
              us, please see our{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener"
                className="underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Minimum Age Requirements</h2>

            <p>
              Our Services are not directed to children. You're not allowed to
              access or use our Services if you're under the age of 13 (or 16 in
              Europe). If you register as a user or otherwise use our Services,
              you represent that you're at least 13 (or 16 in Europe). You may
              use our Services only if you can legally form a binding contract
              with us. In other words, if you're under 18 years of age (or the
              legal age of majority where you live), you can only use our
              Services under the supervision of a parent or legal guardian who
              agrees to the Agreement.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Prohibited Uses</h2>

            <p>
              You may not use our services for any unlawful purposes; in
              furtherance of illegal activities; or in a manner that is unfair,
              deceptive, exposes us or customers to unreasonable risks, or does
              not disclose important terms of a transaction in advance. Among
              other things, this means that:
            </p>

            <ul className="list-disc list-inside">
              <li>
                Our services cannot be used in, from, by, or for the benefit of
                a country, organization, entity, or person embargoed or blocked
                by any government, including those on sanctions lists identified
                by the United States Office of Foreign Asset Control (OFAC).
              </li>
              <li>
                Our services shall not be used as a distribution source for any
                form of content. For example, you shall not upload files to our
                service for the purpose of sharing or storing those files.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Responsibility of Visitors and Users</h2>

            <p>
              We haven't reviewed, and can't review, all of the content (like
              text, photo, video, audio, code, computer software, form file
              submisionss, and other materials) posted to or made available
              through our Services by users or anyone else (“Content”) or on
              websites that link to, or are linked from, our Services.
            </p>

            <p>
              We're not responsible for any use or effects of Content or
              third-party websites.
            </p>

            <p>So, for example:</p>

            <ul className="list-disc list-inside">
              <li>We don't have any control over third-party websites.</li>
              <li>
                A link to or from one of our Services does not represent or
                imply that we endorse any third-party website.
              </li>
              <li>
                We don't endorse any Content or represent that Content is
                accurate, useful, or not harmful. Content could be offensive,
                indecent, or objectionable; include technical inaccuracies,
                typographical mistakes, or other errors; or violate or infringe
                the privacy, publicity rights, intellectual property rights, or
                other proprietary rights of third parties. You're fully
                responsible for the Content available on your website, and any
                harm resulting from that Content. It's your responsibility to
                ensure that your website's Content abides by applicable laws and
                by the Agreement.
              </li>
              <li>
                We aren't responsible for any harm resulting from anyone's
                access, use, purchase, or downloading of Content, or for any
                harm resulting from third-party websites. You're responsible for
                taking the necessary precautions to protect yourself and your
                computer systems from viruses, worms, Trojan horses, and other
                harmful or destructive content.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Fees, Payment, and Renewal</h2>

            <p>
              Fees for Paid Services. Some of our Services are offered for a fee
              (collectively, “Paid Services”). This section applies to any
              purchases of Paid Services.
            </p>

            <p>
              By using a Paid Service, you agree to pay the specified fees.
              Depending on the Paid Service, there may be different kinds of
              fees, like some that are one-time, recurring, revenue-based, or
              based on an advertising campaign budget that you set. For
              recurring fees (AKA subscriptions), your subscription begins on
              your purchase date, and we'll bill or charge you in the
              automatically-renewing interval (such as monthly, annually, or
              biennially) you select, on a pre-pay basis until you cancel, which
              you can do at any time by contacting the relevant support team.
            </p>

            <p>
              Taxes. To the extent permitted by law, or unless explicitly stated
              otherwise, all fees do not include applicable federal, provincial,
              state, local or other governmental sales, value-added, goods and
              services, harmonized or other taxes, fees, or charges (“Taxes”).
              You're responsible for paying all applicable Taxes relating to
              your use of our Services, your payments, or your purchases. If
              we're obligated to pay or collect Taxes on the fees you've paid or
              will pay, you're responsible for those Taxes, and we may collect
              payment from you.
            </p>

            <p>
              Payment. You must provide accurate and up-to-date payment
              information. By providing your payment information, you authorize
              us to store it until you request deletion. If your payment fails,
              we suspect fraud, or Paid Services are otherwise not paid for or
              paid for on time (for example, if you contact your bank or credit
              card company to decline or reverse the charge of fees for Paid
              Services), we may immediately cancel or revoke your access to Paid
              Services without notice to you. You authorize us to charge any
              updated payment information provided by your bank or payment
              service provider (e.g., new expiration date) or other payment
              methods provided if we can't charge your primary payment method.
            </p>

            <p>
              Automatic Renewal. By enrolling in a subscription, you authorize
              us to automatically charge the then-applicable fees and Taxes for
              each subsequent subscription period until the subscription is
              canceled. If you received a discount, used a coupon code, or
              subscribed during a free trial or promotion, your subscription
              will automatically renew for the full price of the subscription at
              the end of the discount period. This means that unless you cancel
              a subscription, it'll automatically renew and we'll charge your
              payment method(s). You must cancel at least one month before the
              scheduled end date of any annual subscription and at least 24
              hours before the end of any shorter subscription period. The date
              for the automatic renewal is based on the date of the original
              purchase and cannot be changed. If you've purchased access to
              multiple services, you may have multiple renewal dates.
            </p>

            <p>
              Fees and Changes. We may change our fees at any time in accordance
              with these Terms and requirements under applicable law. This means
              that we may change our fees going forward, start charging fees for
              Services that were previously free, or remove or update features
              or functionality that were previously included in the fees. If you
              don't agree with the changes, you must cancel your Paid Service.
            </p>

            <p>
              Refunds. We may have a refund policy for some of our Paid
              Services, and we'll also provide refunds if required by law. In
              all other cases, there are no refunds and all payments are final.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Third-Party Services</h2>

            <p>
              While using the Services, you may enable, use, or purchase
              services, products, integrations, software, or applications
              provided or manufactured by a third party or yourself
              (“Third-Party Services”).
            </p>

            <p>
              If you use any Third-Party Services, you understand and agree
              that:
            </p>

            <ul className="list-disc list-inside">
              <li>
                Third-Party Services aren't vetted, endorsed, or controlled by
                Form Delegate.
              </li>
              <li>
                Unless we have indicated that Form Delegate is providing support
                for it, any use of a Third-Party Service is at your own risk,
                and we won't be responsible or liable to you or anyone else for
                Third-Party Services.
              </li>
              <li>
                Some Third-Party Services may request or require access to your
                data — or to your visitors' or customers' data — through things
                like pixels or cookies. If you use the Third-Party Service or
                grant them access, the data will be handled in accordance with
                the Third Party's privacy policy and practices, which you should
                carefully review before you use any Third-Party Services.
                Third-Party Services may not work appropriately with our
                Services and we may not be able to provide support for issues
                caused by any Third-Party Services.
              </li>
              <li>
                If you have questions or concerns about how a Third-Party
                Service operates or need support, contact the Third Party
                directly unless it is indicated that Form Delegate provides
                support for it.
              </li>
            </ul>

            <p>
              In rare cases we may at our discretion, suspend, disable, or
              remove Third-Party Services from your account or website.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Changes</h2>

            <p>
              We may modify the Terms from time to time, for example, to reflect
              changes to our Services (e.g., adding new features or benefits to
              our Services or retiring certain features of certain Services) or
              for legal, regulatory, or security reasons. If we do this, we'll
              provide notice of the changes, such as by posting the amended
              Terms and updating the “Last Updated” date or, if the changes, in
              our sole discretion, are material, we may notify you through our
              Services or other communications. Any changes will apply on a
              going-forward basis, and, unless we say otherwise, the amended
              Terms will be effective immediately. By continuing to use our
              Services after we've notified you, you agree to be bound by the
              new Terms. You have the right to object to any changes at any time
              by ceasing your use of our Services and canceling any subscription
              you have.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Disclaimers</h2>

            <p>
              Our Services are provided “as is.” Form Delegate and its suppliers
              and licensors hereby disclaim all warranties of any kind, express
              or implied, to the maximum extent allowed by applicable law,
              including, without limitation, the warranties of merchantability,
              fitness for a particular purpose and non-infringement. Neither
              Form Delegate, nor its suppliers and licensors, makes any warranty
              that our Services will be error free or that access thereto will
              be continuous or uninterrupted. If you're reading this, here's a
              treat. You understand that you download from, or otherwise obtain
              content or services through, our Services at your own discretion
              and risk.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Limitation of Liability</h2>

            <p>
              In no event will Form Delegate, or its suppliers, partners, or
              licensors, be liable (including for any third-party products or
              services purchased or used through our Services) with respect to
              any subject matter of the Agreement under any contract,
              negligence, strict liability or other legal or equitable theory
              for: (i) any special, incidental or consequential damages; (ii)
              the cost of procurement for substitute products or services; (iii)
              for interruption of use or loss or corruption of data; or (iv) for
              any amounts that exceed $50 or the fees paid by you to Form
              Delegate under the Agreement during the twelve (12) month period
              prior to the cause of action, whichever is greater. Form Delegate
              shall have no liability for any failure or delay due to matters
              beyond its reasonable control. The foregoing shall not apply to
              the extent prohibited by applicable law.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">Termination</h2>

            <p>
              We may terminate your access to all or any part of our Services at
              any time, with or without cause or notice, effective immediately,
              including if we believe, in our sole discretion, that you have
              violated this Agreement, any service guidelines, or other
              applicable terms. We have the right (though not the obligation) to
              (i) refuse or remove any content that, in our reasonable opinion,
              violates any part of this Agreement or any Form Delegate policy,
              or is in any way harmful or objectionable, (ii) ask you to make
              adjustments, restrict the resources your website uses, or
              terminate your access to the Services, if we believe your
              website's storage or bandwidth usage burdens our systems, or (iii)
              terminate or deny access to and use of any of our Services to any
              individual or entity for any reason. We will have no obligation to
              provide a refund of any fees previously paid.
            </p>

            <p>
              You can stop using our Services at any time, or, if you use a Paid
              Service, you can cancel at any time, subject to the Fees, Payment,
              and Renewal section of these Terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl">How to Reach Us</h2>
            <p>
              If you have a question about our Terms of Service, please contact
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
              <li>May 7, 2024: Initial release of our Terms of Service.</li>
            </ul>
          </div>

          <p className="my-4 text-sm italic">
            These terms were adapted in part from the terms of service for{' '}
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
  title: 'Terms of Service - Form Delegate',
  description:
    'Our Terms of Service describe our commitments to you, as well as your rights and responsibilities when using our services.',
};
