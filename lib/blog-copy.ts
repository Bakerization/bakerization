import type { BlogLanguage } from "./blog-language";
import { IKEDA_THEMES } from "./ikeda-config";

// English keys are shared with the existing English interface. Source quotations
// remain Japanese and are explicitly marked as such in every reader language.
const copy: Record<string, readonly [string, string]> = {
  Sources: ["参考文章", "참고 글"],
  "Possible sources": ["可能相关的文章", "관련 가능성이 있는 글"],
  Blog: ["博客", "블로그"],
  Question: ["提问", "질문"],
  Ask: ["提问", "질문"],
  "Ask Ikeda AI": ["向池田AI提问", "이케다 AI에게 질문하기"],
  "Ikeda AI": ["池田AI", "이케다 AI"],
  "Article archive": ["文章归档", "글 모아보기"],
  "Article archive ↗": ["文章归档 ↗", "글 모아보기 ↗"],
  "Browse by year": ["按年份浏览", "연도별 보기"],
  "Browse by theme": ["按主题浏览", "주제별 보기"],
  All: ["全部", "전체"],
  "All themes": ["全部主题", "모든 주제"],
  "Search articles": ["搜索文章", "글 검색"],
  "Wheat, bakeries, people…": ["小麦、面包店、人物…", "밀, 빵집, 사람 이름…"],
  "Sort order": ["排序", "정렬"],
  "Newest first": ["从新到旧", "최신순"],
  "Oldest first": ["从旧到新", "오래된순"],
  Search: ["搜索", "검색"],
  "articles /": ["篇 /", "편 /"],
  "Clear filters": ["清除筛选", "필터 해제"],
  "No articles found.": [
    "没有找到符合条件的文章。",
    "조건에 맞는 글이 없습니다.",
  ],
  "Try another year or theme": [
    "尝试其他年份或主题",
    "다른 연도나 주제로 찾기",
  ],
  "Previous page": ["上一页", "이전 페이지"],
  "Next page": ["下一页", "다음 페이지"],
  Pagination: ["翻页", "페이지 이동"],
  "Discuss this article": ["探讨这篇文章", "이 글에 대해 이야기하기"],
  "Explain the main ideas in this article with evidence.": [
    "请结合文章中的依据，解读这篇文章的核心思想。",
    "이 글의 핵심 생각을 근거와 함께 설명해 주세요.",
  ],
  "All articles": ["全部文章", "모든 글"],
  "Adjacent articles": ["前后文章", "앞뒤 글"],
  Older: ["上一篇", "이전 글"],
  Newer: ["下一篇", "다음 글"],
  "Republished from ": ["来源：", "출처: "],
  ". Republished with permission; original publication date retained.": [
    "。经许可转载，保留原始发布日期。",
    ". 허락을 받아 원래 발행일을 유지하여 전재했습니다.",
  ],
  "Discuss this article with Ikeda AI": [
    "与池田AI探讨这篇文章",
    "이케다 AI와 이 글 읽기",
  ],
  "Explore this article": ["深入阅读", "이 글에서 생각 넓히기"],
  "Source notes and evidence (Japanese)": [
    "文章解读与原文依据（日语）",
    "글 해석과 원문 근거 (일본어)",
  ],
  "Translating the full article…": [
    "正在翻译全文…",
    "글 전체를 번역하고 있습니다…",
  ],
  "AI translation": ["AI翻译", "AI 번역"],
  "English translation": ["译文", "번역문"],
  "Japanese original": ["日语原文", "일본어 원문"],
  "Read in English": ["阅读中文译文", "한국어로 읽기"],
  "Retry translation": ["重新翻译", "번역 다시 시도"],
  "Translation unavailable.": ["暂时无法翻译。", "지금은 번역할 수 없습니다."],
  "Translation is taking longer than expected. Please retry.": [
    "翻译耗时较长，请重试。",
    "번역이 지연되고 있습니다. 다시 시도해 주세요.",
  ],
  "Translation limit reached. Please try again later.": [
    "已达翻译使用上限，请稍后再试。",
    "번역 이용 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
  ],
  "Translation is temporarily unavailable. The original article is shown below.":
    [
      "暂时无法翻译，下方显示日语原文。",
      "지금은 번역할 수 없어 아래에 일본어 원문을 표시합니다.",
    ],
  "Please wait a little before trying again.": [
    "请稍等片刻再试。",
    "잠시 후 다시 시도해 주세요.",
  ],
  "Could not generate an answer. Please try again.": [
    "无法生成回答，请重试。",
    "답변을 생성하지 못했습니다. 다시 시도해 주세요.",
  ],
  "Connection lost. Please try again.": [
    "连接已断开，请重试。",
    "연결이 끊겼습니다. 다시 시도해 주세요.",
  ],
  "The connection ended before the answer was complete. Please try again.": [
    "回答尚未完成，连接已断开。请重试。",
    "답변이 완료되기 전에 연결이 끊겼습니다. 다시 시도해 주세요.",
  ],
  "Could not connect.": ["无法连接。", "연결할 수 없습니다."],
  "Close menu": ["关闭菜单", "메뉴 닫기"],
  "Open menu": ["打开菜单", "메뉴 열기"],
  "New chat": ["新对话", "새 대화"],
  "Read the blog": ["阅读博客", "블로그 읽기"],
  "History on this browser": [
    "此浏览器中的历史记录",
    "이 브라우저의 대화 기록",
  ],
  "Chat history": ["对话历史", "대화 기록"],
  "Explore connections across the articles.": [
    "探索文章之间的思想联系。",
    "글 사이에 이어지는 생각을 찾아보세요.",
  ],
  Privacy: ["隐私", "개인정보"],
  "Ikeda AI response": ["池田AI的回答", "이케다 AI의 답변"],
  "Reading the articles": ["正在阅读文章", "글을 읽고 있습니다"],
  "Try again": ["重试", "다시 시도"],
  Copied: ["已复制", "복사했습니다"],
  Copy: ["复制", "복사"],
  "Generation stopped": ["已停止生成", "생성을 중지했습니다"],
  "Starting from this article ×": [
    "以这篇文章为起点 ×",
    "이 글에서 시작하기 ×",
  ],
  "Explore ideas through their sources": [
    "循着原文，探索思想",
    "근거를 따라 생각 살펴보기",
  ],
  "Stop generating": ["停止生成", "생성 중지"],
  "Send question": ["发送问题", "질문 보내기"],
  "AI grounded in published articles, not Hiroaki Ikeda himself. History stays in this browser.":
    [
      "AI依据已发表文章回答，并非池田浩明本人。对话记录保存在此浏览器。",
      "공개된 글에 근거한 AI이며 이케다 히로아키 본인의 답변이 아닙니다. 대화 기록은 이 브라우저에 저장됩니다.",
    ],
  "Close source": ["关闭参考文章", "참고 글 닫기"],
  "Explore the source": ["深入阅读参考文章", "참고 글 살펴보기"],
  "Read the article ↗": ["阅读全文 ↗", "글 전체 읽기 ↗"],
  "The article’s question (Japanese)": [
    "文章提出的问题（日语）",
    "글에서 던지는 질문 (일본어)",
  ],
  "Interviewee’s words": ["受访者的话", "취재 대상의 말"],
  "Quotation; speaker unconfirmed": [
    "引文（说话者未确认）",
    "인용문 (화자 미확인)",
  ],
  "Another writer’s words": ["其他作者的文字", "다른 필자의 글"],
  "Hiroaki Ikeda’s words": ["池田浩明的文字", "이케다 히로아키의 글"],
  "Article text; byline unconfirmed": [
    "文章原文（署名未确认）",
    "글 원문 (필자 미확인)",
  ],
  "Related concepts": ["相关概念", "관련 개념"],
  "The answer could not be completed. Please try again.": [
    "回答未能完成，请重试。",
    "답변을 끝까지 생성하지 못했습니다. 다시 시도해 주세요.",
  ],
  "I could not find supporting evidence in these articles. Try removing the year or theme filter, or ask about bread, wheat, bakers, or food culture.":
    [
      "未能在这些文章中找到回答依据。请尝试取消年份或主题筛选，或询问有关面包、小麦、面包师和饮食文化的问题。",
      "이 범위의 글에서 답변의 근거를 찾지 못했습니다. 연도나 주제 필터를 해제하거나 빵, 밀, 제빵사, 식문화에 대해 질문해 보세요.",
    ],
  "Explore Pan Labo and Hiroaki Ikeda’s articles by their original publication dates, themes and sources.":
    [
      "按原始发布日期、主题与出处，阅读面包实验室与池田浩明的文章。",
      "원래 발행일, 주제, 출처를 따라 팡라보와 이케다 히로아키의 글을 읽어보세요.",
    ],
  "Explore bread, wheat, craft and food culture through Hiroaki Ikeda’s published articles.":
    [
      "以池田浩明已发表的文章为依据，探索面包、小麦、技艺与饮食文化。",
      "이케다 히로아키의 공개된 글을 근거로 빵, 밀, 기술, 식문화를 살펴보세요.",
    ],
};

export function blogText(
  language: BlogLanguage,
  ja: string,
  en: string,
): string {
  if (language === "ja") return ja;
  if (language === "en") return en;
  return copy[en]?.[language === "zh" ? 0 : 1] ?? en;
}
const themes: Record<string, readonly [string, string, string, string]> = {
  culture: [
    "面包与文化",
    "빵과 문화",
    "池田如何理解饮食文化？",
    "이케다는 식문화를 어떻게 이해하나요?",
  ],
  wheat: [
    "小麦与农业",
    "밀과 농업",
    "选择本土小麦的理由，除了味道还有什么？",
    "맛 외에 자국산 밀을 선택하는 이유는 무엇인가요?",
  ],
  craft: [
    "面包师与技艺",
    "제빵사와 기술",
    "我们能从面包师的工作中学到什么？",
    "제빵사의 일에서 무엇을 배울 수 있나요?",
  ],
  taste: [
    "味道的语言",
    "맛의 언어",
    "池田如何用语言表达面包的美味？",
    "이케다는 빵의 맛을 어떻게 표현하나요?",
  ],
  place: [
    "人与土地",
    "사람과 지역",
    "土地的个性如何体现在面包中？",
    "지역의 개성은 빵에 어떻게 드러나나요?",
  ],
  everyday: [
    "日常面包",
    "일상의 빵",
    "日常的面包有什么价值？",
    "일상의 빵에는 어떤 가치가 있나요?",
  ],
  community: [
    "人与人的联系",
    "서로 이어지기",
    "面包如何把人们联系在一起？",
    "빵은 어떻게 사람들을 연결하나요?",
  ],
  future: [
    "面包的未来",
    "빵의 미래",
    "池田如何思考日本面包的未来？",
    "이케다는 일본 빵의 미래를 어떻게 생각해 왔나요?",
  ],
};
export function blogTheme(
  id: string | undefined,
  language: BlogLanguage,
  field: "label" | "question" = "label",
) {
  const t = IKEDA_THEMES.find((t) => t.id === id);
  if (!t) return id || "";
  if (language === "ja") return t[field];
  if (language === "en") return field === "label" ? t.labelEn : t.questionEn;
  return themes[t.id][
    (field === "question" ? 2 : 0) + (language === "ko" ? 1 : 0)
  ];
}
export function conceptQuestion(concept: string, language: BlogLanguage) {
  return language === "ja"
    ? `「${concept}」は、ほかの記事でどんな考えにつながっている？`
    : language === "zh"
      ? `“${concept}”与其他文章中的哪些思想相联系？`
      : language === "ko"
        ? `“${concept}”은 다른 글에서 어떤 생각으로 이어지나요?`
        : `How does "${concept}" connect to ideas in other articles?`;
}
