import { KeywordData } from '../types';
import { getMockKeywordVolume } from './geminiService';

if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    console.info("DataForSEO credentials not set. Using Gemini to provide estimated search volume data.");
}

const API_URL = 'https://api.dataforseo.com/v3/keywords_data/google/search_volume/live';

const getAuthHeader = (): string => {
    if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
        return '';
    }
    const credentials = `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`;
    try {
        return `Basic ${btoa(credentials)}`;
    } catch (e) {
        console.error("Failed to base64 encode credentials.", e);
        return '';
    }
};

export const getKeywordsVolume = async (keywords: string[]): Promise<KeywordData[]> => {
    const authHeader = getAuthHeader();
    if (!authHeader) {
        // If no credentials, use Gemini for mock data.
        return getMockKeywordVolume(keywords);
    }

    const postData = [{
        keywords,
        location_code: 2840, // USA
        language_code: 'en',
    }];

    try {
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!apiResponse.ok) {
            console.error(`DataForSEO API error: ${apiResponse.statusText}`, await apiResponse.text());
            throw new Error(`DataForSEO API error: ${apiResponse.statusText}`);
        }

        const data = await apiResponse.json();
        
        if (data.status_code !== 20000 || !data.tasks || !data.tasks[0] || data.tasks[0].status_code !== 20000) {
            console.error('DataForSEO API error:', data.status_message || 'Unknown error');
            throw new Error(`DataForSEO API returned an error: ${data.status_message}`);
        }

        const volumeMap = new Map<string, number>();
        if (data.tasks[0]?.result) {
            data.tasks[0].result.forEach((item: any) => {
                if (item && item.keyword && item.search_volume != null) {
                    volumeMap.set(item.keyword.toLowerCase(), item.search_volume);
                }
            });
        }
        
        return keywords.map(kw => ({
            text: kw,
            volume: volumeMap.get(kw.toLowerCase()) ?? null,
        }));

    } catch (error) {
        console.error("Error fetching keyword volume:", error);
        // Fallback to null volume on API error to not block the user flow
        return keywords.map(kw => ({ text: kw, volume: null }));
    }
};
