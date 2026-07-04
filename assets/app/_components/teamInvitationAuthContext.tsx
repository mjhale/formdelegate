import Link from 'next/link';

export function TeamInvitationAuthContext({
  action,
  className = '',
}: {
  action: 'accept' | 'login' | 'signup';
  className?: string;
}) {
  const heading =
    action === 'accept'
      ? 'Join a Form Delegate team'
      : action === 'login'
        ? 'Sign in to accept this invitation'
        : 'Create an account to accept this invitation';

  const body =
    action === 'accept'
      ? 'You have been invited to join a team in Form Delegate.'
      : 'Finish this step with the invited email address, then we will take you back to the invitation.';
  const help =
    action === 'signup'
      ? 'Use the email address that received this invitation. After creating your account, you will return here to accept it.'
      : 'Use the email address that received this invitation. After signing in, you will return here to accept it.';

  return (
    <div className={`space-y-3 text-center ${className}`}>
      <p className="inline-flex items-center justify-center rounded-full border border-carnation-200 bg-carnation-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-carnation-400">
        Team invitation
      </p>
      <div className="space-y-2">
        <h1 className="text-2xl font-light text-slate-950">{heading}</h1>
        <p className="text-sm leading-6 text-slate-600">{body}</p>
      </div>
      <p className="border-t border-b border-slate-200 py-3 text-sm leading-6 text-slate-700">
        {help}
      </p>
    </div>
  );
}

export function InvitationAuthActions({
  loginHref,
  signupHref,
}: {
  loginHref: string;
  signupHref: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Link
        href={loginHref}
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-carnation-400 bg-carnation-400 px-3 py-2 text-sm font-semibold leading-5 text-white shadow-sm hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-carnation-200 active:shadow active:shadow-neutral-700"
      >
        Sign in to accept
      </Link>
      <Link
        href={signupHref}
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold leading-5 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-carnation-200 active:shadow active:shadow-neutral-700"
      >
        Create account
      </Link>
    </div>
  );
}

export function InvitationAccountSwitchLink({
  href,
  label,
  linkText,
}: {
  href: string;
  label: string;
  linkText: string;
}) {
  return (
    <div className="text-center text-sm text-slate-600">
      {label}{' '}
      <Link href={href} className="font-semibold text-slate-900 underline">
        {linkText}
      </Link>
    </div>
  );
}
