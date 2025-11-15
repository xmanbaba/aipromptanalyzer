import { GoogleGenAI, Type, Part } from "@google/genai";
import { AnalysisResult, AttachedFile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "An overall score for the prompt from 1 to 10, based on the user's selected technique.",
    },
    unpacked: {
      type: Type.OBJECT,
      properties: {
        context: { type: Type.STRING, description: "The extracted Context from the user's prompt, including acknowledging any attached files. If not found, state 'Not explicitly provided'." },
        role: { type: Type.STRING, description: "The extracted Role from the user's prompt. If not found, state 'Not explicitly provided'." },
        action: { type: Type.STRING, description: "The extracted Action from the user's prompt. If not found, state 'Not explicitly provided'." },
        format: { type: Type.STRING, description: "The extracted Format from the user's prompt. If not found, state 'Not explicitly provided'." },
        target: { type: Type.STRING, description: "The extracted Target Audience/Tone from the user's prompt. If not found, state 'Not explicitly provided'." },
      },
      required: ["context", "role", "action", "format", "target"],
    },
    feedback: {
      type: Type.OBJECT,
      properties: {
        context: { type: Type.STRING, description: "Feedback on the Context component, viewed through the lens of the user's selected technique." },
        role: { type: Type.STRING, description: "Feedback on the Role component." },
        action: { type: Type.STRING, description: "Feedback on the Action component." },
        format: { type: Type.STRING, description: "Feedback on the Format component." },
        target: { type: Type.STRING, description: "Feedback on the Target Audience/Tone component." },
        overall: { type: Type.STRING, description: "Overall summary of the prompt's strengths and weaknesses based on the selected technique." },
      },
      required: ["context", "role", "action", "format", "target", "overall"],
    },
    improvedPrompt: {
        type: Type.STRING,
        description: "A rewritten, improved version of the user's prompt that is a perfect example of the selected prompting technique."
    },
    promptClassification: {
      type: Type.STRING,
      description: "The prompt engineering technique that the user's prompt most closely resembles. Must be one of: 'CRAFT (Zero-Shot)', 'One-Shot', 'Few-Shot', 'Chain of Thought'."
    },
    classificationFeedback: {
        type: Type.STRING,
        description: "Feedback comparing the user's selected technique with the detected technique. If they match, provide encouragement. If they don't, explain why the prompt was classified differently and how to align it with their selected technique."
    }
  },
  required: ["score", "unpacked", "feedback", "improvedPrompt", "promptClassification", "classificationFeedback"],
};

const getSystemInstruction = (technique: string): string => {
  const intro = `You are a sophisticated and expert prompt engineering assistant with a creative, confidence-inspiring flair. Your task is to analyze a user's prompt and help them improve it. Your tone should be playful yet professional, energetic, and encouraging.
  One or more images or documents may be attached as additional context. Factor this into your analysis. For example, if an image of a product is attached, and the prompt is "write a description", the prompt's context is implicitly provided by the image.
  Your response MUST be in the JSON format defined by the provided schema. Be strict with the schema.`;

  const classificationTask = `
  **Part 1: Classify the User's Prompt**
  First, you MUST classify the user's raw prompt into one of the following categories: 'CRAFT (Zero-Shot)', 'One-Shot', 'Few-Shot', or 'Chain of Thought'. This is for the \`promptClassification\` field.
  
  Next, compare your classification with the user's selected technique, which is: **'${technique}'**.
  - If they match, your \`classificationFeedback\` should be positive and encouraging, confirming they've used the technique correctly.
  - If they do NOT match, your \`classificationFeedback\` must clearly explain why you classified the prompt differently. For example: "It looks like you selected 'Chain of Thought', but this prompt is more of a 'CRAFT (Zero-Shot)' prompt because it gives a direct command without asking for a step-by-step reasoning process. To make it a 'Chain of Thought' prompt, you could add 'Let's think step by step' at the end."`;
  
  const analysisTask = `
  **Part 2: Analyze the Prompt based on the User's Selection**
  After classification, proceed with the main analysis. Your analysis (unpacking, feedback, score, and improved prompt) should be performed through the lens of the user's **selected technique: '${technique}'**. For example, if the user selected 'Few-Shot', your feedback on the 'Context' should be about the quality of their examples, even if you classified the prompt as something else. The \`improvedPrompt\` you generate MUST be a perfect example of the user's selected technique.`;

  let techniqueGuidance = '';

  switch(technique) {
    case 'one-shot':
      techniqueGuidance = `You are analyzing through the "One-Shot" lens. The user should provide ONE clear example.
      - **Context**: How well does the prompt provide a single, clear example to guide the AI? This is the most important part.
      - **Action**: After the example, is the final task for the AI clearly stated?
      - **Format**: Is the format of the example's output clear and easy to replicate?`;
      break;
    case 'few-shot':
      techniqueGuidance = `You are analyzing through the "Few-Shot" lens. The user should provide a few (2-5) high-quality examples to demonstrate a pattern.
      - **Context**: How good and consistent are the examples? Do they clearly establish a pattern for the AI to follow?
      - **Action**: After the examples, is the final task for the AI clearly stated and does it fit the pattern?
      - **Format**: Is the format of all examples consistent?`;
      break;
    case 'chain-of-thought':
      techniqueGuidance = `You are analyzing through the "Chain of Thought" (CoT) lens. This is for complex reasoning tasks. The prompt should encourage the AI to 'think step by step'.
      - **Action**: Is the task complex? Does the prompt explicitly ask the AI to show its reasoning or think step-by-step? (e.g., by including "Let's think step by step."). This is critical.
      - **Format**: Does the prompt ask for the reasoning process to be shown before the final answer?`;
      break;
    case 'craft':
    default:
      techniqueGuidance = `You are analyzing through the "CRAFT (Zero-Shot)" lens. This technique uses direct instructions without examples in the prompt itself.
      The C.R.A.F.T. framework consists of:
      - C: Context (Background information, including any attached files)
      - R: Role (The persona the AI should adopt)
      - A: Action (The specific task for the AI)
      - F: Format (The desired output structure)
      - T: Target Audience/Tone (Who the output is for and its style)`;
  }
  
  return `${intro}\n\n${classificationTask}\n\n${analysisTask}\n\nHere is how you should interpret the C.R.A.F.T components for your analysis based on the selected technique:\n${techniqueGuidance}`;
}

export const analyzePrompt = async (prompt: string, files: AttachedFile[], technique: string): Promise<AnalysisResult> => {
  const systemInstruction = getSystemInstruction(technique);
  
  try {
    const contentParts: Part[] = [];

    if (files && files.length > 0) {
      files.forEach(file => {
        contentParts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType,
          },
        });
      });
    }

    contentParts.push({ text: `Please analyze the following prompt:\n\n---\n\n${prompt}` });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contentParts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText) as AnalysisResult;
    
    if (typeof parsedResult.score !== 'number' || typeof parsedResult.classificationFeedback !== 'string') {
        throw new Error("Invalid JSON structure received from API.");
    }

    return parsedResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not get analysis from Gemini API.");
  }
};