import Image from 'next/image';
import Link from 'next/link';

import heroImage from '../../public/images/hero-person-at-computer.jpg';
import iconBlocker from '../../public/images/icon-blocker.svg';
import iconConnection from '../../public/images/icon-connection.svg';
import iconFolder from '../../public/images/icon-folder.svg';
import iconLock from '../../public/images/icon-lock.svg';

export default async function IndexPage() {
  return (
    <div className="-mx-4 -my-4">
      <div className="relative isolate flex h-[35vw] items-center justify-center pb-12 pt-12 md:h-[40vw] lg:h-[25vw] lg:pb-32 lg:pt-32">
        <Image
          className="z-0 block object-cover"
          src={heroImage}
          priority={true}
          quality={60}
          fill={true}
          alt="Person looking at monitor"
        />
        <div
          className="absolute inset-0 z-10 bg-[rgba(50,43,40,0.55)]"
          aria-hidden="true"
        />
        <div className="absolute z-20 w-full max-w-4xl text-center leading-6">
          <div className="mx-auto my-4 box-border flex w-full flex-col gap-y-6">
            <h1 className="text-2xl font-semibold text-neutral-100 [font-family:var(--font-lato)] [text-shadow:_1px_1px_4px_rgb(0_0_0_/_90%)] md:text-4xl">
              Simple Form Processing
            </h1>
            <p className="text-lg text-neutral-200 [text-shadow:_1px_1px_1px_rgb(0_0_0_/_70%)] md:text-3xl">
              Send your forms to us. We'll handle the rest.
            </p>
            <div>
              <Link
                href="/signup"
                className="whitespace-no-wrap inline-block rounded-md border border-gray-200 bg-white px-3 py-1 text-base font-medium leading-6 text-gray-600 shadow-sm hover:cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 active:shadow active:shadow-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
              >
                Sign Up For Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-700 p-4 text-center text-gray-300">
        Want to see it in action?{' '}
        <Link
          href="/demo"
          className="text-carnation-200 hover:text-carnation-100 hover:underline"
        >
          Watch our demo.
        </Link>
      </div>

      <div className="flex flex-col items-center bg-orange-100 px-4 py-8 xl:px-0">
        <div className="mx-4 flex w-full max-w-4xl flex-col gap-y-4">
          <h2 className="text-2xl font-semibold">
            Give your forms flexibility
          </h2>
          <h3 className="text-xl">
            Add powerful features to your forms. No coding required.
          </h3>

          <ul className="flex flex-col gap-y-2">
            <li className="inline-flex list-none italic before:float-left before:mr-4 before:mt-2.5 before:h-0.5 before:w-4 before:bg-carnation-200 before:content-['']">
              E-mail form submissions to multiple people.
            </li>
            <li className="inline-flex list-none italic before:float-left before:mr-4 before:mt-2.5 before:h-0.5 before:w-4 before:bg-carnation-200 before:content-['']">
              View and manage every submission with our ad-free interface.
            </li>
            <li className="inline-flex list-none italic before:float-left before:mr-4 before:mt-2.5 before:h-0.5 before:w-4 before:bg-carnation-200 before:content-['']">
              Integrate form submissions with multiple services.
            </li>
            <li className="inline-flex list-none italic before:float-left before:mr-4 before:mt-2.5 before:h-0.5 before:w-4 before:bg-carnation-200 before:content-['']">
              Keep spam out of your life with our automatic filtering.
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center bg-red-50 px-4 py-8 xl:px-0">
        <div className="flex w-full max-w-4xl flex-col gap-y-4">
          <h3 className="text-2xl font-semibold">Take the plunge</h3>
          <ul>
            <li className="pb-4">
              <span className="inline-block pb-4 text-xl">
                Step 1: Replace your form's action attribute.
              </span>
              <code className="block break-words rounded-xl bg-white p-4 text-sm">
                {`<form `}
                <span className="rounded-md bg-carnation-100 px-2 py-1">
                  {`action="https://www.formdelegate.com/f/00000000-1111-2222-3333-4444444444"`}
                </span>
                {` method="POST">`}
                <div className="pl-4">{`<input type="text" name="message" placeholder="Message">`}</div>
                <div className="pl-4">{`<button type="submit">Send</button>`}</div>
                {`</form>`}
              </code>
            </li>
            <li>
              <span className="text-xl">Step 2. Relax</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center bg-white px-4 py-12 xl:px-0">
        <div className="flex w-full max-w-4xl flex-col gap-y-4">
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-4">
            <li className="flex flex-col gap-y-2">
              <div className="flex items-center">
                <Image
                  className="mr-2"
                  src={iconFolder}
                  alt=""
                  height={24}
                  width={24}
                  aria-hidden={true}
                  role="presentation"
                />
                <p className="text-xl font-light">Your data.</p>
              </div>
              <div className="font-sm">
                Export or delete your data at any time.
              </div>
            </li>

            <li className="flex flex-col gap-y-2">
              <div className="flex items-center">
                <Image
                  className="mr-2"
                  src={iconBlocker}
                  alt=""
                  height={24}
                  width={24}
                  aria-hidden={true}
                  role="presentation"
                />
                <span className="text-xl font-light">No ads.</span>
              </div>
              <div className="font-sm">
                We'll never show you ads or abuse your privacy.
              </div>
            </li>

            <li className="flex flex-col gap-y-2">
              <div className="flex items-center">
                <Image
                  className="mr-2"
                  src={iconConnection}
                  alt=""
                  height={24}
                  width={24}
                  aria-hidden={true}
                  role="presentation"
                />
                <span className="text-xl font-light">Strong privacy.</span>
              </div>
              <div className="font-sm">
                Our guides help you ensure that your data is safe during
                transit.
              </div>
            </li>

            <li className="flex flex-col gap-y-2">
              <div className="flex items-center">
                <Image
                  className="mr-2"
                  src={iconLock}
                  alt=""
                  height={24}
                  width={17}
                  aria-hidden={true}
                  role="presentation"
                />
                <span className="text-xl font-light">Encryption.</span>
              </div>

              <div className="font-sm">
                Enroll in our client-side PGP beta and encrypt your form
                submissions.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
