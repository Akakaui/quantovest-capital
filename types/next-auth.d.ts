import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "investor" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "investor" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "investor" | "admin";
  }
}
