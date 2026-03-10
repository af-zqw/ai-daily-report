// AI 内容生成器 - 使用 DeepSeek API
import { CONFIG, validateConfig } from './config.js';
import type { NewsArticle, DailyData } from './types.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class Generator {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    validateConfig();
    this.apiKey = CONFIG.deepseek.apiKey;
    this.baseUrl = CONFIG.deepseek.baseUrl;
    this.model = CONFIG.deepseek.model;
  }

  // 调用 DeepSeek API
  async callDeepSeek(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: '你是一个专业的新闻编辑，擅长总结技术新闻并翻译成中文。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${error}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';
  }

  // 生成文章摘要
  async generateSummary(content: string): Promise<string> {
    const prompt = `请用 ${CONFIG.output.summaryLength} 字以内总结以下内容，用中文：\n\n${content.substring(0, 1500)}`;
    return this.callDeepSeek(prompt);
  }

  // 翻译标题
  async translateTitle(title: string): Promise<string> {
    const prompt = `将以下标题翻译成简洁的中文（不超过20字）：\n${title}`;
    return this.callDeepSeek(prompt);
  }

  // 处理所有文章
  async processArticles(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const processed: NewsArticle[] = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`🤖 Processing [${i + 1}/${articles.length}]: ${article.title.substring(0, 50)}...`);

      try {
        // 并行生成摘要和翻译
        const [summary, translatedTitle] = await Promise.all([
          this.generateSummary(article.content),
          this.translateTitle(article.title),
        ]);

        processed.push({
          ...article,
          summary,
          translatedTitle,
        });
      } catch (error) {
        console.error(`❌ Error processing article:`, error);
        // 失败时保留原文
        processed.push(article);
      }

      // 避免请求过快
      await this.sleep(500);
    }

    return processed;
  }

  // 按分类分组
  groupByCategory(articles: NewsArticle[]): Record<string, NewsArticle[]> {
    const groups: Record<string, NewsArticle[]> = {};

    for (const article of articles) {
      const cat = article.category || '其他';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(article);
    }

    return groups;
  }

  // 保存处理后的数据
  save(data: DailyData): void {
    const filePath = join(process.cwd(), 'data', 'processed.json');
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Saved processed data to ${filePath}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 主函数
async function main() {
  console.log('🤖 Starting AI processing...\n');

  // 读取原始数据
  const rawPath = join(process.cwd(), 'data', 'raw.json');
  const raw = JSON.parse(readFileSync(rawPath, 'utf-8'));

  const generator = new Generator();
  
  // 处理文章
  const processedArticles = await generator.processArticles(raw.articles);
  
  // 分组
  const categories = generator.groupByCategory(processedArticles);

  // 构建日报数据
  const dailyData: DailyData = {
    date: raw.date,
    articles: processedArticles,
    categories,
  };

  // 保存
  generator.save(dailyData);

  console.log(`\n✅ Processing complete:`);
  console.log(`   - Total articles: ${processedArticles.length}`);
  console.log(`   - Categories: ${Object.keys(categories).join(', ')}`);
}

main().catch(console.error);