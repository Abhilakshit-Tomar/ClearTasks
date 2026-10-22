import type { ProjectMember, TeamProfile } from "../types/index";

function displayName(value?: string): string | undefined {
  const name = value?.trim();
  // Some accounts were originally saved with their email as the account name.
  // Never expose that fallback as a public team identity.
  return name && !/^[^\s@]+@[^\s@]+$/.test(name) ? name : undefined;
}

export function teamMemberIdentity(
  member: ProjectMember,
  profiles: TeamProfile[],
) {
  const profile = profiles.find(
    (item) => item.linked_user_id === member.user_id,
  );
  const name =
    displayName(profile?.display_name) ||
    displayName(member.user?.name) ||
    displayName(member.name);
  const words = name?.split(/\s+/) || [];
  const initials = words.length
    ? [words[0], ...(words.length > 1 ? [words[words.length - 1]] : [])]
        .map((word) => Array.from(word)[0])
        .join("")
        .toLocaleUpperCase()
    : null;
  return {
    name: name || "Name not provided",
    initials,
    avatarUrl: member.user?.avatar_url || member.avatar_url,
    skills: member.skills?.trim() || profile?.skills?.trim(),
    preferredWork:
      profile?.preferred_work?.trim() || member.preferred_technologies?.trim(),
    description: profile?.description?.trim(),
  };
}
