// 类型定义

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  source: string;
  publishedDate: string;
  category: string;
  summary?: string;
  translatedTitle?: string;
}

export interface DailyData {
  date: string;
  articles: NewsArticle[];
  categories: Record<string, NewsArticle[]>;
}

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface TavilyResponse {
  query: string;
  results: TavilyResult[];
  answer?: string;
}