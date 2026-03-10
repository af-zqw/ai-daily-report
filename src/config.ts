// 配置管理
export const CONFIG = {
  // Tavily API 配置
  tavily: {
    apiKey: process.env.TAVILY_API_KEY || '',
    baseUrl: 'https://api.tavily.com',
  },
  
  // DeepSeek API 配置
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  },
  
  // 关注领域
  topics: [
    '人工智能 AI 最新进展',
    '大型语言模型 LLM',
    '前端开发技术',
    '后端架构',
    '开源项目',
  ],
  
  // 输出配置
  output: {
    maxArticles: 15,
    summaryLength: 150,
  },
};

// 验证配置
export function validateConfig(): void {
  if (!CONFIG.tavily.apiKey) {
    throw new Error('TAVILY_API_KEY is required');
  }
  if (!CONFIG.deepseek.apiKey) {
    throw new Error('DEEPSEEK_API_KEY is required');
  }
}