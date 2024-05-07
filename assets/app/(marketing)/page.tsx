import { Lato } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

import heroImage from '../../public/images/hero-person-at-computer.jpg';
import iconBlocker from '../../public/images/icon-blocker.svg';
import iconConnection from '../../public/images/icon-connection.svg';
import iconFolder from '../../public/images/icon-folder.svg';
import iconLock from '../../public/images/icon-lock.svg';

const lato = Lato({
  weight: ['700', '900'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
});

export default async function IndexPage() {
  return (
    <div className="-mx-4 -my-4">
      <div className="relative flex pt-12 pb-12 justify-center items-center shadow-[inset_0_0_0_1000px_rgba(50,43,40,0.55)] h-[35vw] md:h-[40vw] lg:h-[25vw] lg:pt-32 lg:pb-32">
        <Image
          className="block object-cover -z-10"
          src={heroImage}
          priority={true}
          quality={60}
          fill={true}
          alt="Person looking at monitor"
        />
        <div className="absolute leading-6 text-center w-full max-w-4xl">
          <div className="flex flex-col gap-y-6 box-border my-4 mx-auto w-full">
            <h1
              className={`text-2xl md:text-4xl font-semibold ${lato.className} text-neutral-100 [text-shadow:_1px_1px_4px_rgb(0_0_0_/_90%)]`}
            >
              Simple Form Processing
            </h1>
            <p className="text-lg md:text-3xl text-neutral-200 [text-shadow:_1px_1px_1px_rgb(0_0_0_/_70%)]">
              Send your forms to us. We'll handle the rest.
            </p>
            <div className="">
              <Link
                href="/signup"
                className="inline-block px-3 py-1 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 disabled:cursor-not-allowed disabled:opacity-60 active:shadow active:shadow-neutral-700 hover:cursor-pointer"
              >
                Sign Up For Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-700 text-gray-300 text-center p-4">
        Want to see it in action?{' '}
        <Link
          href="/demo"
          className="text-carnation-200 hover:text-carnation-100 hover:underline"
        >
          Watch our demo.
        </Link>
      </div>

      <div className="px-4 xl:px-0 bg-orange-100 py-8 flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl mx-4">
          <h2 className="text-2xl font-semibold">
            Give your forms flexibility
          </h2>
          <h3 className="text-xl">
            Add powerful features to your forms. No coding required.
          </h3>

          <ul className="flex flex-col gap-y-2">
            <li className="inline-flex list-none italic before:content-[''] before:bg-carnation-200 before:float-left before:h-0.5 before:mt-2.5 before:mr-4 before:w-4">
              E-mail form submissions to multiple people.
            </li>
            <li className="inline-flex list-none italic before:content-[''] before:bg-carnation-200 before:float-left before:h-0.5 before:mt-2.5 before:mr-4 before:w-4">
              View and manage every submission with our ad-free interface.
            </li>
            <li className="inline-flex list-none italic before:content-[''] before:bg-carnation-200 before:float-left before:h-0.5 before:mt-2.5 before:mr-4 before:w-4">
              Integrate form submissions with multiple services.
            </li>
            <li className="inline-flex list-none italic before:content-[''] before:bg-carnation-200 before:float-left before:h-0.5 before:mt-2.5 before:mr-4 before:w-4">
              Keep spam out of your life with our automatic filtering.
            </li>
          </ul>
        </div>
      </div>
      <div className="px-4 xl:px-0 bg-red-50 py-8 flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <h3 className="text-2xl font-semibold">Take the plunge</h3>
          <ul>
            <li className="pb-4">
              <span className="inline-block pb-4 text-xl">
                Step 1: Replace your form's action attribute.
              </span>
              <code className="block bg-white rounded-xl text-sm break-words p-4">
                {`<form `}
                <span className="bg-carnation-100 rounded-md px-2 py-1">
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
      <div className="px-4 xl:px-0 bg-white py-12 flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <ul className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-4">
            <li className="flex flex-col gap-y-2">
              <div className="flex items-center">
                <Image
                  className="mr-2"
                  src={iconFolder}
                  alt=""
                  height="24"
                  width="24"
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
                  height="24"
                  width="24"
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
                  height="24"
                  width="24"
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
                  height="24"
                  width="24"
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
