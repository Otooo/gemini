import { Response } from 'express';

/**
 * Helper method to send a formatted error response.
 * 
 * @param res Response object
 * @param statusCode HTTP status code
 * @param errorCode Custom error code
 * @param errorDescription Error description
 */
export const sendErrorResponse = (res: Response, statusCode: number, errorCode: string, errorDescription: string) => {
  return res.status(statusCode).json({ 
    error_code: errorCode, 
    error_description: errorDescription 
  });
}

/**
 * Helper method to send a formatted json response.
 * 
 * @param res Response object
 * @param statusCode HTTP status code
 * @param jsonObj Object in JSON format
 */
export const sendJsonResponse = (res: Response, statusCode: number, jsonObj: any) => {
  return res.status(statusCode).json(jsonObj);
}