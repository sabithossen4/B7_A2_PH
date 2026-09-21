import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../db";
import config from "../../config";
import { AppError } from "../../utils/appError";
import type { LoginInput, PublicUser, SignupInput } from "./auth.interface";

interface UserWithPassword extends PublicUser {
  password: string;
}

interface DatabaseError {
  code?: string;
}

const signup = async (payload: SignupInput): Promise<PublicUser> => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  try {
    const result = await pool.query<PublicUser>(`
      INSERT INTO devpulse.users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `, [payload.name, payload.email, hashedPassword, payload.role]);

    const user = result.rows[0];
    if (!user) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Could not create user");
    }
    return user;
  } catch (error: unknown) {
    if ((error as DatabaseError).code === "23505") {
      throw new AppError(StatusCodes.BAD_REQUEST, "A user with this email already exists");
    }
    throw error;
  }
};

const login = async (payload: LoginInput): Promise<{ token: string; user: PublicUser }> => {
  const result = await pool.query<UserWithPassword>(`
    SELECT id, name, email, password, role, created_at, updated_at
    FROM devpulse.users
    WHERE email = $1
  `, [payload.email]);

  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(payload.password, user.password))) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]> },
  );
  const { password: _password, ...publicUser } = user;
  return { token, user: publicUser };
};

export const authService = { signup, login };
