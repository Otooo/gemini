import { Router } from 'express';
import { MeasureController } from '../controllers/measure-controller';
import { MeasureValidate } from '../middlewares/measure-middleware';

const router: Router = Router();

router.get('/:customer_code/list', MeasureValidate.list, MeasureController.list);
router.post('/upload', MeasureValidate.create, MeasureController.create);
router.patch('/confirm', MeasureValidate.edit, MeasureController.edit);

// To see image temporarily 
router.get('/image/:id', MeasureController.getImageUrl);

export default router;
