'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { selectTeam } from '../actions';

interface TeamOption {
  id: string;
  name: string;
}

export default function TeamSwitcher({
  selectedTeamId,
  teams,
}: {
  selectedTeamId: string;
  teams: TeamOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (teams.length <= 1) {
    return null;
  }

  return (
    <form className="px-4 py-3 lg:px-4">
      <label className="sr-only" htmlFor="team_id">
        Team
      </label>
      <select
        className="w-full rounded-md border border-red-300 bg-red-950 px-2 py-1 text-sm text-white disabled:opacity-60"
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
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </form>
  );
}
