import { Project, Task, ProjectMember, Milestone, Notification, AIProjectPlan } from '../types';
import { mockProjects, mockTasks, mockProjectMembers, mockMilestones, mockNotifications, mockAIPlan } from '../data/mockData';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const projectService = {
  async getProjects(): Promise<Project[]> {
    await delay(500);
    return mockProjects;
  },
  async getProject(id: string): Promise<Project | undefined> {
    await delay(300);
    return mockProjects.find(p => p.id === id);
  },
  async createProject(data: Partial<Project>): Promise<Project> {
    await delay(800);
    const newProject = { ...data, id: `p${Date.now()}`, status: 'ACTIVE', created_at: new Date().toISOString() } as Project;
    mockProjects.push(newProject);
    return newProject;
  }
};

export const taskService = {
  async getTasks(projectId: string): Promise<Task[]> {
    await delay(500);
    return mockTasks.filter(t => t.project_id === projectId);
  },
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    await delay(300);
    const task = mockTasks.find(t => t.id === taskId);
    if (task) task.status = status;
  }
};

export const teamService = {
  async getTeam(projectId: string): Promise<ProjectMember[]> {
    await delay(400);
    return mockProjectMembers.filter(pm => pm.project_id === projectId);
  }
};

export const milestoneService = {
  async getMilestones(projectId: string): Promise<Milestone[]> {
    await delay(400);
    return mockMilestones.filter(m => m.project_id === projectId);
  }
};

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await delay(300);
    return mockNotifications;
  },
  async markAsRead(id: string): Promise<void> {
    await delay(200);
    const notif = mockNotifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
  }
};

export const aiService = {
  async analyzeProject(_details: any): Promise<AIProjectPlan> {
    await delay(2000); // Simulate AI loading
    return mockAIPlan;
  },
  async improvePlan(_details: any): Promise<AIProjectPlan> {
    await delay(2000); // Simulate AI loading
    return {
      ...mockAIPlan,
      tasks: [
        ...mockAIPlan.tasks,
        { title: 'Add Advanced Analytics', phase: 'Development', priority: 'MEDIUM', estimated_hours: 12 }
      ]
    };
  }
};
