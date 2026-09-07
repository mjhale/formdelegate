import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditorHeader({
  editing = false,
}: {
  editing?: boolean;
}) {
  return (
    <header className="mb-[25px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
      <div className="min-w-0">
        <Link
          href="/forms"
          className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-brand-deep hover:underline"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to forms
        </Link>
        <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
          Endpoint management
        </p>
        <h1>{editing ? 'Edit form' : 'Create form'}</h1>
        <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
          Configure your endpoint, website access, and email notifications.
        </p>
      </div>
    </header>
  );
}
