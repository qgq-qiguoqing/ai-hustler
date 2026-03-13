const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');

class OpportunityFinder {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.platforms = {
      fiverr: {
        url: 'https://www.fiverr.com/categories',
        categories: ['writing-translation', 'digital-marketing', 'graphics-design']
      },
      zhubajie: {
        url: 'https://www.zbj.com/category',
        categories: ['graphicdesign', 'webdesign', 'copywriting']
      }
    };
  }

  async discoverOpportunities(options = {}) {
    const { platforms = 'fiverr,zhubajie', minPrice = 50 } = options;
    const platformList = platforms.split(',');
    const opportunities = [];

    for (const platform of platformList) {
      try {
        const platformOps = await this.scrapePlatform(platform, minPrice);
        opportunities.push(...platformOps);
      } catch (error) {
        console.warn(`抓取${platform}失败:`, error.message);
      }
    }

    return opportunities;
  }

  async scrapePlatform(platform, minPrice) {
    const config = this.platforms[platform];
    if (!config) return [];

    const opportunities = [];
    
    // 模拟抓取数据（实际项目中需要实现真实的网页抓取）
    const mockData = this.getMockData(platform, minPrice);
    
    for (const item of mockData) {
      const aiReplaceable = await this.analyzeAIReplaceable(item);
      if (aiReplaceable.score > 0.7) {
        opportunities.push({
          platform,
          service: item.title,
          description: item.description,
          currentPrice: item.price,
          aiCost: this.estimateAICost(item),
          potentialProfit: item.price - this.estimateAICost(item),
          difficulty: aiReplaceable.difficulty,
          timeRequired: aiReplaceable.timeRequired,
          marketDemand: aiReplaceable.marketDemand
        });
      }
    }

    return opportunities;
  }

  async analyzeAIReplaceable(service) {
    try {
      const prompt = `
分析以下服务是否可以被AI替代，并给出评分：

服务名称：${service.title}
服务描述：${service.description}
价格：$${service.price}

请从以下几个维度分析：
1. AI替代可行性 (0-1)
2. 实现难度 (1-10，1最容易)
3. 所需时间 (小时)
4. 市场需求度 (1-10，10最高)
5. 需要的人工干预程度

返回JSON格式：
{
  "score": 0.8,
  "difficulty": 3,
  "timeRequired": 2,
  "marketDemand": 8,
  "reason": "分析原因"
}
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      const response = JSON.parse(completion.choices[0].message.content);
      return response;
    } catch (error) {
      console.warn('AI分析失败:', error.message);
      return {
        score: 0.5,
        difficulty: 5,
        timeRequired: 4,
        marketDemand: 6,
        reason: "分析失败，使用默认值"
      };
    }
  }

  estimateAICost(service) {
    // 估算使用AI完成该服务的成本
    const baseCosts = {
      'writing': 0.5,
      'translation': 1.0,
      'design': 2.0,
      'marketing': 1.5,
      'data-entry': 0.2
    };

    const serviceType = this.categorizeService(service.title + ' ' + service.description);
    return baseCosts[serviceType] || 1.0;
  }

  categorizeService(text) {
    text = text.toLowerCase();
    if (text.includes('write') || text.includes('article') || text.includes('content')) return 'writing';
    if (text.includes('translate') || text.includes('translation')) return 'translation';
    if (text.includes('design') || text.includes('logo')) return 'design';
    if (text.includes('marketing') || text.includes('seo')) return 'marketing';
    if (text.includes('data') || text.includes('entry')) return 'data-entry';
    return 'writing';
  }

  getMockData(platform, minPrice) {
    // 模拟数据，实际项目中需要真实抓取
    const allMockData = {
      fiverr: [
        { title: "Write 10 SEO Articles", description: "High-quality blog posts", price: 100 },
        { title: "Social Media Content Creation", description: "30 days of posts", price: 150 },
        { title: "Product Description Writing", description: "E-commerce product copy", price: 75 },
        { title: "Email Marketing Copy", description: "Sales email sequence", price: 120 },
        { title: "Website Content Writing", description: "5 pages of web content", price: 200 },
        { title: "Logo Design", description: "Professional logo creation", price: 80 },
        { title: "Business Card Design", description: "Custom business cards", price: 60 },
        { title: "Data Entry Services", description: "Excel data organization", price: 50 }
      ],
      zhubajie: [
        { title: "小红书文案写作", description: "20篇美妆文案", price: 80 },
        { title: "产品说明书翻译", description: "中英双语翻译", price: 120 },
        { title: "微信公众号文章", description: "10篇原创文章", price: 150 },
        { title: "电商详情页设计", description: "淘宝产品页面", price: 200 },
        { title: "企业宣传册设计", description: "PDF宣传材料", price: 300 },
        { title: "数据清洗整理", description: "Excel数据处理", price: 60 },
        { title: "SEO关键词优化", description: "网站SEO分析", price: 100 },
        { title: "短视频脚本写作", description: "抖音视频脚本", price: 90 }
      ]
    };

    return allMockData[platform]?.filter(item => item.price >= minPrice) || [];
  }
}

module.exports = { OpportunityFinder };