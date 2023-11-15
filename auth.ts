import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credential from 'next-auth/providers/credentials';
import { z } from 'zod';
import { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';

async function getUser(email: string): Promise<User> {
  try {
    const user = await sql<User>`
    SELECT * FROM users WHERE email = ${email}
  `;

    return user.rows[0];
  } catch (error) {
    console.log({ error });
    throw new Error('Failed to get user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credential({
      async authorize(credentials) {
        const parsedCredentials = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);

          if (user) {
            const passwordMatches = await bcrypt.compare(password, user.password);

            if (passwordMatches) {
              return user;
            }
          }
        }

        console.log('Invalid credentials.')

        return null;
      }
    })
  ]
});