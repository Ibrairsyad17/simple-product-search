import { Router } from 'express';
import { productController } from '../controllers';
import { authMiddleware } from '../middlewares';

const router = Router();

router.get('/', authMiddleware, (req, res) =>
  productController.search(req, res)
);

router.get('/:id', authMiddleware, (req, res) =>
  productController.getById(req, res)
);

export default router;
