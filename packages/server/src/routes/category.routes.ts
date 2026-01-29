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
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authMiddleware, (req, res) =>
  categoryController.getAll(req, res)
);

export default router;
