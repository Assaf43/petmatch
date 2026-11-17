import { petProfileSchema, recommend } from '@petmatch/core';
import type { Food } from '@petmatch/core';
import cors from 'cors';
import express from 'express';
import type { ErrorRequestHandler, Express } from 'express';
import { AppError, toErrorBody } from './errors.js';

export interface AppDeps {
  listFoods: () => Promise<Food[]>;
  webOrigin: string;
}

/** Body-parser errors carry a `type`; anything else is treated as unexpected. */
function bodyParserError(err: unknown): AppError | null {
  if (typeof err !== 'object' || err === null || !('type' in err)) return null;
  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(413, 'VALIDATION_ERROR', 'Request body is too large');
  }
  return null;
}

// Express identifies an error handler by its four parameters, so `_next` must stay.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleError: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const known = err instanceof AppError ? err : bodyParserError(err);
  if (known) {
    res.status(known.statusCode).json(toErrorBody(known.code, known.message));
    return;
  }
  // Log server-side only; the client never sees the message or stack.
  console.error(err);
  res.status(500).json(toErrorBody('INTERNAL_ERROR', 'Something went wrong'));
};

export function createApp(deps: AppDeps): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: deps.webOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/foods', async (_req, res) => {
    res.json(await deps.listFoods());
  });

  app.post('/api/recommendations', async (req, res) => {
    const parsed = petProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
        .join('; ');
      throw new AppError(400, 'VALIDATION_ERROR', message);
    }
    res.json(recommend(parsed.data, await deps.listFoods()));
  });

  app.use((_req, _res, next) => {
    next(new AppError(404, 'NOT_FOUND', 'Route not found'));
  });
  app.use(handleError);

  return app;
}
