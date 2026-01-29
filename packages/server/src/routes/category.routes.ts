import { Router } from 'express';
import { authMiddleware } from '../middlewares';

const router = Router();
import { categoryController } from '../controllers';

router.get('/', authMiddleware, (req, res) =>
  categoryController.getAll(req, res)
);

export default router;
