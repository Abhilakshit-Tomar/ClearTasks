import {
  Project,
  Task,
  ProjectMember,
  Milestone,
  Notification,
  AIProjectPlan,
  TeamProfile,
  ProjectInvitation,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

let getAuthToken: (() => Promise<string | null>) | null = null;
export const setTokenProvider = (provider: () => Promise<string | null>) => {
  getAuthToken = provider;
};

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { timeout = 30000, ...fetchOptions } = options;

  let token = "";
  if (getAuthToken) {
    token = (await getAuthToken()) || "";
  } else if (typeof window !== "undefined" && (window as any).Clerk?.session) {
    token = await (window as any).Clerk.session.getToken();
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: fetchOptions.signal
        ? AbortSignal.any([controller.signal, fetchOptions.signal])
        : controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
    });

    const data = await response.json().catch(() => {
      throw new Error(
        "The server returned an unreadable response. Please try again.",
      );
    });

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || "API request failed");
    }

    return data.data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(
        fetchOptions.signal?.aborted
          ? "Request cancelled"
          : "The request took too long. Please try again.",
      );
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

export const projectService = {
  getProjects: () => fetchApi<Project[]>(`/projects`),
  getProject: (id: string) => fetchApi<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project>) =>
    fetchApi<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    fetchApi<{ id: string }>(`/projects/${id}`, { method: "DELETE" }),
};

export const taskService = {
  getTasks: (projectId: string) =>
    fetchApi<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (projectId: string, data: Partial<Task>) =>
    fetchApi<Task>(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTaskStatus: (taskId: string, status: Task["status"]) =>
    fetchApi<Task>(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteTask: (taskId: string) =>
    fetchApi(`/tasks/${taskId}`, { method: "DELETE" }),
};

export const teamService = {
  getTeam: (projectId: string) =>
    fetchApi<ProjectMember[]>(`/projects/${projectId}/members`),
  getTeamProfiles: (projectId: string) =>
    fetchApi<TeamProfile[]>(`/projects/${projectId}/team-profiles`),
};

export const invitationService = {
  createInvitation: (data: {
    projectId: string;
    teamProfileId: string;
    email: string;
  }) =>
    fetchApi<string>("/invitations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPendingInvitations: () =>
    fetchApi<ProjectInvitation[]>(`/invitations/pending`),
  acceptInvitation: (id: string) =>
    fetchApi<{ projectId: string }>(`/invitations/${id}/accept`, {
      method: "POST",
    }),
  acceptTicketInvitation: () =>
    fetchApi<{ projectId: string }>("/invitations/accept", { method: "POST" }),
};

export const milestoneService = {
  getMilestones: (projectId: string) =>
    fetchApi<Milestone[]>(`/projects/${projectId}/milestones`),
};

export const notificationService = {
  getNotifications: () => fetchApi<Notification[]>(`/notifications`),
  markAsRead: (id: string) =>
    fetchApi<Notification>(`/notifications/${id}/read`, { method: "PUT" }),
};

// AI service with real endpoints
export const aiService = {
  async analyzeProject(
    details: any,
    signal?: AbortSignal,
  ): Promise<AIProjectPlan> {
    return fetchApi<AIProjectPlan>("/ai/analyze", {
      method: "POST",
      body: JSON.stringify(details),
      timeout: 60000,
      signal,
    });
  },
  async improvePlan(
    details: any,
    signal?: AbortSignal,
  ): Promise<AIProjectPlan> {
    return fetchApi<AIProjectPlan>("/ai/improve-plan", {
      method: "POST",
      body: JSON.stringify(details),
      timeout: 60000,
      signal,
    });
  },
};
