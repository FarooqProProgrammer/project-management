import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define the structure of the user
interface User {
  id: string; // Required by NextAuth
  username: string;
  email: string;
  isAdmin: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

// Define the structure of the credentials
interface LoginCredentials {
  username?: string;
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials: LoginCredentials | undefined): User | null {
        if (!credentials) {
          return null;
        }

        const { username, email, isAdmin, avatar, _id, createdAt, updatedAt } = credentials as any;

        if (username && email && isAdmin !== undefined && avatar && _id && createdAt && updatedAt) {
          // Map _id to id to satisfy NextAuth requirements
          return {
            id: _id, // Map MongoDB's _id to id
            username,
            email,
            isAdmin,
            avatar,
            createdAt,
            updatedAt,
          };
        }

        // Return null if validation fails
        return null;
      },
    }),
  ],
  pages:{
    signIn: '/auth/signin',
  }
};
