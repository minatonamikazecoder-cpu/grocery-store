import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { AppDataSource } from "../db/data-source";
import { User } from "../models/User";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface DecodedToken {
  id: string;
}

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as DecodedToken;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedToken?.id);
    if (!isUuid) {
      throw new ApiError(401, "Invalid Access Token");
    }

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: decodedToken.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        profilePicture: true,
        role: true,
        status: true,
        token: true,
        authType: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, (error as Error)?.message || "Invalid access token");
  }
});

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    throw new ApiError(403, "Forbidden: Admin access required");
  }
};
