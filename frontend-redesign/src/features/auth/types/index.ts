import { z } from 'zod';

export type UserRole = 'ROLE_STUDENT' | 'ROLE_ORGANIZER' | 'ROLE_ADMIN';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  clubId?: number;
  clubName?: string;
  rollNumber?: string;
  department?: string;
}

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(100),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  email: z
    .string()
    .trim()
    .email('Valid email address is required')
    .refine((val) => val.endsWith('@klh.edu.in') || val.endsWith('.edu') || val.includes('.edu.'), {
      message: 'Institutional email is required (@klh.edu.in or ending with .edu)',
    }),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  rollNumber: z.string().trim().min(2, 'Roll number is required').max(50),
  department: z.string().trim().min(2, 'Department is required').max(100),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const adminLoginSchema = loginSchema;
export type AdminLoginFormData = LoginFormData;
