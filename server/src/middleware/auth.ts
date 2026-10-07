import { requireAuth, clerkClient, getAuth } from '@clerk/express';
import { query } from '../db';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      dbUser?: { id: string; clerk_user_id: string; name: string; email: string };
    }
  }
}

export const attachDbUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authState = getAuth(req);
    const clerkId = authState?.userId;
    if (!clerkId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    let result = await query('SELECT * FROM users WHERE clerk_user_id = $1', [clerkId]);

    if (result.rows.length === 0) {
      // Fetch user details from Clerk
      const user = await clerkClient.users.getUser(clerkId);
      const email = user.emailAddresses[0]?.emailAddress || '';
      const name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : email;

      const insertResult = await query(
        'INSERT INTO users (clerk_user_id, name, email) VALUES ($1, $2, $3) RETURNING *',
        [clerkId, name, email]
      );
      req.dbUser = insertResult.rows[0];
    } else {
      req.dbUser = result.rows[0];
    }
    
    next();
  } catch (error) {
    console.error('Error in attachDbUser:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error during auth' } });
  }
};
