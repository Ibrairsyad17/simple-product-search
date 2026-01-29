import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './src/config';
import cookieParser from 'cookie-parser';
import routes from './src/routes';
import { errorHandler, notFoundHandler } from './src/middlewares';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Simple Product Search API Docs',
  })
);

// Swagger JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// checking status local server
app.get('/check-health', (_req, res) => {
  try {
    res.status(200).json({
      code: 200,
      status: 'ok',
      message: 'Simple Check Test',
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: 'Internal Server Error',
    });
  }
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`
  );
});
