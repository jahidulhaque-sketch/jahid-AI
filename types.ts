
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum ImageQuality {
  BASIC = 'basic',
  ULTRA = 'ultra'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  imageUrl?: string;
  isImageGeneration?: boolean;
  imageQuality?: ImageQuality;
  groundingUrls?: string[];
}

export enum AppMode {
  TEXT = 'text',
  IMAGE = 'image',
  LIVE = 'live'
}
