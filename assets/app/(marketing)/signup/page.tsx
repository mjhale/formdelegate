import SignupForm from './form';

export default async function SignupPage() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-y-4 w-full max-w-4xl">
          <h1 className="text-3xl lowercase tracking-wide font-semibold">
            Sign Up for Form Delegate
          </h1>

          <SignupForm />
        </div>
      </div>
    </>
  );
}
