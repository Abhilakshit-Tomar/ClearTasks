export type Role = 'OWNER' | 'MEMBER';
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  project_type?: string;
  difficulty?: string;
  status: ProjectStatus;
  deadline: string;
  created_by: string;
  team_size: number;
  preferred_technologies?: string;
  instructor_requirements?: string;
  advanced_features?: string;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: Role;
  skills?: string;
  preferred_technologies?: string;
  joined_at: string;
  
  // Joined relation fields for the UI
  user?: User;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: MilestoneStatus;
  created_at: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  project_id: string;
  milestone_id?: string;
  assigned_to?: string;
  assigned_profile_id?: string;
  created_by: string;
  title: string;
  description?: string;
  phase: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  created_at: string;

  // Joined relations for the UI
  assignee?: User;
  milestone?: Milestone;
}

export interface TeamProfile {
  id: string;
  project_id: string;
  display_name: string;
  description?: string;
  skills?: string;
  experience_level?: string;
  preferred_work?: string;
  linked_user_id?: string;
  has_pending_invitation?: boolean;
  created_at: string;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  team_profile_id: string;
  email: string;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  
  // Extended fields for UI
  project_name?: string;
  display_name?: string;
  skills?: string;
  preferred_work?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  type: 'TASK_ASSIGNED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'PROJECT_INVITATION' | 'MILESTONE_COMPLETED';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// AI Specific Types
export interface AIProjectPlan {
  projectType: string;
  difficulty: string;
  estimatedTasks: number;
  timelineDays: number;
  modules: { name: string; description: string }[];
  phases: {
    name: string;
    order: number;
    tasks: {
      title: string;
      description: string;
      priority: TaskPriority;
      estimatedHours: number;
      dependsOn: string[];
      assignedToProfile?: string;
      milestoneId: string;
      relativeStartDay: number;
      relativeDueDay: number;
    }[];
  }[];
  milestones: { id: string; title: string; description: string; relativeDay: number }[];
  assignments: { taskTitle: string; memberPlaceholder: string }[];
}
