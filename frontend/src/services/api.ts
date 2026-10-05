import { Project, Task, ProjectMember, Milestone, Notification, AIProjectPlan } from '../types';
import { mockAIPlan } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let getAuthToken: (() => Promise<string | null>) | null = null;
export const setTokenProvider = (provider: () => Promise<string | null>) => {
  getAuthToken = provider;
};

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let token = '';
  if (getAuthToken) {
    token = await getAuthToken() || '';
  } else if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
    token = await (window as any).Clerk.session.getToken();
  }

  console.log('Sending request to', url, 'with token length:', token.length);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'API request failed');
  }
  
  return data.data;
}

export const projectService = {
  getProjects: () => fetchApi<Project[]>(`/projects`),
  getProject: (id: string) => fetchApi<Project>(`/projects/${id}`),
  createProject: (data: Partial<Project>) => 
    fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) => fetchApi<{ id: string }>(`/projects/${id}`, { method: 'DELETE' }),
};

export const taskService = {
  getTasks: (projectId: string) => fetchApi<Task[]>(`/projects/${projectId}/tasks`),
  createTask: (projectId: string, data: Partial<Task>) =>
    fetchApi<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTaskStatus: (taskId: string, status: Task['status']) =>
    fetchApi<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deleteTask: (taskId: string) => fetchApi(`/tasks/${taskId}`, { method: 'DELETE' }),
};

export const teamService = {
  getTeam: (projectId: string) => fetchApi<ProjectMember[]>(`/projects/${projectId}/members`),
};

export const milestoneService = {
  getMilestones: (projectId: string) => fetchApi<Milestone[]>(`/projects/${projectId}/milestones`),
};

export const notificationService = {
  getNotifications: () => fetchApi<Notification[]>(`/notifications`),
  markAsRead: (id: string) => fetchApi<Notification>(`/notifications/${id}/read`, { method: 'PUT' }),
};

// AI service remains mocked for Step 3C
export const aiService = {
  async analyzeProject(_details: any): Promise<AIProjectPlan> {
    await new Promise(r => setTimeout(r, 2000));
    return mockAIPlan;
  },
  async improvePlan(_details: any): Promise<AIProjectPlan> {
    await new Promise(r => setTimeout(r, 2000));
    return {
      ...mockAIPlan,
      tasks: [
        ...mockAIPlan.tasks,
        { title: 'Add Advanced Analytics', phase: 'Development', priority: 'MEDIUM', estimated_hours: 12 }
      ]
    };
  }
};
