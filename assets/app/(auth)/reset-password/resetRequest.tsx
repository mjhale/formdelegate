import ResetRequestForm from './resetRequestForm';

export default async function ResetRequest() {
  return (
    <>
      <h1 className="text-2xl font-light text-center mb-4">Reset Password</h1>
      <div className="flex flex-col gap-y-4 max-w-xs mx-auto mb-4">
        <p className="text-sm">
          Enter your account's email address and we'll send you a link to reset
          your password.
        </p>
      </div>

      <ResetRequestForm />
    </>
  );
}
