import { MeasureService } from '../../../src/services/measure-service';
import { IMeasure, MeasureModel } from '../../../src/models/measure-model';
import { geminiGenerateContent } from '../../../src/utils/gemini';

// Mocks
jest.mock('../../../src/models/measure-model');
jest.mock('../../../src/utils/gemini');

describe('MeasureService Test', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exists', () => {
    it('should return true if records exist', async () => {
      jest.mocked(MeasureModel.exists).mockResolvedValue(true as any);

      const result = await MeasureService.exists({ customer_code: 'customer123' });
      expect(result).toBe(true);
      expect(MeasureModel.exists).toHaveBeenCalledWith({ customer_code: 'customer123' });
    });

    it('should return false if no records exist', async () => {
      jest.mocked(MeasureModel.exists).mockResolvedValue(false as any);

      const result = await MeasureService.exists({ customer_code: 'customer123' });
      expect(result).toBe(false);
    });
  });

  describe('isConfirmed', () => {
    it('should return true if the measure is confirmed', async () => {
      jest.mocked(MeasureModel.findOne).mockResolvedValue({ has_confirmed: true });

      const result = await MeasureService.isConfirmed('some_uuid');
      expect(result).toBe(true);
      expect(MeasureModel.findOne).toHaveBeenCalledWith({ _id: 'some_uuid' });
    });

    it('should return false if the measure is not confirmed', async () => {
      jest.mocked(MeasureModel.findOne).mockResolvedValue({ has_confirmed: false });

      const result = await MeasureService.isConfirmed('some_uuid');
      expect(result).toBe(false);
    });

    it('should return false if the measure does not exist', async () => {
      jest.mocked(MeasureModel.findOne).mockResolvedValue(null);

      const result = await MeasureService.isConfirmed('some_uuid');
      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    let mockMeasures: any, 
      mockMeasuresResultWater: any;

    beforeAll(() => {
      mockMeasures = [{ 
        _id: '64f75e4f529df903ccd9fb28',
        customer_code: 'customer1',
        value: 38,
        image: '/v0187654321...',
        datetime: new Date('2024-04-24'),
        type: 'GAS',
        has_confirmed: true,
        image_url: 'http://localhost:80/image/1'
      }, {
        _id: '64f75e4f529df903ccd9fb29',
        customer_code: 'customer1',
        value: 50,
        image: '/v0187654777...',
        datetime: new Date('2024-04-25'),
        type: 'WATER',
        has_confirmed: false,
        image_url: 'http://localhost:80/image/2',
      }, {
        _id: '64f75e4f529df903ccd9fb30',
        customer_code: 'customer1',
        value: 221,
        image: '/v0187654797...',
        datetime: new Date('2024-03-25'),
        type: 'WATER',
        has_confirmed: true,
        image_url: 'http://localhost:80/image/3',
      }, {
        _id: '64f75e4f529df903ccd9fb31',
        customer_code: 'customer2',
        value: 99,
        image: '/v0187699321...',
        datetime: new Date('2024-05-24'),
        type: 'WATER',
        has_confirmed: true,
        image_url: 'http://localhost:80/image/4'
      }];

      mockMeasuresResultWater = [{
        _id: '64f75e4f529df903ccd9fb29',
        customer_code: 'customer1',
        value: 50,
        image: '/v0187654777...',
        datetime: new Date('2024-04-25'),
        type: 'WATER',
        has_confirmed: false,
        image_url: 'http://localhost:80/image/2',
      }, {
        _id: '64f75e4f529df903ccd9fb30',
        customer_code: 'customer1',
        value: 221,
        image: '/v0187654797...',
        datetime: new Date('2024-03-25'),
        type: 'WATER',
        has_confirmed: true,
        image_url: 'http://localhost:80/image/3',
      }]; 
    });

    it('should retrieve a list of measures for a specific customer', async () => {
    
      jest.mocked(MeasureModel.find).mockResolvedValue(mockMeasuresResultWater as IMeasure[]);

      const result = await MeasureService.list('customer1', 'WATER');
      expect(result).toEqual(mockMeasuresResultWater);
      expect(MeasureModel.find).toHaveBeenCalledWith({ customer_code: 'customer1', type: 'WATER' });
    });

    it('should delete the type field if type is not provided', async () => {
      jest.mocked(MeasureModel.find).mockResolvedValue(mockMeasures as any);

      const result = await MeasureService.list('customer1');
      expect(result).toEqual(mockMeasures);
      expect(MeasureModel.find).toHaveBeenCalledWith({ customer_code: 'customer1' });
    });
  });

  describe('create', () => {
    it('should create and save a new measure', async () => {
      const mockGeminiResponse = { value: 150 };
      const mockSavedMeasure = { _id: 'some_uuid', value: 150 };
      jest.mocked(geminiGenerateContent).mockResolvedValue(mockGeminiResponse);
      jest.mocked(MeasureModel.prototype.save).mockResolvedValue(mockSavedMeasure as any);

      const image64 = 'data:image/png;base64,somebase64string';

      const result = await MeasureService.create({ image: image64, customer_code: 'customer1' });
      expect(result).toEqual(mockSavedMeasure);
      expect(geminiGenerateContent).toHaveBeenCalledWith(image64);
      expect(MeasureModel.prototype.save).toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('should update and confirm the measure', async () => {
      jest.mocked(MeasureModel.updateOne).mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await MeasureService.edit('some_uuid', 150);
      expect(result).toBe(true);
      expect(MeasureModel.updateOne).toHaveBeenCalledWith(
        { _id: 'some_uuid' },
        { 
          value: 150, 
          has_confirmed: true 
        }
      );
    });

    it('should return false if no record was updated', async () => {
      jest.mocked(MeasureModel.updateOne).mockResolvedValue({ modifiedCount: 0 } as any);

      const result = await MeasureService.edit('some_uuid', 150);
      expect(result).toBe(false);
    });
  });

});