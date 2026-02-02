import { Router } from 'express';
import { authMiddleware } from '../middlewares';
import { categoryController } from '../controllers';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 */
router.get('/', (req, res) => categoryController.getAll(req, res));

export default router;
