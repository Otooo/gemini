import { Request, Response, NextFunction } from 'express';
import { MeasureType } from '../models/measure-model';
import { MeasureService } from '../services/measure-service';
import { sendErrorResponse } from '../utils/response';


/**
 * Validate measure type.
 * 
 * @param type Measure type
 * @param res Response object
 * @param error_code error code message
 * @returns Response with error code if type is invalid
 */
const isValidMeasureType = (type: string, res: Response, error_code:string='INVALID_DATA'): boolean => {
  if (!Object.values(MeasureType).includes(type as MeasureType)) {
    sendErrorResponse(res, 400, error_code, `Tipo de medição não permitida.`);

    return false;
  }

  return true;
}

/**
 * Check if required fields are present.
 * 
 * @param res Response object
 * @param fields Fields to check
 * @returns Response with error code if fields are missing
 */
const hasRequiredFields = (res: Response, ...fields: any[]): boolean => {
  const missingFields = fields.filter(field => !field);
  if (missingFields.length > 0) {
    sendErrorResponse(res, 400, 'INVALID_DATA', 'Há valores obrigatórios não fornecidos.');

    return false;
  }

  return true;
}

/**
 * Middlwares to validate the API requests
 */
export const MeasureValidate = {

  /**
   * Middleware to validate the list (/:customer_code/list) request.
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Response with error code or proceeds to next operation
   */
  async list (req: Request, res: Response, next: NextFunction) {
    const customer_code = req.params.customer_code;
    const type = req.query.measure_type as MeasureType;

    // Validate measure type.
    if (type && !isValidMeasureType(type, res, 'INVALID_TYPE')) { return };

    // Check if there are records for that customer
    const existingMeasure = await MeasureService.exists({ customer_code });
    if (!existingMeasure) {
      return sendErrorResponse(res, 409, 'MEASURES_NOT_FOUND', 'Nenhuma leitura encontrada.');
    }

    // If all validations pass, proceed to the next step
    next();
  },

  /**
   * Middleware to validate the create (/upload) request.
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Response with error code or proceeds to next operation
   */
  async create (req: Request, res: Response, next: NextFunction) {
    const { 
      image, 
      customer_code, 
      measure_datetime:datetime, 
      measure_type:type 
    } = req.body;

    // Check if required fields are present.
    if (!hasRequiredFields(res, customer_code, type, datetime, image)) { return };

    // Validate measure type.
    if (!isValidMeasureType(type, res)) { return };

    // Validar se datetime é uma data válida
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      return sendErrorResponse(res, 400, 'INVALID_DATA', 'O campo datetime deve ser uma data válida.');
    }

    // Validar se image é uma string Base64 válida
    const base64Regex = /^(data:image\/(png|jpg|jpeg|gif);base64,)?[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(image)) {
      return sendErrorResponse(res, 400, 'INVALID_DATA', 'A imagem deve estar em formato Base64 válido.');
    }

    // Verificar unicidade do registro
    const existingMeasure = await MeasureService.exists({ customer_code, type, datetime });
    if (existingMeasure) {
      return sendErrorResponse(res, 409, 'DOUBLE_REPORT', 'Leitura do mês já realizada');
    }

    // If all validations pass, proceed to the next step
    next();
  },

  /**
   * Middleware to validate the edit (/confirm) request.
   * 
   * @param req Request object
   * @param res Response object
   * @param next Next function
   * @returns Response with error code or proceeds to next operation
   */
  async edit (req: Request, res: Response, next: NextFunction) {
    const { 
      measure_uuid, 
      confirmed_value
    } = req.body;

    // Check if required fields are present.
    if (!hasRequiredFields(res, measure_uuid, confirmed_value)) { return };

    // Check if confirmed_value is a valid number
    if (!Number.isInteger(confirmed_value)) {
      return sendErrorResponse(res, 400, 'INVALID_DATA', 'O campo confirmed_value deve ser um inteiro válido.');
    }

    // Check if the record exists 
    const existingMeasure = await MeasureService.exists({ _id: measure_uuid });
    if (!existingMeasure) {
      return sendErrorResponse(res, 404, 'MEASURE_NOT_FOUND', 'Leitura não encontrada');
    }

    // Verificar se o registro já foi confirmado (alterado)
    const confirmedMeasure = await MeasureService.isConfirmed(measure_uuid);
    if (confirmedMeasure) {
      return sendErrorResponse(res, 409, 'CONFIRMATION_DUPLICATE', 'Leitura do mês já realizada');
    }

    // If all validations pass, proceed to the next step
    next();
  },
};
