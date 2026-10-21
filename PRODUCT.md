# ClearTasks

<!-- impeccable:product-schema 1 -->

## Platform
Web. React 19, TypeScript, Vite, Tailwind CSS 3, Radix primitives, Lucide, Clerk authentication, and the existing Express/PostgreSQL REST API.

## Users
Student teams coordinating group projects, including first-time coordinators and members checking the next task on a phone between classes.

## Product Purpose
Answer “Who is doing what, and are we on track?” Turn a project brief, deadline, and team profiles into a suggested plan, then track tasks, ownership, milestones, and workload.

## Operating Context
Describe a project; introduce the team; generate and review an AI plan; optionally refine; confirm and open the workspace. Members use the directory, overview, task board/list, task details, milestones, team invitations, and notifications.

## Capabilities and Constraints
- Review AI suggestions before creating a project. Generation is asynchronous; progress stages are not supplied by the current API.
- Keep existing authentication and REST contracts; no database migration, cover-upload feature, or notification-delivery backend is part of this redesign.
- Show truthful empty/error/pending states, protect repeated submissions, support keyboard and touch, and respect reduced motion.
- Password recovery uses Clerk’s supported email-code SDK strategy. Standard sign-in, email verification, and additional factors use Clerk’s maintained UI.
- Preserve the existing dashboard’s task attention, upcoming work, milestone progress, and team workload capabilities.

## Brand Commitments
The user approved a light creative studio: warm ivory, readable ink, forest-green actions, expressive editorial headlines, and restrained sunlight/glow. One ClearTasks identity, with stable individual project accents in saffron, terracotta, lilac, and green. Lively through real work and responsive feedback. Generated concept images are illustrative; their sample data and extra tabs do not expand scope.

## Evidence on Hand
The implementation plan supplied by the user, existing source and technical specification, two generated design concepts, and Shoogle research into Arc button/stepper and Animata hover-shine patterns.
