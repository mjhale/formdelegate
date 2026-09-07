import type { Metadata } from 'next';

import {
  ArrowUpRight,
  BookOpenText,
  GitBranch,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import MessageForm from '_components/messageForm';
import { ButtonAnchor, ButtonLink } from '../_components/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../_components/card';
import SupportOption from './supportOption';

export default async function SupportPage() {
  const supportTicketEndpoint = process.env.NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT;

  return (
    <>
      <header className="mb-[25px] flex items-start justify-between gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px] [&_h1]:mb-[7px] [&_h1]:ml-0 [&_h1]:mr-0 [&_h1]:mt-0 [&_h1]:text-[clamp(27px,_2.3vw,_34px)] [&_h1]:font-bold [&_h1]:leading-[1.15] [&_h1]:tracking-[-0.035em] [&_h1]:text-[#202126]">
        <div className="min-w-0">
          <p className="mb-1.5 ml-0 mr-0 mt-0 text-[11px] font-extrabold uppercase tracking-[0.09em] text-[#a33a34]">
            Help and resources
          </p>
          <h1>Support</h1>
          <p className="m-0 max-w-[660px] text-sm leading-[1.45] text-muted">
            Find implementation guidance, report a problem, or review the
            open-source project.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>How can we help?</CardTitle>
            <CardDescription>
              Choose the fastest path for your question.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
            <SupportOption
              title="Documentation"
              description="Review common setup questions, pricing, and implementation guidance."
              icon={BookOpenText}
            >
              <ButtonLink size="small" href="/faq">
                Open FAQ
                <ArrowUpRight aria-hidden="true" />
              </ButtonLink>
            </SupportOption>

            <SupportOption
              title="Contact support"
              description="Send details about an account, delivery, or configuration problem."
              icon={Mail}
            >
              <ButtonAnchor
                size="small"
                variant={'primary'}
                href="#contact-support"
              >
                Send message
              </ButtonAnchor>
            </SupportOption>

            <SupportOption
              title="GitHub"
              description="Review the source, report a reproducible issue, or contribute a fix."
              icon={GitBranch}
            >
              <ButtonAnchor
                size="small"
                href="https://github.com/mjhale/formdelegate"
                rel="noopener noreferrer"
                target="_blank"
              >
                View repository
                <ArrowUpRight aria-hidden="true" />
              </ButtonAnchor>
            </SupportOption>

            <SupportOption
              title="Privacy and terms"
              description="Review how Form Delegate handles account and submission data."
              icon={ShieldCheck}
            >
              <ButtonLink size="small" href="/privacy">
                View privacy policy
              </ButtonLink>
            </SupportOption>
          </div>
        </div>
      </Card>

      <Card className="mt-[18px] scroll-mt-6" id="contact-support">
        <CardHeader>
          <div>
            <CardTitle>Contact support</CardTitle>
            <CardDescription>
              Include enough detail to reproduce the issue when possible.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="p-5">
          <MessageForm
            endpoint={supportTicketEndpoint}
            formLabel="Support form"
            layout="stacked"
          />
        </div>
      </Card>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Support - Form Delegate',
  description:
    'Need help? We are available through our contact form to help with any issues.',
};
