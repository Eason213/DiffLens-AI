import { GoogleGenAI } from "@google/genai";
import { DocItem } from "../types";

// Helper to clean base64 string
const cleanBase64 = (b64: string) => {
  return b64.replace(/^data:(image|application)\/.*?;base64,/, "");
};

const getMimeType = (b64: string) => {
    const match = b64.match(/^data:(.*?);base64,/);
    return match ? match[1] : 'image/jpeg';
};

export const analyzeDocuments = async (set1: DocItem[], set2: DocItem[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("缺少 API Key。");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare the prompt
  const prompt = `
    你是一位專業的 AI 稽核員與文件分析師。
    你的任務是比對兩組文件（「第一份資料」與「第二份資料」），找出差異、不一致、新增或移除的部分。
    
    使用者提供了這兩組資料的圖片或文字檔案。
    
    請提供繁體中文的結構化分析報告：
    1. **摘要**：比對結果的簡要概述。
    2. **主要差異**：列點說明第二份資料與第一份資料相比的具體變更。
    3. **內容驗證**：檢查兩份資料之間的順序或內容邏輯是否連貫。
    4. **結論**：關於文件是否相符或有重大偏差的最終判斷。
    
    請使用乾淨的 Markdown 格式輸出。
  `;

  // Construct parts
  const parts: any[] = [{ text: prompt }];

  // Add Set 1
  parts.push({ text: "\n\n--- 第一份資料 (SET 1) ---\n" });
  for (const doc of set1) {
    parts.push({ text: `檔案名稱: ${doc.name}\n` });
    if (doc.type === 'image') {
      parts.push({
        inlineData: {
          mimeType: getMimeType(doc.content),
          data: cleanBase64(doc.content),
        },
      });
    } else {
      parts.push({ text: `內容:\n${doc.content}\n` });
    }
  }

  // Add Set 2
  parts.push({ text: "\n\n--- 第二份資料 (SET 2) ---\n" });
  for (const doc of set2) {
    parts.push({ text: `檔案名稱: ${doc.name}\n` });
    if (doc.type === 'image') {
      parts.push({
        inlineData: {
          mimeType: getMimeType(doc.content),
          data: cleanBase64(doc.content),
        },
      });
    } else {
      parts.push({ text: `內容:\n${doc.content}\n` });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on this task type
      }
    });

    return response.text || "無法產生分析結果。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("文件分析失敗，請重試。");
  }
};