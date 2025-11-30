import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { DocItem } from "../types";

// Helper to clean base64 string
const cleanBase64 = (b64: string) => {
  return b64.replace(/^data:(image|application)\/.*?;base64,/, "");
};

const getMimeType = (b64: string) => {
    const match = b64.match(/^data:(.*?);base64,/);
    return match ? match[1] : 'application/pdf'; // Default to pdf if unknown binary
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
    
    使用者提供了這兩組資料的圖片、PDF 或文字檔案。
    
    請提供繁體中文的結構化分析報告：
    1. **摘要**：比對結果的簡要概述。
    2. **主要差異**：列點說明第二份資料與第一份資料相比的具體變更。
    3. **內容驗證**：檢查兩份資料之間的順序或內容邏輯是否連貫。
    4. **結論**：關於文件是否相符或有重大偏差的最終判斷。
    
    請使用乾淨的 Markdown 格式輸出。
  `;

  // Construct parts
  const parts: any[] = [{ text: prompt }];

  const processDoc = (doc: DocItem) => {
    if (doc.type === 'text') {
       return { text: `[檔案: ${doc.name}]\n內容:\n${doc.content}\n` };
    } else {
       // Handle Image and File (PDF/Doc) as inlineData
       return {
        inlineData: {
          mimeType: getMimeType(doc.content),
          data: cleanBase64(doc.content),
        },
      };
    }
  };

  // Add Set 1
  parts.push({ text: "\n\n--- 第一份資料 (SET 1) ---\n" });
  for (const doc of set1) {
    parts.push(processDoc(doc));
  }

  // Add Set 2
  parts.push({ text: "\n\n--- 第二份資料 (SET 2) ---\n" });
  for (const doc of set2) {
    parts.push(processDoc(doc));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        // Set safety settings to BLOCK_NONE to avoid false positives on document content
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("AI 未返回任何候選回應 (可能因安全性過濾，請檢查檔案內容)。");
    }

    if (!response.text) {
        throw new Error("AI 回應內容為空。");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`分析失敗: ${(error as Error).message}`);
  }
};