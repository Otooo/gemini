import { G_API_KEY } from '../configs/google'
import { GoogleGenerativeAI } from '@google/generative-ai';

// Set GEMINI API KEY 
const genAI = new GoogleGenerativeAI(G_API_KEY);

// Create a model for that LLM
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

/**
 * This method contains the formulated question to be used in the GEMINI API.
 * 
 * @returns A question for GEMINI API
 */
const prompt = (): string => {
  return `
    Here is an image of a gas/water meter. 
    Can you provide the integer consumption value shown in the image, 
    without any decimals? 

    Please be extra careful with the digits to avoid any confusion, 
    especially between similar-looking numbers like 0 and 1.

    Returns the answer using this JSON schema: 
      {
        "type": "object", 
        "properties": {
          "value": { "type": "number" },
        }
      }
  `
}

/**
 * Generate an object image based on meter image in base 64 
 * 
 * @param image64 
 * @returns 
 */
const filePart = (image64: string): any => {
  
  return {
    inlineData: {
      data: image64.replace(/^data:image\/\w+;base64,/, ''), 
      mimeType: 'image/png'
    }
  };
}

/**
 * Send a query and retrieve the answer from the GEMINI API. 
 * 
 * @param image64 Meter image in base 64
 * @returns Answer provided by the GEMINI API
 */
export const geminiGenerateContent = async (image64: string): Promise<any> => {
  const result = await model.generateContent([
    prompt(),
    filePart(image64)
  ]);

  return JSON.parse(result.response.text());
}
