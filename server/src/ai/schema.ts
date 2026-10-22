import { Type, type Schema } from "@google/genai";

// Required fields at every level keep incomplete tasks out of review and persistence.
export const planResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projectType: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    estimatedTasks: { type: Type.INTEGER },
    timelineDays: { type: Type.INTEGER },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "description"],
      },
    },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          order: { type: Type.INTEGER },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: {
                  type: Type.STRING,
                  enum: ["LOW", "MEDIUM", "HIGH"],
                },
                estimatedHours: { type: Type.INTEGER },
                dependsOn: { type: Type.ARRAY, items: { type: Type.STRING } },
                assignedToProfile: { type: Type.STRING },
                milestoneId: { type: Type.STRING },
                relativeStartDay: { type: Type.INTEGER },
                relativeDueDay: { type: Type.INTEGER },
              },
              required: [
                "title",
                "description",
                "priority",
                "estimatedHours",
                "dependsOn",
                "assignedToProfile",
                "milestoneId",
                "relativeStartDay",
                "relativeDueDay",
              ],
            },
          },
        },
        required: ["name", "order", "tasks"],
      },
    },
    milestones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          relativeDay: { type: Type.INTEGER },
        },
        required: ["id", "title", "description", "relativeDay"],
      },
    },
    assignments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskTitle: { type: Type.STRING },
          memberPlaceholder: { type: Type.STRING },
        },
        required: ["taskTitle", "memberPlaceholder"],
      },
    },
  },
  required: [
    "projectType",
    "difficulty",
    "estimatedTasks",
    "timelineDays",
    "modules",
    "phases",
    "milestones",
    "assignments",
  ],
};
