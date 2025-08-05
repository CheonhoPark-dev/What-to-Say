import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AnalysisResult, SuggestedReply, ConversationTone } from '../types';

// API_KEY is sourced from process.env.API_KEY as per guidelines.
// App.tsx checks for its existence before calling analyzeConversation.
// The non-null assertion process.env.API_KEY! is used based on this check.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Model name should be used directly in generateContent call as per guidelines
const MODEL_NAME = 'gemini-2.5-flash';


export const analyzeConversation = async (
  images: { base64: string; mimeType: string }[],
  tags: string[]
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    // This check is a safeguard; App.tsx should prevent calls if API_KEY is missing.
    throw new Error("API 키가 설정되지 않았습니다. Gemini API를 호출할 수 없습니다.");
  }
  if (images.length === 0) {
    throw new Error("분석할 이미지가 없습니다.");
  }

  const imageParts: Part[] = images.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64,
    },
  }));

  const tagString = tags.length > 0 ? tags.join(', ') : '일반적인 대화';

  const textPart: Part = {
    text: `
    당신은 메신저 대화 전문가입니다. 사용자가 제공한 ${images.length}개의 대화 스크린샷 이미지(순서대로 제공됨)와 아래 태그들을 분석해주세요.
    이 이미지들은 대화의 흐름을 나타냅니다. 이미지 순서가 중요합니다.

    **중요: 대화 톤 분석**
    1. 먼저 대화 이미지에서 사용자와 상대방이 사용하는 말투를 정확히 분석하세요:
       - 반말(비격식) vs 존댓말(격식)
       - 이모티콘 사용 빈도
       - 줄임말, 신조어 사용
       - 문장 길이와 스타일
       - 전반적인 대화 분위기 (친근함/정중함/유머/진지함 등)

    2. 분석한 톤에 맞춰 답변을 작성하세요:
       - 반말 대화면 → 반말로 답변 ("그래", "좋아", "어떻게 생각해?")
       - 존댓말 대화면 → 존댓말로 답변 ("그렇습니다", "좋습니다", "어떻게 생각하세요?")
       - 이모티콘을 자주 쓰면 → 답변에도 적절한 이모티콘 포함
       - 줄임말을 쓰면 → 자연스러운 줄임말 사용 ("ㅋㅋ", "ㅇㅇ", "그냥" 등)

    사용자 태그: ${tagString}

    응답은 반드시 다음 JSON 형식으로 반환해주세요.
    JSON 객체 외에는 다른 텍스트, 설명, 또는 주석을 절대 포함하지 마세요. 오직 순수한 JSON 데이터만 응답해야 합니다.
    {
      "conversationTone": {
        "formality": "formal|informal", 
        "emojiUsage": "high|medium|low",
        "style": "친근함|정중함|유머|진지함 등의 대화 스타일"
      },
      "suggestedReplies": [
        {"id": "reply1", "text": "대화 톤에 맞춘 첫 번째 답변"},
        {"id": "reply2", "text": "대화 톤에 맞춘 두 번째 답변"},
        {"id": "reply3", "text": "대화 톤에 맞춘 세 번째 답변"}
      ],
      "conversationFlow": "대화 흐름에 대한 조언 (분석한 톤으로 작성)"
    }

    제공하는 모든 텍스트는 한국어로 작성해주세요.
    추천 답변은 대화에서 분석한 말투와 스타일을 정확히 반영하여 사용자가 바로 복사해서 사용할 수 있도록 자연스럽고 완성된 문장 형태로 제공해주세요.
    대화 흐름 조언도 분석한 톤에 맞춰 작성하되, 사용자가 대화의 목적 (태그 기반)을 달성하는 데 도움이 되도록 구체적으로 작성해주세요.
    `,
  };

  const allParts: Part[] = [...imageParts, textPart];

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: allParts },
        config: {
            responseMimeType: "application/json",
            temperature: 0.7, 
            topP: 0.9,
            topK: 40,
        }
    });
    
    let jsonStr = response.text.trim();
    
    // Remove markdown fences if present
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    // Clean up extraneous lines like "validates fine" that the model might erroneously insert.
    // This targets lines that consist *only* of such phrases (case-insensitive).
    jsonStr = jsonStr.split('\n').filter(line => !/^\s*(validates fine|looks good|ok)\s*$/i.test(line)).join('\n');

    try {
      const parsedData = JSON.parse(jsonStr);
      
      if (!parsedData.suggestedReplies || !Array.isArray(parsedData.suggestedReplies) || typeof parsedData.conversationFlow !== 'string') {
        console.error("Parsed JSON does not match expected structure:", parsedData);
        throw new Error("AI 응답 형식이 올바르지 않습니다. JSON 구조를 확인해주세요.");
      }

      const repliesWithIds: SuggestedReply[] = parsedData.suggestedReplies.map((reply: any, index: number) => ({
        id: reply.id || `reply-${Date.now()}-${index}`,
        text: reply.text || "내용 없음",
      }));
      
      if (repliesWithIds.length === 0 && images.length > 0) { 
         repliesWithIds.push({id: 'fallback-1', text: "죄송해요, 지금은 적절한 답변을 찾기 어렵네요. 좀 더 일반적인 안부 인사를 해보는 건 어때요?"});
      }

      // Parse conversation tone if available
      let conversationTone: ConversationTone | undefined;
      if (parsedData.conversationTone) {
        conversationTone = {
          formality: parsedData.conversationTone.formality || 'informal',
          emojiUsage: parsedData.conversationTone.emojiUsage || 'medium',
          style: parsedData.conversationTone.style || '친근함'
        };
      }

      return {
        conversationTone,
        suggestedReplies: repliesWithIds,
        conversationFlow: parsedData.conversationFlow || "대화 흐름에 대한 조언을 받지 못했습니다. 일반적인 대화를 이어나가 보세요."
      };

    } catch (e: any) {
      console.error("Failed to parse JSON response from AI:", e.message);
      console.error("Cleaned text before parsing (jsonStr):", jsonStr);
      console.error("Original text from AI (response.text):", response.text);
      throw new Error(`AI로부터 받은 응답을 처리하는 중 오류가 발생했습니다: ${e.message}. 응답 형식을 확인해주세요.`);
    }

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes('API key not valid')) { // Updated to common API key error message part
         throw new Error("Gemini API 키가 유효하지 않습니다. 확인 후 다시 시도해주세요.");
    }
    if (error.message && error.message.toLowerCase().includes('quota')) {
        throw new Error("API 사용량 한도를 초과했습니다. 나중에 다시 시도해주세요.");
    }
     if (error.message && error.message.includes('permission denied') && error.message.includes('access your location')) {
        throw new Error("API 호출 권한 오류가 발생했습니다. 위치 정보 접근 관련 설정일 수 있습니다.");
    }
    throw new Error(`Gemini API 호출 중 오류가 발생했습니다: ${error.message || '알 수 없는 API 오류'}`);
  }
};