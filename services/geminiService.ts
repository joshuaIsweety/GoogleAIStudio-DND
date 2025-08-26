import { GoogleGenAI, Type } from "@google/genai";
import type { Character, StorySegment, VictoryType } from '../types.ts';

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
    },
    victoryType: {
        type: Type.STRING,
        description: "如果 outcome 是 'victory'，請指定勝利的類型。選項為 'BOSS_BATTLE' (擊敗強敵)、'TREASURE_HUNT' (找到寶藏) 或 'EPIC_JOURNEY' (完成旅程)。如果遊戲尚未勝利，則省略此欄位。",
        enum: ['BOSS_BATTLE', 'TREASURE_HUNT', 'EPIC_JOURNEY']
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
2.  **設計目標**: 在開始時，為這次冒險秘密設定一個勝利條件。從以下三種類型中擇一：
    *   **頭目戰 (BOSS_BATTLE)**: 冒險的高潮是一場與強大怪物的戰鬥。
    *   **尋寶 (TREASURE_HUNT)**: 冒險的目標是找到一件傳說中的寶物或神器。
    *   **史詩旅程 (EPIC_JOURNEY)**: 冒險的目標是到達一個遙遠或神聖的地點，或解開一個古老的謎團。
3.  **創造場景**: 根據你設定的目標，描述生動的場景、非玩家角色（NPC）和挑戰。
4.  **提供選擇**: 在每次描述後，提供 2-4 個有意義的行動選項。
5.  **推動劇情**: 根據玩家的選擇，推動故事發展。故事應該有一個清晰的開頭、中段和結尾。
6.  **保持簡潔**: 讓整個冒險在 5-7 個玩家選擇內結束，達成勝利或失敗的结局。
7.  **確保结局**: 務必在適當時機結束遊戲。當玩家達成目標時，將 'outcome' 設為 'victory'，並根據你最初設定的目標，在 'victoryType' 中註明勝利類型。若玩家失敗，則將 'outcome' 設為 'game_over'。
`;

async function parseAndValidateResponse(responsePromise: Promise<any>): Promise<Omit<StorySegment, 'imageUrl' | 'isPlayerChoice'>> {
    const response = await responsePromise;
    const rawText = response.text.trim();
    try {
        const json = JSON.parse(rawText);
        
        if (typeof json.story !== 'string' || !Array.isArray(json.choices) || typeof json.outcome !== 'string') {
            throw new Error('Invalid JSON structure from API');
        }

        // Validate victoryType if present
        if (json.outcome === 'victory' && json.victoryType) {
            if (!['BOSS_BATTLE', 'TREASURE_HUNT', 'EPIC_JOURNEY'].includes(json.victoryType)) {
                console.warn(`Invalid victoryType received: ${json.victoryType}`);
                // Don't throw error, just nullify it to prevent crash
                json.victoryType = undefined;
            }
        }
        
        return json as Omit<StorySegment, 'imageUrl' | 'isPlayerChoice'>;
    } catch (error) {
        console.error("Failed to parse JSON response:", rawText);
        throw new Error("從 AI 收到的回應格式不正確。");
    }
}

export const generateImageForStory = async (storyDescription: string): Promise<string> => {
    const prompt = `Dungeons and Dragons, epic fantasy oil painting style. A cinematic, atmospheric scene. ${storyDescription}`;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            console.warn("Image generation returned no images.");
            return "";
        }
    } catch (error) {
        console.error("Failed to generate image:", error);
        return ""; // Don't block the game if image generation fails
    }
};

export const getInitialStory = async (character: Character): Promise<Omit<StorySegment, 'imageUrl' | 'isPlayerChoice'>> => {
  const prompt = `為玩家 ${character.name}（一位 ${character.characterClass}）開始一場新的冒險。根據你為這次冒險秘密設定的勝利目標（頭目戰、尋寶或史詩旅程），描述他/她發現自己身處一個神秘的地方，並面臨第一個抉擇。這是故事的開端。`;

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

export const getNextStoryPart = async (character: Character, history: string[], choice: string): Promise<Omit<StorySegment, 'imageUrl' | 'isPlayerChoice'>> => {
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