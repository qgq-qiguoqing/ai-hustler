const { OpenAI } = require('openai');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class ContentArbitrageGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    
    this.platformConfigs = {
      xiaohongshu: {
        name: '小红书',
        maxLength: 1000,
        style: '种草分享',
        hashtags: ['#好物分享', '#种草', '#生活好物', '#性价比'],
        avgEarning: 15 // 预估单篇收益
      },
      weibo: {
        name: '微博',
        maxLength: 500,
        style: '热点评论',
        hashtags: ['#科技', '#数码', '#生活'],
        avgEarning: 8
      },
      zhihu: {
        name: '知乎',
        maxLength: 2000,
        style: '专业回答',
        hashtags: [],
        avgEarning: 25
      }
    };

    this.contentNiches = {
      '科技数码': {
        topics: ['手机评测', '电脑技巧', 'APP推荐', '数码好物', '科技资讯'],
        keywords: ['性价比', '实用', '推荐', '体验', '评测'],
        targetAudience: '科技爱好者'
      },
      '美妆护肤': {
        topics: ['护肤心得', '彩妆教程', '产品测评', '种草分享', '化妆技巧'],
        keywords: ['好用', '推荐', '种草', '平价', '效果'],
        targetAudience: '爱美女性'
      },
      '生活技巧': {
        topics: ['生活妙招', '收纳整理', '美食制作', '居家好物', '省钱技巧'],
        keywords: ['实用', '简单', '方便', '省钱', '好用'],
        targetAudience: '家庭主妇'
      },
      '职场成长': {
        topics: ['职场技能', '工作效率', '沟通技巧', '职业规划', '办公软件'],
        keywords: ['实用', '效率', '提升', '技巧', '方法'],
        targetAudience: '职场人士'
      }
    };
  }

  async generateContent(platform, niche, count = 10) {
    const platformConfig = this.platformConfigs[platform];
    const nicheConfig = this.contentNiches[niche];
    
    if (!platformConfig || !nicheConfig) {
      throw new Error('不支持的平台或细分领域');
    }

    const contents = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const topic = nicheConfig.topics[i % nicheConfig.topics.length];
        const content = await this.createPlatformContent(platform, niche, topic);
        
        contents.push({
          id: `${platform}_${Date.now()}_${i}`,
          platform: platformConfig.name,
          niche,
          topic,
          title: content.title,
          content: content.content,
          hashtags: content.hashtags || [],
          estimatedEarning: this.calculateEarning(platform, content),
          publishTime: this.suggestPublishTime(platform),
          quality: content.quality,
          uniqueness: content.uniqueness
        });
      } catch (error) {
        console.warn(`生成内容 ${i + 1} 失败:`, error.message);
      }
    }

    return contents;
  }

  async createPlatformContent(platform, niche, topic) {
    const platformConfig = this.platformConfigs[platform];
    const nicheConfig = this.contentNiches[niche];
    
    const prompt = `
为${platformConfig.name}平台创作一篇${niche}领域的${topic}内容。

要求：
1. 风格：${platformConfig.style}
2. 字数限制：${platformConfig.maxLength}字以内
3. 目标受众：${nicheConfig.targetAudience}
4. 包含关键词：${nicheConfig.keywords.join(',')}
5. 内容要真实、有价值、有吸引力
6. 避免过度营销和虚假宣传

返回JSON格式：
{
  "title": "吸引人的标题",
  "content": "正文内容",
  "hashtags": ["相关标签"],
  "quality": 8,
  "uniqueness": 9
}
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      });

      const response = JSON.parse(completion.choices[0].message.content);
      
      // 添加平台特定的hashtag
      if (platform === 'xiaohongshu' || platform === 'weibo') {
        response.hashtags = [...response.hashtags, ...platformConfig.hashtags];
      }
      
      return response;
    } catch (error) {
      console.warn('AI内容生成失败:', error.message);
      return this.createFallbackContent(platform, niche, topic);
    }
  }

  createFallbackContent(platform, niche, topic) {
    const fallbacks = {
      xiaohongshu: {
        科技数码: {
          title: '发现一款超好用的数码好物！',
          content: '最近入手了一个超实用的数码产品，真的被惊艳到了！首先颜值就很高，设计感满满。用了几天发现功能也很强大，完全超出了我的预期。最重要的是性价比真的很高，同等价位里绝对是最佳选择。强烈推荐给大家！',
          hashtags: ['#数码好物', '#性价比', '#种草分享'],
          quality: 7,
          uniqueness: 6
        }
      }
    };

    const content = fallbacks[platform]?.[niche]?.[topic] || {
      title: `${topic}分享`,
      content: `今天想和大家分享一下关于${topic}的一些心得体会。经过实际使用，发现确实有很多值得分享的地方。希望能对大家有所帮助！`,
      hashtags: [],
      quality: 6,
      uniqueness: 5
    };

    return content;
  }

  calculateEarning(platform, content) {
    const baseEarning = this.platformConfigs[platform].avgEarning;
    const qualityMultiplier = content.quality / 10;
    const uniquenessMultiplier = content.uniqueness / 10;
    
    // 平台热度系数
    const platformMultiplier = {
      xiaohongshu: 1.2,
      weibo: 0.8,
      zhihu: 1.5
    }[platform] || 1;

    return Math.round(baseEarning * qualityMultiplier * uniquenessMultiplier * platformMultiplier * 10) / 10;
  }

  suggestPublishTime(platform) {
    const now = moment();
    
    // 各平台最佳发布时间
    const bestTimes = {
      xiaohongshu: ['08:00', '12:00', '20:00'], // 早上通勤、午休、晚上休闲
      weibo: ['09:00', '13:00', '21:00'],      // 工作时间、午休、晚上
      zhihu: ['10:00', '14:00', '22:00']       // 思考时间
    };

    const times = bestTimes[platform] || bestTimes.xiaohongshu;
    const tomorrow = now.add(1, 'day');
    const randomTime = times[Math.floor(Math.random() * times.length)];
    
    return tomorrow.format('YYYY-MM-DD') + ' ' + randomTime;
  }

  async saveContent(contents, filename) {
    const data = {
      generatedAt: new Date().toISOString(),
      totalContents: contents.length,
      totalEstimatedEarning: contents.reduce((sum, content) => sum + content.estimatedEarning, 0),
      contents: contents
    };

    const filepath = path.join(process.cwd(), 'content-output', filename || `content-${Date.now()}.json`);
    await fs.ensureDir(path.dirname(filepath));
    await fs.writeJSON(filepath, data, { spaces: 2 });
    
    return filepath;
  }

  async batchPublish(contents, autoPublish = false) {
    if (!autoPublish) {
      return {
        status: 'ready',
        message: '内容已生成，请手动发布到对应平台',
        contents: contents.map(c => ({
          id: c.id,
          platform: c.platform,
          title: c.title,
          publishTime: c.publishTime,
          estimatedEarning: c.estimatedEarning
        }))
      };
    }

    // 这里可以集成实际的发布API
    // 比如小红书的开放平台API、微博API等
    
    return {
      status: 'published',
      message: '自动发布功能需要配置平台API',
      contents: contents.map(c => ({
        ...c,
        publishStatus: 'pending',
        publishMessage: '需要手动发布'
      }))
    };
  }
}

async function contentArbitrage(options = {}) {
  const { platform = 'xiaohongshu', count = '10', niche = '科技数码' } = options;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('请设置OPENAI_API_KEY环境变量');
  }

  const generator = new ContentArbitrageGenerator(apiKey);
  const contents = await generator.generateContent(platform, niche, parseInt(count));
  
  // 保存到文件
  const filepath = await generator.saveContent(contents);
  
  return {
    contents,
    totalEarning: contents.reduce((sum, content) => sum + content.estimatedEarning, 0),
    savedTo: filepath,
    publishSuggestion: await generator.batchPublish(contents)
  };
}

module.exports = { contentArbitrage };