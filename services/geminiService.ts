import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, LearningModule, Worksheet, QuizType, LessonPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLearningModule = async (prompt: string): Promise<LearningModule> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    coreConcept: {
                        type: Type.ARRAY,
                        description: "A detailed explanation of the topic, broken down into an array of content blocks. Use a mix of headings, paragraphs, code blocks, and lists to structure the content effectively. For 'list' types, provide a single string where each item is on a new line.",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            type: { type: Type.STRING, description: "The type of content block: 'heading', 'paragraph', 'code', 'list', or 'quote'." },
                            content: { type: Type.STRING, description: "The text content. For 'list' types, provide a single string where each item is on a new line." }
                          },
                          required: ['type', 'content']
                        }
                    },
                    keyVocabulary: {
                        type: Type.ARRAY,
                        description: "An array of 3-5 key terms and their definitions.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                term: { type: Type.STRING },
                                definition: { type: Type.STRING }
                            },
                            required: ['term', 'definition']
                        }
                    },
                    thinkingRoutine: {
                        type: Type.OBJECT,
                        description: "A thinking routine from Harvard's Project Zero to encourage deeper thinking. Includes the routine's name, a brief description, and a prompt for the student.",
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            prompt: { type: Type.STRING }
                        },
                        required: ['name', 'description', 'prompt']
                    },
                    realWorldLink: { type: Type.STRING, description: "A paragraph connecting the concept to a real-world application." }
                },
                required: ['coreConcept', 'keyVocabulary', 'thinkingRoutine', 'realWorldLink']
            },
            systemInstruction: "You are a helpful tutor for IB Computer Science students. Your explanations should be clear, concise, and structured for an interactive display. For the 'thinkingRoutine' section, you MUST select ONE of the following routines that is most appropriate for the topic: 'See-Think-Wonder', 'Connect-Extend-Challenge', 'The 4 Cs (Connections, Challenges, Concepts, Changes)', 'Circle of Viewpoints', 'What Makes You Say That?', or 'Think-Puzzle-Explore'. After selecting a routine, provide its name, a brief description, and a specific prompt tailored to the computer science concept. Generate content as a series of blocks (headings, paragraphs, code, lists). Use visually descriptive language and analogies. For 'list' blocks, separate items with newlines.",
            temperature: 0.6,
            topP: 0.95,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as LearningModule;
  } catch (error) {
    console.error("Error generating learning module from Gemini:", error);
    throw new Error("Failed to fetch learning module from Gemini API.");
  }
};

export const generateQuiz = async (topicTitle: string, numQuestions: number, quizType: QuizType): Promise<Quiz> => {
    let typeDescription = '';
    switch (quizType) {
        case 'multiple-choice':
            typeDescription = 'a multiple-choice quiz with 4 options per question.';
            break;
        case 'true-false':
            typeDescription = 'a true/false quiz.';
            break;
        case 'short-answer':
            typeDescription = 'a short-answer quiz where the `correctAnswer` field contains a model answer.';
            break;
        case 'mixed':
            typeDescription = 'a quiz with a mix of multiple-choice, true/false, and short-answer questions.';
            break;
    }

    const prompt = `Generate a ${numQuestions}-question quiz about "${topicTitle}" for an IB Computer Science student. It should be ${typeDescription} For each question, provide the question text, its type ('multiple-choice', 'true-false', or 'short-answer'), the options (if applicable), the correct answer, and a brief explanation.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, description: "The type of question: 'multiple-choice', 'true-false', or 'short-answer'." },
                                    question: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        description: "For multiple-choice, 4 options. For true-false, ['True', 'False']. For short-answer, an empty array.",
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswer: { type: Type.STRING, description: "The correct option or a model answer for short-answer questions." },
                                    explanation: { type: Type.STRING, description: "An explanation of the correct answer." }
                                },
                                required: ['type', 'question', 'options', 'correctAnswer', 'explanation']
                            }
                        }
                    },
                     required: ['title', 'questions']
                },
                systemInstruction: "You are an expert quiz creator for IB Computer Science. Adhere strictly to the requested question type and number. For 'mixed' quizzes, provide a variety of question types. For 'short-answer' questions, the `options` array MUST be empty and the `correctAnswer` field must contain a detailed model answer."
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Quiz;
    } catch (error) {
        console.error("Error generating quiz from Gemini:", error);
        throw new Error("Failed to fetch quiz from Gemini API.");
    }
};

export const generateWorksheet = async (topicTitle: string, numQuestions: number): Promise<Worksheet> => {
    const prompt = `Generate a practice worksheet with ${numQuestions} main questions about "${topicTitle}" for an IB Computer Science student. The worksheet must emulate the style of an official IB specimen paper, with multi-part questions.
For the overall worksheet, provide a 'title'.
The 'questions' array should contain ${numQuestions} objects.
Each question object must have:
1. A 'title': A brief description of the question's theme (e.g., "Question 1: PaaS and Logic Circuits").
2. A 'parts' array: Containing multiple sub-questions.
Each part object in the 'parts' array must have:
1. A 'prompt': The specific question text for the student (e.g., "(a) Outline the function of an accumulator.").
2. 'marks': The number of marks awarded.
3. 'modelAnswer': A detailed model answer.
Use a variety of command words like 'Outline', 'State', 'Construct', 'Explain', and 'Discuss'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more capable model for complex generation
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    parts: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                prompt: { type: Type.STRING },
                                                marks: { type: Type.INTEGER },
                                                modelAnswer: { type: Type.STRING }
                                            },
                                            required: ['prompt', 'marks', 'modelAnswer']
                                        }
                                    }
                                },
                                required: ['title', 'parts']
                            }
                        }
                    },
                     required: ['title', 'questions']
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Worksheet;
    } catch (error) {
        console.error("Error generating worksheet from Gemini:", error);
        throw new Error("Failed to fetch worksheet from Gemini API.");
    }
};


export const generateIAHelp = async (helpType: 'ideas' | 'plan'): Promise<string> => {
    let prompt = '';
    if (helpType === 'ideas') {
        prompt = 'I am an IB Computer Science student looking for ideas for my Internal Assessment (IA). Please generate 5 creative and achievable project ideas. For each idea, provide a brief description, the computational context (e.g., OOP, database, simulation), and a potential challenge.';
    } else { // plan
        prompt = 'I am an IB Computer Science student starting my Internal Assessment (IA). Based on the IA criteria (Problem Specification, Planning, System Overview, Development, Evaluation), generate a generic but comprehensive project plan outline that I can adapt. Use markdown for structure.';
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful assistant for IB Computer Science students working on their Internal Assessment (IA). Your advice should be practical, structured, and align with IB guidelines.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating IA help from Gemini:", error);
        throw new Error("Failed to fetch IA help from Gemini API.");
    }
};

export const generateLessonPlan = async (topicTitle: string): Promise<LessonPlan> => {
    const prompt = `Generate a 45-minute lesson plan for an IB Computer Science class on the topic of "${topicTitle}". The plan should include clear learning objectives and a sequence of activities (starter, main, plenary). For each activity, suggest how an interactive tool like Curipod could be used to enhance engagement (e.g., by creating a poll, word cloud, or interactive drawing activity).`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "The title of the lesson plan." },
                        learningObjectives: {
                            type: Type.ARRAY,
                            description: "A list of 3-4 clear, measurable learning objectives.",
                            items: { type: Type.STRING }
                        },
                        activities: {
                            type: Type.ARRAY,
                            description: "An array of lesson activities (e.g., Starter, Main Activity, Plenary).",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "The name of the activity (e.g., 'Starter: Quick Poll')." },
                                    description: { type: Type.STRING, description: "A detailed description of the activity." },
                                    duration: { type: Type.INTEGER, description: "Estimated duration of the activity in minutes." },
                                    interactiveSuggestion: { type: Type.STRING, description: "A suggestion on how to use an interactive tool like Curipod for this activity." }
                                },
                                required: ['title', 'description', 'duration', 'interactiveSuggestion']
                            }
                        }
                    },
                    required: ['title', 'learningObjectives', 'activities']
                },
                systemInstruction: "You are an expert instructional designer creating lesson plans for IB Computer Science teachers. The plans should be practical, engaging, and explicitly mention how to use modern interactive classroom tools like Curipod."
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as LessonPlan;
    } catch (error) {
        console.error("Error generating lesson plan from Gemini:", error);
        throw new Error("Failed to fetch lesson plan from Gemini API.");
    }
};