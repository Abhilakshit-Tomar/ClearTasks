import { User, Project, ProjectMember, Task, Milestone, Notification, AIProjectPlan } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    clerk_user_id: 'clerk1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=alice',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u2',
    clerk_user_id: 'clerk2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=bob',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u3',
    clerk_user_id: 'clerk3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=charlie',
    created_at: new Date().toISOString(),
  }
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Smart Campus Portal',
    description: 'A web portal for students to manage courses and campus activities.',
    project_type: 'Web Application',
    difficulty: 'Medium',
    status: 'ACTIVE',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'u1',
    team_size: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'AI Study Assistant',
    description: 'Mobile app to generate quizzes based on notes.',
    project_type: 'Mobile App',
    difficulty: 'Hard',
    status: 'ACTIVE',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'u1',
    team_size: 4,
    created_at: new Date().toISOString(),
  }
];

export const mockProjectMembers: ProjectMember[] = [
  {
    id: 'pm1',
    project_id: 'p1',
    user_id: 'u1',
    role: 'OWNER',
    skills: 'React, Node.js',
    joined_at: new Date().toISOString(),
    user: mockUsers[0],
  },
  {
    id: 'pm2',
    project_id: 'p1',
    user_id: 'u2',
    role: 'MEMBER',
    skills: 'UI/UX, CSS',
    joined_at: new Date().toISOString(),
    user: mockUsers[1],
  },
  {
    id: 'pm3',
    project_id: 'p1',
    user_id: 'u3',
    role: 'MEMBER',
    skills: 'Database, API',
    joined_at: new Date().toISOString(),
    user: mockUsers[2],
  }
];

export const mockMilestones: Milestone[] = [
  {
    id: 'm1',
    project_id: 'p1',
    title: 'Planning Complete',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm2',
    project_id: 'p1',
    title: 'Design Complete',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'IN_PROGRESS',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm3',
    project_id: 'p1',
    title: 'Development Complete',
    due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    created_at: new Date().toISOString(),
  }
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    project_id: 'p1',
    milestone_id: 'm1',
    assigned_to: 'u1',
    created_by: 'u1',
    title: 'Write Technical Specification',
    phase: 'Planning',
    status: 'DONE',
    priority: 'HIGH',
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 5,
    created_at: new Date().toISOString(),
    assignee: mockUsers[0],
    milestone: mockMilestones[0]
  },
  {
    id: 't2',
    project_id: 'p1',
    milestone_id: 'm2',
    assigned_to: 'u2',
    created_by: 'u1',
    title: 'Design Figma Wireframes',
    phase: 'Design',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 15,
    created_at: new Date().toISOString(),
    assignee: mockUsers[1],
    milestone: mockMilestones[1]
  },
  {
    id: 't3',
    project_id: 'p1',
    milestone_id: 'm3',
    assigned_to: 'u3',
    created_by: 'u1',
    title: 'Setup Database Schema',
    phase: 'Development',
    status: 'TODO',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 8,
    created_at: new Date().toISOString(),
    assignee: mockUsers[2],
    milestone: mockMilestones[2]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    user_id: 'u1',
    type: 'TASK_ASSIGNED',
    title: 'Task Assigned',
    message: 'You have been assigned to "Write Technical Specification"',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'n2',
    user_id: 'u1',
    type: 'MILESTONE_COMPLETED',
    title: 'Milestone Completed',
    message: 'Planning Complete milestone is done!',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const mockAIPlan: AIProjectPlan = {
  projectType: 'Web Application',
  difficulty: 'Medium',
  estimatedTasks: 12,
  timeline: '4 weeks',
  modules: ['Authentication', 'User Dashboard', 'Admin Panel'],
  phases: ['Planning', 'Design', 'Development', 'Testing'],
  milestones: [
    { title: 'Planning Phase', description: 'Requirements gathered', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    { title: 'MVP Development', description: 'Core features built', due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString() },
    { title: 'Final Testing', description: 'Bug fixes and polish', due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  tasks: [
    { title: 'Setup Repo', phase: 'Planning', priority: 'HIGH', estimated_hours: 2 },
    { title: 'Design DB Schema', phase: 'Planning', priority: 'HIGH', estimated_hours: 4 },
    { title: 'Create Wireframes', phase: 'Design', priority: 'MEDIUM', estimated_hours: 8 },
    { title: 'Implement Auth', phase: 'Development', priority: 'HIGH', estimated_hours: 10 },
  ],
  assignments: [],
  dependencies: []
};
