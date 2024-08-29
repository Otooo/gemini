import { MeasureModel, IMeasure } from '../models/measure-model';
import { geminiGenerateContent } from '../utils/gemini';

/**
 * Logic for measurements operations
 */
export const MeasureService = {

  /**
   * From a filter, check if the records exist
   * 
   * @param filter Filters
   * @returns true if any records exists, false otherwise
   */
  async exists(filter: any): Promise<boolean> {
    const exists = await MeasureModel.exists(filter);

    return !!exists;
  },

  /**
   * Check if the measure was confirmed
   * 
   * @param id Measure UUID (_id)
   * @returns true if the measurement is confirmed, false otherwise
   */
  async isConfirmed(id: string): Promise<boolean> {
    const measure = await MeasureModel.findOne({ _id: id });
    
    return !!measure?.has_confirmed;
  },
  
  /**
   * Retrieve a list of measurements related to a specific customer
   * 
   * @param customer_code Customer code
   * @param type Measurement type, WATER or GAS
   * @returns An array of measurements for that customer
   */
  async list(customer_code: string, type?: string): Promise<IMeasure[]> {
    const filter = { 
      customer_code,
      type
    }
    type? null : delete filter.type; // Deleting type field if there is it doesn't exist as a query param
    
    const measures = await MeasureModel.find(filter)

    return measures;
  },

  /**
   * Create the measurement 
   * 
   * @param req Request object (measurement data)
   * @returns The measurement created
   */
  async create (body: any): Promise<IMeasure> {
    // Request data from LLM
    const obj = await geminiGenerateContent(body.image) 
    const value = obj?.value;

    // Save in database 
    const newMeasure: IMeasure = new MeasureModel({ value, ...body });
    const savedMeasure = await newMeasure.save();

    return savedMeasure;
  },

  /**
   * Edit and confirm the measurement 
   * 
   * @param measure_uuid Measurment UUID (_id)
   * @param confirmed_value The real meter value
   * @returns true if any record was changed, false otherwise
   */
  async edit (measure_uuid:string, confirmed_value:number): Promise<boolean> {
    
    // Edit in database 
    const updated = await MeasureModel.updateOne(
      { _id: measure_uuid },
      { 
        value: confirmed_value,
        has_confirmed: true // and confirm the measurement
      }
    );

    return updated.modifiedCount != 0;
  }

};
