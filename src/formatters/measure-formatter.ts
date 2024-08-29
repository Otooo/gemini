import { IMeasure } from '../models/measure-model'

/**
 * Formatters for API responses
 */
export const MeasureFormatter = {
  
  /**
   * Format the response for the list of measurements
   * 
   * @param customer_code Customer code
   * @param data An array of measurements from mongose operation 
   * @returns A formatted data for route /:customer_code/list
   */
  listF (customer_code: string, data: IMeasure[]) {
    const dataF = {
      customer_code: customer_code,
      measures: <any>[]
    };

    data.forEach((measure: IMeasure) => {
      dataF.measures.push({
        measure_uuid: measure._id,
        measure_datetime: measure.datetime,
        measure_type: measure.type,
        has_confirmed: measure?.has_confirmed || false,
        image_url: measure?.image_url
      });
    })

    return dataF;
  },

  /**
   * Format the response for the created measurement
   * 
   * @param data The measure created 
   * @returns A formatted data for route /upload
   */
  createF (data: any) {
    return {
      image_url: data.image_url,
      measure_value: data.value,
      measure_uuid: data._id
    }
  },

}