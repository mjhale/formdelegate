import ResetPasswordForm from './resetPasswordForm';

export default function ResetPassword({ token }) {
  return (
    <>
      <h1 className="mb-4 text-center text-2xl font-light">Reset Password</h1>

      <ResetPasswordForm token={token} />
    </>
  );
}
