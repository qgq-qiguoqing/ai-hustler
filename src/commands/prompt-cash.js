const { OpenAI } = require('openai');

class PromptCashGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    
    this.promptTemplates = {
      '小红书文案': {
        systemPrompt: "你是一个小红书爆款文案专家，擅长写种草文案",
        basePrice: 30,
        complexityMultipliers: { simple: 1, medium: 2, complex: 3 }
      },
      '电商产品描述': {
        systemPrompt: "你是电商文案专家，擅长写转化率高的产品描述",
        basePrice: 50,
        complexityMultipliers: { simple: 1, medium: 1.5, complex: 2.5 }
      },
      'SEO文章': {
        systemPrompt: "你是SEO专家，擅长写搜索引擎友好的文章",
        basePrice: 80,
        complexityMultipliers: { simple: 1, medium: 2, complex: 4 }
      },
      '营销邮件': {
        systemPrompt: "你是邮件营销专家，擅长写高转化率的销售邮件",
        basePrice: 60,
        complexityMultipliers: { simple: 1, medium: 1.8, complex: 3 }
      },
      '短视频脚本': {
        systemPrompt: "你是短视频脚本专家，擅长写爆款视频脚本",
        basePrice: 40,
        complexityMultipliers: { simple: 1, medium: 1.5, complex: 2.5 }
      }
    };
  }

  async generatePrompt(requirement, options = {}) {
    const { style = 'professional', complexity = 'medium' } = options;
    
    // 分析需求类型
    const requirementType = this.categorizeRequirement(requirement);
    const template = this.promptTemplates[requirementType];
    
    if (!template) {
      return await this.generateCustomPrompt(requirement, style, complexity);
    }

    // 生成专业提示词
    const enhancedPrompt = await this.createEnhancedPrompt(requirement, requirementType, style, complexity);
    
    // 计算建议价格
    const suggestedPrice = this.calculatePrice(requirementType, complexity, enhancedPrompt);

    return {
      content: enhancedPrompt,
      requirementType,
      style,
      complexity,
      suggestedPrice,
      marketAnalysis: await this.analyzeMarket(requirementType)
    };
  }

  categorizeRequirement(requirement) {
    const text = requirement.toLowerCase();
    
    if (text.includes('小红书') || text.includes('种草') || text.includes('分享')) {
      return '小红书文案';
    }
    if (text.includes('电商') || text.includes('产品') || text.includes('商品')) {
      return '电商产品描述';
    }
    if (text.includes('seo') || text.includes('文章') || text.includes('博客')) {
      return 'SEO文章';
    }
    if (text.includes('邮件') || text.includes('email') || text.includes('销售信')) {
      return '营销邮件';
    }
    if (text.includes('短视频') || text.includes('抖音') || text.includes('脚本')) {
      return '短视频脚本';
    }
    
    return '小红书文案'; // 默认
  }

  async createEnhancedPrompt(requirement, type, style, complexity) {
    const template = this.promptTemplates[type];
    
    const prompt = `
基于以下需求，生成一个专业级的AI提示词：

用户需求：${requirement}
类型：${type}
风格：${style}
复杂度：${complexity}

要求：
1. 提示词要具体、可操作
2. 包含输入格式要求
3. 包含输出格式要求
4. 包含质量检查标准
5. 适合${complexity}级别的用户

请生成提示词，并解释为什么这个提示词能产出高价值内容。
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: template.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.warn('AI生成失败:', error.message);
      return this.createFallbackPrompt(requirement, type, style, complexity);
    }
  }

  createFallbackPrompt(requirement, type, style, complexity) {
    // 备用提示词模板
    const templates = {
      '小红书文案': `你是一个小红书爆款文案专家。

任务：${requirement}

要求：
- 风格：${style}
- 复杂度：${complexity}
- 包含emoji表情
- 有吸引力的标题
- 真实的用户体验分享
- 适当的种草引导

输出格式：
标题：[吸引人的标题]
正文：[文案内容]
标签：[相关标签]

确保内容真实可信，避免过度营销。`,

      '电商产品描述': `你是专业的电商产品描述撰写专家。

任务：${requirement}

要求：
- 突出产品卖点和优势
- 解决用户痛点
- 包含使用场景
- 有说服力的购买引导
- SEO友好的关键词

输出格式：
产品标题：[优化的产品标题]
核心卖点：[3-5个关键卖点]
详细描述：[产品详细描述]
使用场景：[使用场景描述]
购买理由：[为什么现在购买]

确保描述准确、吸引人、促进转化。`
    };

    return templates[type] || templates['小红书文案'];
  }

  calculatePrice(type, complexity, prompt) {
    const template = this.promptTemplates[type];
    if (!template) return 50;

    const basePrice = template.basePrice;
    const multiplier = template.complexityMultipliers[complexity] || 1.5;
    
    // 根据提示词长度和质量调整价格
    const lengthBonus = prompt.length > 500 ? 10 : 0;
    const qualityBonus = prompt.includes('专业') || prompt.includes('高级') ? 15 : 0;
    
    return Math.round((basePrice * multiplier + lengthBonus + qualityBonus) * 10) / 10;
  }

  async analyzeMarket(type) {
    const markets = {
      '小红书文案': {
        demand: '高',
        competition: '中等',
        averagePrice: '30-80元/篇',
        growth: '快速增长',
        tips: '美妆、穿搭、美食类内容需求最大'
      },
      '电商产品描述': {
        demand: '极高',
        competition: '高',
        averagePrice: '50-150元/个',
        growth: '稳定增长',
        tips: '3C数码、家居用品转化率最高'
      },
      'SEO文章': {
        demand: '高',
        competition: '高',
        averagePrice: '80-200元/篇',
        growth: '稳定增长',
        tips: '科技、金融、健康类文章价值最高'
      }
    };

    return markets[type] || markets['小红书文案'];
  }

  async generateCustomPrompt(requirement, style, complexity) {
    // 为未知类型生成自定义提示词
    const customPrompt = `
基于以下需求，生成一个专业级的AI工作提示词：

需求：${requirement}
风格：${style}
复杂度：${complexity}

请生成一个包含以下要素的提示词：
1. 角色定义
2. 任务描述
3. 输入格式要求
4. 输出格式要求
5. 质量标准和检查项
6. 示例（如需要）

确保提示词具体、可操作、能产出高质量结果。
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: customPrompt }],
        temperature: 0.5
      });

      return {
        content: completion.choices[0].message.content,
        requirementType: '自定义',
        style,
        complexity,
        suggestedPrice: 45,
        marketAnalysis: {
          demand: '中等',
          competition: '低',
          averagePrice: '40-100元/个',
          growth: '新兴需求',
          tips: '定制化提示词需求增长迅速'
        }
      };
    } catch (error) {
      return {
        content: `请根据以下需求生成高质量内容：${requirement}`,
        requirementType: '自定义',
        style,
        complexity,
        suggestedPrice: 30,
        marketAnalysis: {
          demand: '中等',
          competition: '低',
          averagePrice: '30-80元/个',
          growth: '新兴需求',
          tips: '简单直接的提示词也有市场'
        }
      };
    }
  }
}

async function promptCash(requirement, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('请设置OPENAI_API_KEY环境变量');
  }

  const generator = new PromptCashGenerator(apiKey);
  return await generator.generatePrompt(requirement, options);
}

module.exports = { promptCash };