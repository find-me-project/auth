import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { format } from 'date-fns';
import cors from 'cors';
import { isEmpty } from 'lodash';
import { config } from 'dotenv';
import routes from './routes';

config();

process.env.TZ = 'GMT-3';

const {
  API_PORT,
  API_ROOT,
} = process.env;
const PORT = API_PORT || 3000;

const app: express.Application = express();

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  next();
});

morgan.token('localdate', () => format(new Date(), 'HH:mm:ss'));
morgan.token('params', (request: Request) => {
  const { body } = request;

  if (isEmpty(body)) {
    return '';
  }

  return `${JSON.stringify(body)}`;
});

app.use(morgan('[:status - :localdate] :method :url :params - :response-time ms'));
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: [
    `http://localhost:${PORT}`,
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Methods',
    'Access-Control-Request-Headers',
  ],
  credentials: true,
}));
app.use(API_ROOT!, routes);

app.listen(PORT, () => {
  /* eslint-disable-next-line no-console */
  console.log(`App is listening on port ${PORT}`);
});
