import { sendErrorResponse, sendJsonResponse } from '../../../src/utils/response';
import { Response } from 'express';

describe('Response Utils Test', () => {
  let res: Response;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
  });

  describe('sendErrorResponse', () => {
    it('should send an error response with the correct status and JSON', () => {
      const statusCode = 400;
      const errorCode = 'INVALID_DATA';
      const errorDescription = 'Invalid data provided';

      sendErrorResponse(res, statusCode, errorCode, errorDescription);

      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith({
        error_code: errorCode,
        error_description: errorDescription,
      });
    });
  });

  describe('sendJsonResponse', () => {
    it('should send a JSON response with the correct status and object', () => {
      const statusCode = 200;
      const jsonObj = { message: 'Success' };

      sendJsonResponse(res, statusCode, jsonObj);

      expect(res.status).toHaveBeenCalledWith(statusCode);
      expect(res.json).toHaveBeenCalledWith(jsonObj);
    });
  });
});