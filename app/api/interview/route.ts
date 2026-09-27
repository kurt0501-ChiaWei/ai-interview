// ============================================================================
// /api/interview —— AI 面試 API（Next.js App Router 的 Route Handler）
//
// 檔案放在 app/api/interview/route.ts，Next.js 會自動把它對應到 /api/interview 這個網址。
// 這支 API 是「無狀態」的：伺服器不記錄任何面試進度，
// 前端每次都會把「職缺描述 + 題數 + 到目前為止的完整對話」整包送過來，
// 伺服器再根據「候選人已經回答了幾題」決定這次要「出下一題」還是「評分」。
// ============================================================================

// OpenAI 官方 SDK，用來呼叫 ChatGPT 模型
import OpenAI from "openai";
// 從共用檔案引入常數與型別（前端 page.tsx 也用同一份，確保前後端資料格式一致）
import {
  MAX_QUESTIONS, // 題數上限（10）
  MIN_QUESTIONS, // 題數下限（1）
  type ChatMessage, // 單則對話訊息：{ role: "interviewer" | "candidate", content: string }
  type Evaluation, // 最終評分結果的格式
  type InterviewRequest, // 前端送來的請求內容格式
  type InterviewResponse, // 這支 API 回傳給前端的格式（出題 或 評分 二選一）
} from "@/lib/interview";

// 建立 OpenAI 客戶端。API 金鑰從環境變數讀取（寫在 .env.local，Next.js 啟動時會自動載入）
// 金鑰只存在伺服器端，不會外洩到瀏覽器
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// 使用的模型：若 .env.local 有設定 OPENAI_MODEL 就用它，否則預設用 gpt-5.4-mini
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

// ----------------------------------------------------------------------------
// 系統提示詞（System Prompt）：告訴 AI「你是誰、要遵守什麼規則」
// 每次呼叫 OpenAI 都會放在最前面，讓 AI 始終扮演面試官角色
// ----------------------------------------------------------------------------
function systemPrompt(jobDescription: string, totalQuestions: number) {
  return `你是一位專業、友善但嚴謹的面試官，正在為以下職缺進行面試。

【職缺描述】
${jobDescription}

面試規則：
- 整場面試共 ${totalQuestions} 題，一次只問一題。
- 題目需緊扣職缺描述，涵蓋技術能力、實務經驗與情境判斷。
- 根據候選人上一題的回答決定下一題：若回答模糊或有值得深挖之處，可追問；否則換新的主題出題。
- 使用繁體中文。`;
}

// ----------------------------------------------------------------------------
// 把我們自己定義的對話格式，轉換成 OpenAI 要求的格式
//   interviewer（面試官，也就是 AI 自己說過的話）→ "assistant"
//   candidate  （候選人，也就是使用者的回答）    → "user"
// 這樣 AI 就能「看到」整段面試歷史，知道自己問過什麼、使用者答了什麼
// ----------------------------------------------------------------------------
function toOpenAIMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({
    // `as const` 讓 TypeScript 知道這是固定字串 "assistant"/"user"，而非一般 string，才符合 SDK 型別
    role: m.role === "interviewer" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
}

// ----------------------------------------------------------------------------
// 共用的「呼叫 OpenAI 並取得 JSON 結果」函式
//   <T> 是泛型：呼叫時指定預期拿回來的 JSON 長什麼樣子
//   instruction：這一次要 AI 做的具體任務（出第幾題 / 進行評分）
// ----------------------------------------------------------------------------
async function askJSON<T>(
  jobDescription: string,
  totalQuestions: number,
  messages: ChatMessage[],
  instruction: string,
): Promise<T> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    // 強制 AI 只能回傳合法的 JSON，方便程式直接解析，不用從一大段文字裡撈資料
    response_format: { type: "json_object" },
    // 送給 AI 的訊息順序：
    //   1. 系統提示詞（角色設定 + 規則）
    //   2. 到目前為止的完整面試對話
    //   3. 這一次的任務指示（放在最後，AI 最會注意到）
    messages: [
      { role: "system", content: systemPrompt(jobDescription, totalQuestions) },
      ...toOpenAIMessages(messages),
      { role: "system", content: instruction },
    ],
  });
  // 取出 AI 回覆的文字（choices[0] 是第一個、也是唯一一個回覆）
  const text = completion.choices[0]?.message.content;
  if (!text) throw new Error("OpenAI 沒有回傳內容");
  // 把 JSON 字串轉成 JavaScript 物件
  return JSON.parse(text) as T;
}

// ----------------------------------------------------------------------------
// POST /api/interview —— API 主要進入點
// 在 route.ts 裡 export 一個名為 POST 的函式，Next.js 就會用它處理 POST 請求
// ----------------------------------------------------------------------------
export async function POST(request: Request) {
  // 【步驟 1】檢查伺服器是否有設定 OpenAI 金鑰，沒有就不用往下做了
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "伺服器未設定 OPENAI_API_KEY" }, { status: 500 });
  }

  // 【步驟 2】解析前端送來的 JSON。若格式壞掉（不是合法 JSON）就回 400 錯誤
  let body: InterviewRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "請求格式錯誤" }, { status: 400 });
  }

  // 【步驟 3】取出並驗證參數 —— 永遠不要相信前端送來的資料
  const jobDescription = body.jobDescription?.trim(); // 去掉前後空白；?. 避免欄位不存在時報錯
  const totalQuestions = Number(body.totalQuestions); // 轉成數字（防止前端送字串進來）
  const messages = Array.isArray(body.messages) ? body.messages : []; // 不是陣列就當作空對話

  // 職缺描述不能是空的
  if (!jobDescription) {
    return Response.json({ error: "請提供職缺描述" }, { status: 400 });
  }
  // 題數必須是整數，且在 1～10 之間
  if (!Number.isInteger(totalQuestions) || totalQuestions < MIN_QUESTIONS || totalQuestions > MAX_QUESTIONS) {
    return Response.json(
      { error: `題數需為 ${MIN_QUESTIONS} 到 ${MAX_QUESTIONS} 之間的整數` },
      { status: 400 },
    );
  }

  // 【步驟 4】計算候選人已經回答了幾題 —— 這是整支 API 判斷「進度」的唯一依據
  const answered = messages.filter((m) => m.role === "candidate").length;
  // 回答數超過題數，代表面試早就結束了，不該再呼叫
  if (answered > totalQuestions) {
    return Response.json({ error: "面試已結束" }, { status: 400 });
  }

  try {
    let result: InterviewResponse;

    if (answered < totalQuestions) {
      // ======================================================================
      // 【分支 A：出題】還有題目沒問完 → 請 AI 出下一題
      //   answered = 0 → 出第 1 題（面試剛開始，messages 是空的）
      //   answered = 1 → 出第 2 題（AI 會看到第 1 題的回答，可能追問或換主題）
      //   ……依此類推
      // ======================================================================
      const questionNumber = answered + 1;
      // 解構取出 AI 回傳 JSON 中的 question 欄位
      const { question } = await askJSON<{ question: string }>(
        jobDescription,
        totalQuestions,
        messages,
        // 第 1 題請 AI 先打招呼；之後的題目請 AI 先簡短回應上一題的回答，面試感比較自然
        `請提出第 ${questionNumber} / ${totalQuestions} 題。${
          questionNumber > 1 ? "可先用一句話簡短回應候選人上一題的回答，再提問。" : "可先簡短打招呼再提問。"
        }不要在此時給出評分。以 JSON 回覆：{"question": "..."}`,
      );
      // 題號由伺服器自己算，不交給 AI，避免 AI 算錯
      result = { type: "question", questionNumber, content: question };
    } else {
      // ======================================================================
      // 【分支 B：評分】answered === totalQuestions，所有題目都答完了 → 請 AI 評分
      // ======================================================================

      // 從對話紀錄中，分別挑出所有題目與所有回答（兩者順序一一對應）
      const questions = messages.filter((m) => m.role === "interviewer").map((m) => m.content);
      const answers = messages.filter((m) => m.role === "candidate").map((m) => m.content);

      // 請 AI 產生評分結果。AI 只需要回傳「回饋」和「示範回答」，
      // 題目原文與使用者的回答由伺服器自己補上（見下方），省 token 也避免 AI 抄錯題目
      //
      // 解構寫法說明：
      //   questionReviews = []  → 取出 AI 的逐題檢討；若 AI 漏掉這個欄位，就預設為空陣列
      //   ...overall            → 其餘欄位（score、summary、strengths、improvements）收進 overall
      const { questionReviews = [], ...overall } = await askJSON<
        // 預期的 JSON 型別：Evaluation 去掉 questionReviews，再換成 AI 版本的逐題檢討
        Omit<Evaluation, "questionReviews"> & {
          questionReviews?: { feedback: string; betterAnswer: string }[];
        }
      >(
        jobDescription,
        totalQuestions,
        messages,
        `面試已結束。請根據候選人的全部 ${totalQuestions} 個回答，對照職缺需求給出評估，並針對每一題提供回饋與示範回答。
示範回答（betterAnswer）要以候選人第一人稱撰寫、可直接參考使用，結構清楚（例如 STAR：情境、任務、行動、結果），並盡量延續候選人原本提到的經驗加以補強。
questionReviews 必須剛好 ${totalQuestions} 筆，依題目順序排列。以 JSON 回覆：
{"score": 0-100 的整數, "summary": "整體評語（2-3 句）", "strengths": ["優點", ...], "improvements": ["具體改進建議", ...],
 "questionReviews": [{"feedback": "此題回答的優缺點", "betterAnswer": "較好的回答方式（示範回答）"}, ...]}`,
      );

      // 組合最終評分結果：以「實際的題目清單」為主，依序配對
      //   題目、使用者回答 → 來自對話紀錄（100% 正確）
      //   回饋、示範回答   → 來自 AI（若 AI 少給幾筆，就用空字串補，前端會自動隱藏空白欄位）
      const evaluation: Evaluation = {
        ...overall,
        questionReviews: questions.map((question, i) => ({
          question,
          answer: answers[i] ?? "",
          feedback: questionReviews[i]?.feedback ?? "",
          betterAnswer: questionReviews[i]?.betterAnswer ?? "",
        })),
      };
      result = { type: "evaluation", evaluation };
    }

    // 【步驟 5】把結果以 JSON 回傳給前端（預設狀態碼 200）
    return Response.json(result);
  } catch (err) {
    // 呼叫 OpenAI 失敗（網路問題、金鑰錯誤、額度用完、JSON 解析失敗……）都會跑到這裡
    // 在伺服器終端機印出完整錯誤，方便除錯
    console.error("[/api/interview]", err);
    const message = err instanceof Error ? err.message : "未知錯誤";
    // 502 Bad Gateway：表示「我們的伺服器沒問題，是上游服務（OpenAI）出錯」
    return Response.json({ error: `面試官暫時無法回應：${message}` }, { status: 502 });
  }
}
