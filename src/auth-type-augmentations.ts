/**
 * Type-only augmentations for Auth.js / NextAuth v5.
 * Importing `@auth/core/jwt` ensures `declare module "@auth/core/jwt"` resolves during `next build`.
 */
import type { RegistrationPersona, TherapistVerificationStatus, UserRole } from "@prisma/client";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      therapistVerification: TherapistVerificationStatus;
      registrationPersona: RegistrationPersona | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    therapistVerification?: TherapistVerificationStatus;
    registrationPersona?: RegistrationPersona | null;
  }
}

export {};
