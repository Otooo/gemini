import { IMeasure, MeasureModel } from '../../../src/models/measure-model';
import { MeasureFormatter } from '../../../src/formatters/measure-formatter';

describe('MeasureFormatter Test', () => {
  
  describe('listF', () => {
    it('should format the list of measurements correctly', () => {
      const customer_code = '123';
      const data: IMeasure[] = [ 
        new MeasureModel({
          _id: '64f75e4f529df903ccd9fb29',
          customer_code,
          value: 221,
          image: '/v0123456789...',
          datetime: new Date('2024-04-23'),
          type: 'WATER',
          image_url: 'http://localhost:80/image/1',
        }), 
        new MeasureModel({
          _id: '64f75e4f529df903ccd9fb28',
          customer_code,
          value: 38,
          image: '/v0187654321...',
          datetime: new Date('2024-04-24'),
          type: 'GAS',
          has_confirmed: true,
          image_url: 'http://localhost:80/image/2',
        }),
      ];

      const expected = {
        customer_code: '123',
        measures: [
          {
            measure_uuid: '64f75e4f529df903ccd9fb29',
            measure_datetime: new Date('2024-04-23'),
            measure_type: 'WATER',
            has_confirmed: false,
            image_url: 'http://localhost:80/image/1',
          },
          {
            measure_uuid: '64f75e4f529df903ccd9fb28',
            measure_datetime: new Date('2024-04-24'),
            measure_type: 'GAS',
            has_confirmed: true,
            image_url: 'http://localhost:80/image/2',
          },
        ],
      };

      const result = MeasureFormatter.listF(customer_code, data);
      expect(result).toEqual(expected);
    });
  });

  describe('createF', () => {
    it('should format the created measurement correctly', () => {
      const data = {
        _id: 'uuid3',
        customer_code: '123',
        value: 38,
        image: '/v0103406809...',
        datetime: '2024-04-24T12:10:02',
        type: 'WATER',
        image_url: 'http://localhost:80/image/3',
      };

      const expected = {
        image_url: 'http://localhost:80/image/3',
        measure_value: 38,
        measure_uuid: 'uuid3',
      };

      const result = MeasureFormatter.createF(data);
      expect(result).toEqual(expected);
    });
  });
});