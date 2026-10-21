import type { IncomingMessage, ServerResponse } from "node:http";

function seed() {
  const projects = [
    {
      id: "campus-garden",
      name: "Campus garden",
      description: "A greener courtyard, built together.",
      project_type: "Community project",
      deadline: "2026-11-12",
      team_size: 4,
      status: "ACTIVE",
    },
    {
      id: "study-buddy",
      name: "Study buddy",
      description: "A study planner that makes busy weeks a little easier.",
      project_type: "Web application",
      deadline: "2026-11-20",
      team_size: 3,
      status: "ACTIVE",
    },
    {
      id: "film-festival",
      name: "The little film festival",
      description: "An evening of stories made by students, for students.",
      project_type: "Campus event",
      deadline: "2026-12-04",
      team_size: 5,
      status: "ACTIVE",
    },
  ];
  const profiles = [
    "Alex Morgan",
    "Riya Kapoor",
    "Jamie Shah",
    "Noor Patel",
  ].map((name, index) => ({
    id: `p${index}`,
    project_id: "campus-garden",
    display_name: name,
    skills: [
      "Research, writing",
      "Design, mapping",
      "Presentation, planning",
      "Coordination",
    ][index],
    preferred_work: ["Research", "Design", "Proposal", "Team planning"][index],
    linked_user_id: index === 0 ? "student1" : null,
    has_pending_invitation: index === 2,
  }));
  const milestones = [
    {
      id: "m1",
      project_id: "campus-garden",
      title: "Plan the garden",
      description: "Set the direction and understand the space.",
      due_date: "2026-10-19",
      status: "COMPLETED",
    },
    {
      id: "m2",
      project_id: "campus-garden",
      title: "Proposal ready",
      description: "Turn the research into a proposal for the campus.",
      due_date: "2026-10-30",
      status: "PENDING",
    },
    {
      id: "m3",
      project_id: "campus-garden",
      title: "Time to plant",
      description: "Bring the garden to life together.",
      due_date: "2026-11-12",
      status: "PENDING",
    },
  ];
  const titles = [
    "Choose a project area",
    "Meet the campus team",
    "Measure the courtyard",
    "Make a materials list",
    "Outline the proposal",
    "Agree on a direction",
    "Research native plants",
    "Map the courtyard",
    "Prepare the proposal",
    "Book a team review",
  ];
  const tasks = titles.map((title, index) => ({
    id: `t${index + 1}`,
    project_id: "campus-garden",
    milestone_id: index < 6 ? "m1" : index < 9 ? "m2" : "m3",
    title,
    description:
      "Bring your findings to the next team check-in, with a few clear recommendations.",
    phase: index < 6 ? "Planning" : "Proposal",
    status: index < 6 ? "DONE" : index === 6 ? "IN_PROGRESS" : "TODO",
    priority: index === 6 ? "HIGH" : "MEDIUM",
    due_date:
      index < 6
        ? "2026-10-19"
        : ["2026-10-24", "2026-10-26", "2026-10-28", "2026-10-30"][index - 6],
    estimated_hours: 2,
    assigned_profile_id: `p${index % 4}`,
    planned_profile: profiles[index % 4],
    milestone: milestones[index < 6 ? 0 : index < 9 ? 1 : 2],
  }));
  const notifications = [
    {
      id: "n1",
      type: "TASK_ASSIGNED",
      title: "A new step with your name on it.",
      message:
        "Research native plants has been assigned to you in Campus garden.",
      project_id: "campus-garden",
      task_id: "t7",
      is_read: false,
      created_at: "2026-10-21T04:00:00Z",
    },
    {
      id: "n2",
      type: "MILESTONE_COMPLETED",
      title: "The first milestone is complete.",
      message: "Your team finished planning the garden. Next up: the proposal.",
      project_id: "campus-garden",
      is_read: true,
      created_at: "2026-10-20T04:00:00Z",
    },
  ];
  return {
    projects,
    profiles,
    milestones,
    tasks,
    notifications,
    counts: { createProject: 0, createTask: 0, updateTask: 0, invitations: 0 },
    projectLoads: 0,
  };
}
const cases = new Map<string, ReturnType<typeof seed>>();

export async function fixtureMiddleware(
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) {
  if (!request.url?.startsWith("/api/")) {
    next();
    return;
  }
  const url = new URL(request.url, "http://127.0.0.1:5180");
  const [, headerCase = "default", mode = "normal"] = (
    request.headers.authorization || ""
  )
    .replace("Bearer ", "")
    .split(":");
  const caseId = url.searchParams.get("case") || headerCase;
  const state = cases.get(caseId) || seed();
  cases.set(caseId, state);
  const path = url.pathname.replace("/api", "");
  response.setHeader("Content-Type", "application/json");
  const send = (data: unknown) => {
    response.end(JSON.stringify({ success: true, data }));
  };
  const fail = (message: string) => {
    response.statusCode = 503;
    response.end(JSON.stringify({ success: false, error: { message } }));
  };
  if (path === "/__stats") {
    send(state.counts);
    return;
  }
  if (mode === "slow" || request.method !== "GET")
    await new Promise((resolve) =>
      setTimeout(resolve, request.method === "GET" ? 900 : 700),
    );
  if (mode === "error" && request.method === "GET") {
    fail("The example service is temporarily unavailable. Your work is kept.");
    return;
  }
  if (mode === "retry" && path === "/projects" && ++state.projectLoads <= 2) {
    fail("The first request failed. Try again to recover.");
    return;
  }
  if (
    mode === "status-error" &&
    request.method === "PUT" &&
    path.startsWith("/tasks/")
  ) {
    state.counts.updateTask++;
    fail("Task status could not be saved. Please try again.");
    return;
  }
  if (mode === "summary-error" && path.endsWith("/milestones")) {
    fail("Milestone details are temporarily unavailable.");
    return;
  }
  let body: any = {};
  if (request.method !== "GET") {
    try {
      let raw = "";
      for await (const chunk of request) raw += chunk;
      body = raw ? JSON.parse(raw) : {};
    } catch {
      // Cancelling generation can close its request before the artificial delay ends.
      // Keep the isolated preview alive when that client has already disconnected.
      if (!request.destroyed && !response.destroyed)
        fail("The fixture request body could not be read.");
      return;
    }
  }
  if (path === "/projects" && request.method === "GET") {
    send(mode === "empty" ? [] : state.projects);
    return;
  }
  if (path === "/projects" && request.method === "POST") {
    state.counts.createProject++;
    if (mode === "create-error") {
      fail("The example project could not be created. Your plan is kept.");
      return;
    }
    send({ ...state.projects[0], ...body, id: "campus-garden" });
    return;
  }
  if (/^\/projects\/[^/]+$/.test(path)) {
    if (request.method === "DELETE")
      state.projects = state.projects.filter(
        (project) => project.id !== path.split("/")[2],
      );
    send(
      state.projects.find((project) => project.id === path.split("/")[2]) ||
        state.projects[0],
    );
    return;
  }
  if (path.endsWith("/tasks")) {
    const projectId = path.split("/")[2];
    if (request.method === "POST") {
      state.counts.createTask++;
      const task = {
        ...state.tasks[6],
        ...body,
        id: `new-${state.counts.createTask}`,
        project_id: projectId,
      };
      state.tasks.push(task);
      send(task);
    } else
      send(
        mode === "empty"
          ? []
          : state.tasks.filter((task) => task.project_id === projectId),
      );
    return;
  }
  if (path.startsWith("/tasks/")) {
    const id = path.split("/")[2];
    if (request.method === "DELETE")
      state.tasks = state.tasks.filter((task) => task.id !== id);
    if (request.method === "PUT") {
      state.counts.updateTask++;
      state.tasks = state.tasks.map((task) =>
        task.id === id ? { ...task, ...body } : task,
      );
    }
    send(state.tasks.find((task) => task.id === id) || { id });
    return;
  }
  if (path.endsWith("/milestones")) {
    const projectId = path.split("/")[2];
    send(
      mode === "empty"
        ? []
        : state.milestones
            .filter((milestone) => milestone.project_id === projectId)
            .map((milestone) => ({
              ...milestone,
              tasks: state.tasks.filter(
                (task) => task.milestone_id === milestone.id,
              ),
            })),
    );
    return;
  }
  if (path.endsWith("/team-profiles")) {
    send(state.profiles);
    return;
  }
  if (path.endsWith("/members")) {
    send([
      {
        id: "member1",
        user_id: "student1",
        role: "OWNER",
        skills: "Research, writing",
        user: { name: "Alex Morgan", email: "alex@example.test" },
      },
    ]);
    return;
  }
  if (path === "/notifications") {
    send(mode === "empty" ? [] : state.notifications);
    return;
  }
  if (path.startsWith("/notifications/")) {
    const id = path.split("/")[2];
    state.notifications = state.notifications.map((item) =>
      item.id === id ? { ...item, is_read: true } : item,
    );
    send(state.notifications.find((item) => item.id === id));
    return;
  }
  if (path === "/invitations/pending") {
    send([
      {
        id: "invite1",
        project_name: "Campus garden",
        display_name: "Alex Morgan",
      },
    ]);
    return;
  }
  if (path === "/invitations" && request.method === "POST") {
    state.counts.invitations++;
    state.profiles = state.profiles.map((profile) =>
      profile.id === body.teamProfileId
        ? { ...profile, has_pending_invitation: true }
        : profile,
    );
    send("sent");
    return;
  }
  if (path.startsWith("/invitations/")) {
    send({ projectId: "campus-garden" });
    return;
  }
  if (path.startsWith("/ai/")) {
    send({
      projectType: "Community project",
      difficulty: "Intermediate",
      timelineDays: 22,
      estimatedTasks: 2,
      modules: [],
      phases: [
        {
          name: "Planning",
          order: 1,
          tasks: [
            {
              title: "Research native plants",
              description: "Review native plants for the campus.",
              priority: "MEDIUM",
              estimatedHours: 2,
              dependsOn: [],
              assignedToProfile: "Alex Morgan",
              milestoneId: "m1",
              relativeStartDay: 0,
              relativeDueDay: 3,
            },
          ],
        },
      ],
      milestones: [
        {
          id: "m1",
          title: "Proposal ready",
          description: "A proposal to share with campus.",
          relativeDay: 7,
        },
      ],
      assignments: [],
    });
    return;
  }
  fail("Unknown fixture endpoint.");
}
