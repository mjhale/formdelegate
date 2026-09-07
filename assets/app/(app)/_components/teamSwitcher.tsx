'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { selectTeam } from '../actions';

interface TeamOption {
  id: string;
  name: string;
}

export default function TeamSwitcher({
  selectedTeamId,
  teams,
  workspaceSubtitle,
}: {
  selectedTeamId: string;
  teams: TeamOption[];
  workspaceSubtitle: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectedTeam =
    teams.find((team) => team.id === selectedTeamId) || teams[0];
  const teamName = selectedTeam?.name || 'Workspace';
  const initial = teamName.trim().charAt(0).toLocaleUpperCase() || 'F';

  const content = (
    <>
      <span className="grid h-[30px] w-[30px] flex-[0_0_30px] place-items-center rounded-lg bg-[#fff8ed] font-extrabold text-brand-dark">
        {initial}
      </span>
      <span className="min-w-0 flex-1 [&_span]:mt-px [&_span]:block [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap [&_span]:text-[11px] [&_span]:text-[rgba(255,_255,_255,_0.65)] [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap [&_strong]:text-[13px] [&_strong]:font-bold">
        <strong>{teamName}</strong>
        <span>{workspaceSubtitle}</span>
      </span>
      {teams.length > 1 ? <ChevronDown aria-hidden="true" /> : null}
    </>
  );

  if (teams.length <= 1) {
    return null;
  }

  return (
    <form className="duration-control relative mb-[5px] ml-3 mr-3 mt-[15px] flex w-[calc(100%_-_24px)] items-center gap-2.5 rounded-[10px] border border-[rgba(255,_255,_255,_0.16)] bg-[rgba(255,_255,_255,_0.1)] px-[11px] py-2.5 text-left text-white transition-colors hover:border-[rgba(255,_255,_255,_0.23)] hover:bg-[rgba(255,_255,_255,_0.15)] [&_>_svg]:h-4 [&_>_svg]:w-4 [&_>_svg]:flex-[0_0_16px]">
      {content}
      <label className="sr-only" htmlFor="team_id">
        Workspace
      </label>
      <select
        aria-label="Workspace"
        className="absolute inset-0 w-full cursor-pointer opacity-0"
        defaultValue={selectedTeamId}
        disabled={isPending}
        id="team_id"
        key={selectedTeamId}
        name="team_id"
        onChange={(event) => {
          const nextTeamId = event.currentTarget.value;
          const formData = new FormData();
          formData.set('team_id', nextTeamId);
          startTransition(async () => {
            await selectTeam(formData);
            router.refresh();
          });
        }}
      >
        {teams.map((team) => (
          <option className="text-slate-950" key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </form>
  );
}
