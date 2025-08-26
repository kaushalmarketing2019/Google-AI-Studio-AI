import { GoogleGenAI, Type } from "@google/genai";
import { InputType, OptimizationPlan, KeywordData, Competitor } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const keywordSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.STRING,
      description: "A relevant SEO keyword",
    },
};

const optimizationPlanSchema = {
    type: Type.OBJECT,
    properties: {
        metaTitle: { type: Type.STRING, description: "SEO-optimized Meta Title (under 60 characters)." },
        metaDescription: { type: Type.STRING, description: "SEO-optimized Meta Description (under 160 characters)." },
        h1: { type: Type.STRING, description: "The primary keyword to be used as the H1 heading." },
        h2: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords for H2 headings." },
        h3: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords for H3 headings." },
        h4: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords for H4 headings." },
        faqs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "A frequently asked question related to the keywords." },
                    answer: { type: Type.STRING, description: "A concise answer to the question." }
                },
                required: ["question", "answer"]
            },
            description: "A list of at least 3 relevant FAQs with answers."
        },
        contentStrategyFramework: { type: Type.STRING, description: "A recommended content framework (e.g., Hub & Spoke, Topic Clusters)." },
        blogIdeas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of blog/article topics to support the landing page." },
        internalLinking: { type: Type.STRING, description: "Suggestions for internal linking between the landing page and supporting content." }
    },
    required: ["metaTitle", "metaDescription", "h1", "h2", "h3", "h4", "faqs", "contentStrategyFramework", "blogIdeas", "internalLinking"]
};


export const generateKeywords = async (input: string, inputType: InputType): Promise<string[]> => {
    const prompt = `You are an expert SEO strategist. Based on the following landing page ${inputType}: "${input}", generate a list of 10-15 high-volume, relevant keywords. Include a mix of primary keywords, long-tail keywords, and related specific keywords. Prioritize keywords with strong traffic potential and search demand.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{text: prompt}] },
            config: {
                responseMimeType: "application/json",
                responseSchema: keywordSchema,
            },
        });
        
        const jsonString = response.text.trim();
        const keywords = JSON.parse(jsonString);
        return keywords as string[];

    } catch (error) {
        console.error("Error generating keywords:", error);
        throw new Error("Failed to communicate with the Gemini API for keyword generation.");
    }
};

const getSerpCompetitors = async (keyword: string): Promise<Competitor[]> => {
    const prompt = `What are the top organic search results for "${keyword}"?`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{text: prompt}] },
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        if (!groundingMetadata || !groundingMetadata.groundingChunks) {
            console.warn(`No grounding metadata found for SERP competitor analysis on "${keyword}".`);
            return [];
        }

        const competitors: Competitor[] = groundingMetadata.groundingChunks
            .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
            .map(chunk => ({
                title: chunk.web!.title!,
                url: chunk.web!.uri!
            }));
            
        return competitors.slice(0, 20);

    } catch (error) {
        console.error("Error fetching SERP competitors:", error);
        return []; // Return empty array on error
    }
};

export const suggestPrimaryKeyword = async (keywords: KeywordData[]): Promise<string> => {
    const prompt = `From this list of keywords with search volumes, pick the one with the best commercial intent for a primary landing page target. Consider both search volume and the user's intent to purchase or inquire about a service. Respond with ONLY the single best keyword text, and nothing else.\n\nKeywords:\n${keywords.map(k => `- ${k.text} (Volume: ${k.volume?.toLocaleString() ?? 'N/A'})`).join('\n')}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{text: prompt}] },
        });
        const suggestedKeyword = response.text.trim();
        // Ensure the suggested keyword is actually in the list to prevent hallucination
        const found = keywords.find(k => k.text.toLowerCase() === suggestedKeyword.toLowerCase());
        if (found) {
            return found.text;
        }
        // Fallback to the keyword with the highest volume if suggestion is not in the list
        const sortedByVolume = [...keywords].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
        return sortedByVolume[0]?.text ?? "";

    } catch (error) {
        console.error("Error suggesting primary keyword:", error);
        // Fallback to the highest volume keyword on error
        const sortedByVolume = [...keywords].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
        return sortedByVolume[0]?.text ?? "";
    }
};

export const generateOptimizationPlan = async (keywords: KeywordData[], primaryKeyword: string): Promise<OptimizationPlan> => {
    try {
        if (!primaryKeyword) {
            throw new Error("A primary keyword must be selected for competitor analysis.");
        }
        // Step 1: Get the top 20 competitors for the user-selected primary keyword
        const competitors = await getSerpCompetitors(primaryKeyword);
        
        // Step 2: Generate the main optimization plan
        const planPrompt = `You are an expert SEO strategist. Based on the following approved keyword list: [${keywords.map(k => k.text).join(', ')}], with a primary focus on "${primaryKeyword}", generate a complete page optimization plan.`;
        
        const planResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: planPrompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: optimizationPlanSchema,
            },
        });

        const jsonString = planResponse.text.trim();
        const plan = JSON.parse(jsonString) as Omit<OptimizationPlan, 'competitorAnalysis'>;

        // Step 3: Combine all data and return
        return {
            ...plan,
            competitorAnalysis: {
                targetKeyword: primaryKeyword,
                competitors,
            }
        };

    } catch (error) {
        console.error("Error generating optimization plan:", error);
        throw new Error("Failed to communicate with the Gemini API for optimization plan generation.");
    }
};

const mockVolumeSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            keyword: { type: Type.STRING, description: "The keyword provided in the prompt." },
            volume: { type: Type.NUMBER, description: "A realistic, estimated monthly search volume for the keyword." }
        },
        required: ["keyword", "volume"]
    },
};

export const getMockKeywordVolume = async (keywords: string[]): Promise<KeywordData[]> => {
    const prompt = `You are an SEO data analyst. For the following keyword list, provide a realistic estimated monthly search volume for each keyword in the US market. The volumes should be plausible for SEO planning. Present the output as a JSON array of objects, where each object has a "keyword" and "volume" property.
    Keywords:
    - ${keywords.join('\n- ')}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: mockVolumeSchema,
            },
        });

        const jsonString = response.text.trim();
        const results: { keyword: string; volume: number }[] = JSON.parse(jsonString);
        
        const volumeMap = new Map<string, number>();
        results.forEach(item => {
            if (item.keyword && typeof item.keyword === 'string') {
                volumeMap.set(item.keyword.toLowerCase(), item.volume);
            }
        });

        return keywords.map(kw => ({
            text: kw,
            volume: volumeMap.get(kw.toLowerCase()) ?? 0,
        }));

    } catch (error) {
        console.error("Error generating mock keyword volume with Gemini:", error);
        return keywords.map(kw => ({ text: kw, volume: null }));
    }
};