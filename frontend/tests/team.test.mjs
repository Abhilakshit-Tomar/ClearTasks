import test from "node:test";
import assert from "node:assert/strict";
import { teamMemberIdentity } from "../src/lib/team.ts";

test("connected members use the flat REST name and avatar fields", () => {
  const identity = teamMemberIdentity(
    { user_id: "u1", name: "Alex Morgan", avatar_url: "/avatar.png" },
    [],
  );
  assert.equal(identity.name, "Alex Morgan");
  assert.equal(identity.initials, "AM");
  assert.equal(identity.avatarUrl, "/avatar.png");
});
test("connecting a profile preserves its project name, skills, and preferred work", () => {
  const identity = teamMemberIdentity(
    { user_id: "u1", name: "Different account name" },
    [
      {
        linked_user_id: "u1",
        display_name: "Riya Kapoor",
        skills: "React, frontend",
        preferred_work: "Interface design",
      },
    ],
  );
  assert.equal(identity.name, "Riya Kapoor");
  assert.equal(identity.initials, "RK");
  assert.equal(identity.skills, "React, frontend");
  assert.equal(identity.preferredWork, "Interface design");
});
test("legacy nested user responses still resolve a name", () => {
  assert.equal(
    teamMemberIdentity({ user_id: "u1", user: { name: "Noor Patel" } }, [])
      .name,
    "Noor Patel",
  );
});
test("missing names do not expose account email fallbacks", () => {
  const identity = teamMemberIdentity(
    {
      user_id: "u1",
      name: "student@example.test",
      user: { name: "student@example.test", email: "student@example.test" },
    },
    [],
  );
  assert.equal(identity.name, "Name not provided");
  assert.equal(identity.initials, null);
  assert.equal(
    JSON.stringify(identity).includes("student@example.test"),
    false,
  );
});
test("names are trimmed and non-Latin initials remain readable", () => {
  assert.equal(
    teamMemberIdentity({ user_id: "u1", name: "  李 明  " }, []).initials,
    "李明",
  );
});
