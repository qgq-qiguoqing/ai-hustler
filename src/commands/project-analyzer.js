const axios = require('axios');
const { OpenAI } = require('openai');

class ProjectAnalyzer {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    
    this.projectTypes = {
      'AI客服': {
        description: '智能客服系统开发',
        marketSize: '大型',
        competition: '中等',
        techBarrier: '中等'
      },
      '内容生成': {
        description: 'AI内容创作工具',
        marketSize: '大型', 
        competition: '高',
        techBarrier: '中等'
      },
      '数据分析': {
        description: 'AI数据分析服务',
        marketSize: '中型',
        competition: '低',
        techBarrier: '高'
      },
      '图像处理': {
        description: 'AI图像处理工具',
        marketSize: '大型',
        competition: '高', 
        techBarrier: '高'
      },
      '语音处理': {
        description: 'AI语音技术服务',
        marketSize: '中型',
        competition: '中等',
        techBarrier: '高'
      }
    };
  }

  async analyzeProjects(options = {}) {
    const { service = 'AI客服', location = '全国' } = options;
    
    const projects = [];
    
    // 生成基于AI的项目分析
    for (const [type, info] of Object.entries(this.projectTypes)) {
      if (type.includes(service) || service === 'all') {
        const analysis = await this.analyzeProjectType(type, info, location);
        projects.push(analysis);
      }
    }
    
    // 添加一些通用的AI项目机会
    const generalProjects = await this.generateGeneralProjects(location);
    projects.push(...generalProjects);
    
    return projects.sort((a, b) => b.estimatedEarning - a.estimatedEarning);
  }

  async analyzeProjectType(type, info, location) {
    try {
      const prompt = `
分析以下AI项目类型的市场机会：

项目类型：${type}
项目描述：${info.description}
目标地区：${location}
市场规模：${info.marketSize}
竞争程度：${info.competition}
技术门槛：${info.techBarrier}

请从以下维度分析：
1. 市场潜力和需求分析
2. 技术实现难度评估
3. 预估收益范围（月收益，单位：元）
4. 具体实施建议
5. 风险评估

返回JSON格式：
{
  "type": "${type}",
  "needs": "市场需求描述",
  "marketPotential": "高/中/低",
  "techDifficulty": "高/中/低", 
  "estimatedEarning": 5000,
  "suggestion": "具体实施建议",
  "risk": "主要风险点"
}
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      const response = JSON.parse(completion.choices[0].message.content);
      
      return {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: response.type,
        needs: response.needs,
        marketPotential: response.marketPotential,
        techDifficulty: response.techDifficulty,
        estimatedEarning: response.estimatedEarning,
        suggestion: response.suggestion,
        risk: response.risk,
        location: location
      };
    } catch (error) {
      console.warn('AI分析失败:', error.message);
      return this.getFallbackAnalysis(type, info, location);
    }
  }

  async generateGeneralProjects(location) {
    const generalProjects = [
      {
        type: 'AI教育工具',
        needs: '个性化学习辅导、智能题库、学习路径规划',
        marketPotential: '高',
        techDifficulty: '中',
        estimatedEarning: 8000,
        suggestion: '从特定学科（如英语、数学）切入，开发AI辅导工具',
        risk: '教育政策变化、用户获取成本高'
      },
      {
        type: 'AI健康助手',
        needs: '健康咨询、症状分析、健康数据管理',
        marketPotential: '中',
        techDifficulty: '高',
        estimatedEarning: 6000,
        suggestion: '专注细分领域（如中医、营养），提供专业建议',
        risk: '医疗合规要求、准确性责任'
      },
      {
        type: 'AI办公自动化',
        needs: '文档处理、邮件回复、会议记录、日程管理',
        marketPotential: '高',
        techDifficulty: '中',
        estimatedEarning: 10000,
        suggestion: '针对中小企业，提供一站式办公自动化解决方案',
        risk: '市场竞争激烈、技术更新快'
      }
    ];

    return generalProjects.map(project => ({
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...project,
      location: location
    }));
  }

  getFallbackAnalysis(type, info, location) {
    const fallbackData = {
      'AI客服': {
        type: 'AI客服',
        needs: '企业智能客服系统，降低人工成本',
        marketPotential: '高',
        techDifficulty: '中',
        estimatedEarning: 8000,
        suggestion: '从中小企业入手，提供定制化客服解决方案',
        risk: '需要大量训练数据、维护成本高'
      },
      '内容生成': {
        type: '内容生成',
        needs: '营销文案、产品描述、社交媒体内容',
        marketPotential: '高',
        techDifficulty: '中',
        estimatedEarning: 5000,
        suggestion: '专注特定领域（如电商、自媒体），建立内容模板库',
        risk: '内容同质化、版权问题'
      }
    };

    return {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...(fallbackData[type] || fallbackData['AI客服']),
      location: location
    };
  }

  generateMarketInsights() {
    return {
      trends: [
        'AI工具需求持续增长',
        '中小企业数字化转型加速',
        '内容创作自动化需求旺盛',
        '数据标注市场扩大',
        'AI客服接受度提高'
      ],
      opportunities: [
        '垂直领域AI应用',
        'AI工具集成服务',
        'AI教育培训',
        'AI咨询顾问',
        'AI内容创作'
      ],
      challenges: [
        '技术门槛较高',
        '市场竞争激烈',
        '用户教育成本',
        '合规要求严格',
        '技术更新快速'
      ]
    };
  }
}

async function projectAnalyzer(options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('请设置OPENAI_API_KEY环境变量');
  }

  const analyzer = new ProjectAnalyzer(apiKey);
  const projects = await analyzer.analyzeProjects(options);
  const insights = analyzer.generateMarketInsights();

  return {
    projects,
    insights,
    summary: {
      totalProjects: projects.length,
      avgEarning: Math.round(projects.reduce((sum, p) => sum + p.estimatedEarning, 0) / projects.length),
      highPotentialProjects: projects.filter(p => p.marketPotential === '高').length,
      lowRiskProjects: projects.filter(p => p.techDifficulty === '低').length
    }
  };
}

module.exports = { projectAnalyzer };