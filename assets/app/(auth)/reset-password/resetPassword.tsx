import ResetPasswordForm from './resetPasswordForm';

export default function ResetPassword({ token }) {
  return (
    <>
      <h1 className="text-2xl font-light text-center mb-4">Reset Password</h1>

      <ResetPasswordForm token={token} />
    </>
  );
}
