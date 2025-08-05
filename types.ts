export interface SuggestedReply {
  id: string;
  text: string;
}

export interface ConversationTone {
  formality: 'formal' | 'informal';
  emojiUsage: 'high' | 'medium' | 'low';
  style: string;
}

export interface AnalysisResult {
  conversationTone?: ConversationTone;
  suggestedReplies: SuggestedReply[];
  conversationFlow: string;
}

export interface UploadedImageInfo {
  id: string; // Unique identifier for React keys and operations
  file: File;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
}

// For potential use in <select> or radio buttons in future, not used in current MVP.
export enum Tone {
  FRIENDLY = "friendly",
  FORMAL = "formal",
  HUMOROUS = "humorous",
  ASSERTIVE = "assertive",
}

export enum Goal {
  MAKE_PLANS = "make_plans",
  GET_INFORMATION = "get_information",
  RESOLVE_CONFLICT = "resolve_conflict",
  CASUAL_CHAT = "casual_chat",
}