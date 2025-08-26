
import { GoogleGenAI, Type } from "@google/genai";
import type { Character, StorySegment } from '../types.ts';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "用繁體中文描述目前場景和發生的事情。這段文字將直接顯示給玩家。風格應該是奇幻且引人入勝的。保持段落簡潔，大約 100-150 字。"
    },
    choices: {
      type: Type.ARRAY,
      description: "提供 2 到 4 個簡短、清晰的行動選項讓玩家選擇。如果遊戲結束，此陣列應為空。",
      items: { type: Type.STRING }
    },
    outcome: {
      type: Type.STRING,
      description: "根據故事的發展，決定遊戲的狀態。選項為 'continue' (遊戲繼續)、'victory' (玩家獲勝) 或 'game_over' (玩家失敗或死亡)。"
    }
  },
  required: ["story", "choices", "outcome"]
};

const commonConfig = {
  responseMimeType: "application/json",
  responseSchema: responseSchema,
  temperature: 0.8,
  topP: 0.9,
  topK: 40,
};

const getSystemInstruction = (character: Character) => `
你是一位經驗豐富的龍與地下城（D&D）地下城主（DM）。
你的任務是引導一位玩家進行一場簡短（總遊玩時間約 10 分鐘）、以文字為基礎的奇幻冒險。
玩家的角色資訊如下：
- 姓名: ${character.name}
- 職業: ${character.characterClass}

你的職責：
1.  **語言**: 全程使用**繁體中文**進行描述和回應。
2.  **創造場景**: 描述生動的場景、非玩家角色（NPC）和挑戰。
3.  **提供選擇**: 在每次描述後，提供 2-4 個有意義的行動選項。
4.  **推動劇情**: 根據玩家的選擇，推動故事發展。故事應該有一個清晰的開頭、中段和結尾。
5.  **保持簡潔**: 讓整個冒險在 5-7 個玩家選擇內結束，達成勝利或失敗的結局。
6.  **確保結局**: 務必在適當時機結束遊戲，透過將 'outcome' 設為 'victory' 或 'game_over' 來達成。不要讓遊戲無限進行下去。
`;

async function parseAndValidateResponse(responsePromise: Promise<any>): Promise<StorySegment> {
    const response = await responsePromise;
    const rawText = response.text.trim();
    try {
        const json = JSON.parse(rawText);
        
        if (typeof json.story !== 'string' || !Array.isArray(json.choices) || typeof json.outcome !== 'string') {
            throw new Error('Invalid JSON structure from API');
        }
        
        return json as StorySegment;
    } catch (error) {
        console.error("Failed to parse JSON response:", rawText);
        throw new Error("從 AI 收到的回應格式不正確。");
    }
}

export const getInitialStory = async (character: Character): Promise<StorySegment> => {
  const prompt = `為玩家 ${character.name}（一位 ${character.characterClass}）開始一場新的冒險。描述他/她發現自己身處一個神秘的地方，並面臨第一個抉擇。這是故事的開端。`;

  const response = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
        ...commonConfig,
        systemInstruction: getSystemInstruction(character),
    }
  });

  return parseAndValidateResponse(response);
};

export const getNextStoryPart = async (character: Character, history: string[], choice: string): Promise<StorySegment> => {
  const context = history.join('\n\n');
  const prompt = `這是到目前為止的故事：\n${context}\n\n玩家選擇了： "${choice}"。\n\n接下來發生什麼事？請根據這個選擇繼續故事，並提供新的場景描述和選項。記得在適當時機結束冒險。`;
  
  const response = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
        ...commonConfig,
        systemInstruction: getSystemInstruction(character),
    }
  });

  return parseAndValidateResponse(response);
};