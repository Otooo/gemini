import { Request, Response } from 'express';
import { MeasureService } from '../services/measure-service';
import { MeasureFormatter } from '../formatters/measure-formatter';
import { generateUrl, getImageUrl } from '../utils/url-image';
import { logger } from '../utils/logger';
import { sendJsonResponse } from '../utils/response';

/**
 * Controller for Water/Gas meter analysis 
 */
export const MeasureController = {

  /**
   * List customer measurements 
   * 
   * @param req Request for route /:customer_code/list
   * @param res Response for route /:customer_code/list
   */
  async list (req: Request, res: Response): Promise<void> {
    try {
      const customer_code = req.params.customer_code;
      const type = req.query.measure_type as any;
      const data = await MeasureService.list(customer_code, type)

      sendJsonResponse(res, 200, MeasureFormatter.listF(customer_code, data))
    } catch (error) {
      logger.error(error);
      sendJsonResponse(res, 500, error);
    }
  },

  /**
   * Create customer measurements
   * 
   * @param req Request for route /upload 
   * @param res Response for route /upload
   */
  async create (req: Request, res: Response): Promise<void> {
    try {
      const { 
        image, 
        customer_code, 
        measure_datetime:datetime, 
        measure_type:type 
      } = req.body;
      const body = { image, customer_code, datetime, type };
      
      // I didn't like this, but...
      const image_url = `${req.protocol}://${req.get('host')}/${generateUrl(image)}`;
      
      const data = await MeasureService.create({ ...body, image_url });

      sendJsonResponse(res, 200, MeasureFormatter.createF(data));
    } catch (error) {
      logger.error(error);
      sendJsonResponse(res, 500, error);
    }
  },

  /**
   * Confirm and edit customer measurements
   * 
   * @param req Request for route /confirm
   * @param res Response for route /confirm
   */
  async edit (req: Request, res: Response): Promise<void> {
    try {
      const { 
        measure_uuid, 
        confirmed_value
      } = req.body;
      const updated = await MeasureService.edit(measure_uuid, confirmed_value)

      sendJsonResponse(res, 200, { success: updated })
    } catch (error) {
      logger.error(error);
      sendJsonResponse(res, 500, error);
    }
  },

  /**
   * Retrieve the image URL of the analyzed meter
   * 
   * @param req Request for route /image/:id
   * @param res Response for route /image/:id
   */
  getImageUrl (req: Request, res: Response): void {
    try {
      const imageId  = req.params.id;
      
      res.sendFile(getImageUrl(imageId));
    } catch (error) {
      logger.warn(error);
      sendJsonResponse(res, 500, error);
    }
  }
};
