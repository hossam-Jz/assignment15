import type { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../Utils/Response/Error.Response";

type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ValidationErrors: Array<{
      Key: KeyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];
    for (const Key of Object.keys(schema) as KeyReqType[]) {
      const KeySchema = schema[Key];
      if (!KeySchema) continue;

      const ValidationResults = KeySchema.safeParse(req[Key]);
      if (!ValidationResults.success) {
        ValidationErrors.push({
          Key,
          issues: ValidationResults.error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })),
        });
      }
    }

    if (ValidationErrors.length > 0) {
      throw new BadRequestException("Validation Errors", {
        cause: ValidationErrors,
      });
    }

    next();
  };
};
