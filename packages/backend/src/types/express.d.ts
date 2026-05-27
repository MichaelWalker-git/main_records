declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      roles: string[];
      agencyId: string;
      agencyScope: string[];
    };
  }
}
