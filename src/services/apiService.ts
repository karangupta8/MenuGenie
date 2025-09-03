import { API_CONFIG } from '../config/api';

// Types for API responses
interface PexelsResponse {
  photos: Array<{
    id: number;
    src: {
      original: string;
      large: string;
      medium: string;
      small: string;
    };
    alt: string;
  }>;
}

// API Service class
export class ApiService {
  private static instance: ApiService;
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Search for food images using Pexels API
  async searchFoodImage(query: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_CONFIG.pexels.endpoint}?query=${encodeURIComponent(query + ' food')}&per_page=1&orientation=landscape`, {
        headers: {
          'Authorization': API_CONFIG.pexels.apiKey,
        },
      });

      if (!response.ok) {
        console.warn(`Pexels API error for "${query}": ${response.statusText}`);
        return null;
      }

      const data: PexelsResponse = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.medium;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching image for "${query}":`, error);
      return null;
    }
  }
}