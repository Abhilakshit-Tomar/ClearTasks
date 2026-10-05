import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required'),
  project_type: z.string().max(100).optional().nullable(),
  difficulty: z.string().max(30).optional().nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  created_by: z.string().uuid('Invalid user UUID'),
  team_size: z.number().int().min(1),
  preferred_technologies: z.string().optional().nullable(),
  instructor_requirements: z.string().optional().nullable(),
  advanced_features: z.string().optional().nullable(),
});

export const projectUpdateSchema = projectSchema.partial();

export const projectMemberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['OWNER', 'MEMBER']).default('MEMBER'),
  skills: z.string().optional().nullable(),
  preferred_technologies: z.string().optional().nullable(),
});

export const milestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
});

export const milestoneUpdateSchema = milestoneSchema.partial();

export const taskSchema = z.object({
  milestone_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  created_by: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  phase: z.string().min(1).max(100),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }).optional().nullable(),
  estimated_hours: z.number().min(0).optional().nullable(),
});

export const taskUpdateSchema = taskSchema.partial();

export const aiAnalyzeSchema = z.object({
  projectTitle: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  teamSize: z.number().int().min(1),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
});

export const aiImproveSchema = aiAnalyzeSchema.extend({
  originalPlan: z.any(),
  improvements: z.object({
    similarSkillLevels: z.boolean().optional(),
    assignByStrengths: z.boolean().optional(),
    teamSkills: z.array(z.object({ name: z.string(), skills: z.array(z.string()) })).optional(),
    preferredTechnology: z.string().optional(),
    instructorRequirements: z.string().optional(),
    advancedFeatures: z.array(z.string()).optional(),
  })
});