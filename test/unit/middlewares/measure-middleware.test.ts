import { Request, Response, NextFunction } from 'express';
import { MeasureValidate } from '../../../src/middlewares/measure-middleware';
import { sendErrorResponse } from '../../../src/utils/response';
import { MeasureService } from '../../../src/services/measure-service';

// Mocks
jest.mock('../../../src/services/measure-service');
jest.mock('../../../src/utils/response');

describe('MeasureValidate Middleware Test', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('list', () => {
    it('should send error if measure type is invalid', async () => {
      req.params = { customer_code: '123' };
      req.query = { measure_type: 'INVALID_TYPE' };

      await MeasureValidate.list(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 400, 'INVALID_TYPE', 'Tipo de medição não permitida.');
      expect(next).not.toHaveBeenCalled();
    });

    it('should send error if no measures are found', async () => {
      req.params = { customer_code: '123' };
      jest.mocked(MeasureService.exists).mockResolvedValue(false);

      await MeasureValidate.list(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 409, 'MEASURES_NOT_FOUND', 'Nenhuma leitura encontrada.');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if all validations pass', async () => {
      req.params = { customer_code: '123' };
      req.query = { measure_type: 'WATER' };
      jest.mocked(MeasureService.exists).mockResolvedValue(true);

      await MeasureValidate.list(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should send error if required fields are missing', async () => {
      req.body = {
        customer_code: '123',
        measure_datetime: '2024-04-24',
        // image missing
        // type missing 
      };

      await MeasureValidate.create(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 400, 'INVALID_DATA', 'Há valores obrigatórios não fornecidos.');
      expect(next).not.toHaveBeenCalled();
    });

    it('should send error if datetime is invalid', async () => {
      req.body = {
        customer_code: '123',
        measure_datetime: 'invalid-date',
        measure_type: 'WATER',
        image: 'data:image/png;base64,validbase64',
      };

      await MeasureValidate.create(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 400, 'INVALID_DATA', 'O campo datetime deve ser uma data válida.');
      expect(next).not.toHaveBeenCalled();
    });

    it('should send error if measure already exists', async () => {
      req.body = {
        customer_code: '123',
        measure_datetime: '2024-04-24',
        measure_type: 'WATER',
        image: 'data:image/png;base64,validbase64',
      };
      jest.mocked(MeasureService.exists).mockResolvedValue(true);

      await MeasureValidate.create(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 409, 'DOUBLE_REPORT', 'Leitura do mês já realizada');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if all validations pass', async () => {
      req.body = {
        customer_code: '123',
        measure_datetime: '2024-04-24',
        measure_type: 'WATER',
        image: 'data:image/png;base64,validbase64',
      };
      jest.mocked(MeasureService.exists).mockResolvedValue(false);

      await MeasureValidate.create(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('should send error if required fields are missing', async () => {
      req.body = {
        measure_uuid: 'uuid',
        // customer_code missing
      };

      await MeasureValidate.edit(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 400, 'INVALID_DATA', 'Há valores obrigatórios não fornecidos.');
      expect(next).not.toHaveBeenCalled();
    });

    it('should send error if confirmed_value is not an integer', async () => {
      req.body = {
        measure_uuid: 'uuid',
        confirmed_value: 'not-an-integer',
      };

      await MeasureValidate.edit(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 400, 'INVALID_DATA', 'O campo confirmed_value deve ser um inteiro válido.');
      expect(next).not.toHaveBeenCalled();
    });

    it('should send error if measure is not found', async () => {
      req.body = {
        measure_uuid: 'uuid',
        confirmed_value: 42,
      };
      jest.mocked(MeasureService.exists).mockResolvedValue(false);

      await MeasureValidate.edit(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 404, 'MEASURE_NOT_FOUND', 'Leitura não encontrada');
      expect(next).not.toHaveBeenCalled();
    });

    it('should send error if measure is already confirmed', async () => {
      req.body = {
        measure_uuid: 'uuid',
        confirmed_value: 42,
      };
      jest.mocked(MeasureService.exists).mockResolvedValue(true);
      jest.mocked(MeasureService.isConfirmed).mockResolvedValue(true);

      await MeasureValidate.edit(req as Request, res as Response, next);

      expect(sendErrorResponse).toHaveBeenCalledWith(res, 409, 'CONFIRMATION_DUPLICATE', 'Leitura do mês já realizada');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if all validations pass', async () => {
      req.body = {
        measure_uuid: 'uuid',
        confirmed_value: 42,
      };
      jest.mocked(MeasureService.exists).mockResolvedValue(true);
      jest.mocked(MeasureService.isConfirmed).mockResolvedValue(false);

      await MeasureValidate.edit(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });
});