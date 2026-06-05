import { D1Database } from "@cloudflare/workers-types";

export interface Bindings {
  DB: D1Database;
  JWT_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_UPLOAD_PRESET: string;
}

export type AppEnv = { Bindings: Bindings };
