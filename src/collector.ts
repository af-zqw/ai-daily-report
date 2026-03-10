// 信息收集器 - 使用 Tavily API
import { CONFIG, validateConfig } from './config.js';
import type { TavilyResponse, TavilyResult, NewsArticle } from './types.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

class Collector {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    validateConfig();
    this.apiKey = CONFIG.tavily.apiKey;
    this.baseUrl = CONFIG.tavily.baseUrl;
  }

  // 调用 Tavily API 搜索
  async search(query: string, maxResults: number = 5): Promise<TavilyResult[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        max_results: maxResults,
        include_answer: false,
        include_images: false,
        include_raw_content: true,
        days: 1, // 最近一天的新闻
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data: TavilyResponse = await response.json();
    return data.results || [];
  }

  // 收集所有领域的新闻
  async collectAll(): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    for (const topic of CONFIG.topics) {
      console.log(`🔍 Searching: ${topic}`);
      
      try {
        const results = await this.search(topic, 3);
        
        for (const result of results) {
          // 去重
          if (seenUrls.has(result.url)) continue;
          seenUrls.add(result.url);

          const article: NewsArticle = {
            id: this.generateId(result.url),
            title: result.title,
            url: result.url,
            content: result.content.substring(0, 2000), // 限制长度
            source: new URL(result.url).hostname,
            publishedDate: result.published_date || new Date().toISOString(),
            category: this.categorize(topic),
          };

          allArticles.push(article);
        }
      } catch (error) {
        console.error(`❌ Error searching "${topic}":`, error);
      }

      // 避免请求过快
      await this.sleep(1000);
    }

    return allArticles.slice(0, CONFIG.output.maxArticles);
  }

  // 根据搜索主题分类
  private categorize(topic: string): string {
    if (topic.includes('AI') || topic.includes('人工智能')) return 'AI/ML';
    if (topic.includes('前端')) return '前端开发';
    if (topic.includes('后端') || topic.includes('架构')) return '后端/架构';
    if (topic.includes('开源')) return '开源项目';
    return '其他';
  }

  // 生成唯一 ID
  private generateId(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 12);
  }

  // 保存数据
  save(data: NewsArticle[]): void {
    const dataDir = join(process.cwd(), 'data');
    mkdirSync(dataDir, { recursive: true });

    const filePath = join(dataDir, 'raw.json');
    writeFileSync(filePath, JSON.stringify({
      date: new Date().toISOString(),
      articles: data,
    }, null, 2));

    console.log(`💾 Saved ${data.length} articles to ${filePath}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 主函数
async function main() {
  console.log('📰 Starting news collection...\n');
  
  const collector = new Collector();
  const articles = await collector.collectAll();
  
  collector.save(articles);
  
  console.log(`\n✅ Collection complete: ${articles.length} articles`);
}

main().catch(console.error);