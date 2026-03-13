const axios = require('axios');
const { OpenAI } = require('openai');

class DataAnnotationFinder {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    
    // 主流数据标注平台
    this.platforms = {
      scale: {
        name: 'Scale AI',
        url: 'https://scale.com/careers',
        avgPay: 15, // $/小时
        taskTypes: ['图像标注', '文本分类', '语音转录'],
        difficulty: '中等',
        availability: '高'
      },
      remotasks: {
        name: 'Remotasks',
        url: 'https://remotasks.com',
        avgPay: 12,
        taskTypes: ['图像分割', '3D标注', '数据清洗'],
        difficulty: '简单',
        availability: '高'
      },
      appen: {
        name: 'Appen',
        url: 'https://appen.com',
        avgPay: 18,
        taskTypes: ['语音评测', '文本标注', '搜索评测'],
        difficulty: '中等',
        availability: '中等'
      },
      lionbridge: {
        name: 'Lionbridge',
        url: 'https://lionbridge.com',
        avgPay: 20,
        taskTypes: ['翻译标注', '内容审核', '文化适配'],
        difficulty: '高',
        availability: '中等'
      },
      clickworker: {
        name: 'Clickworker',
        url: 'https://clickworker.com',
        avgPay: 10,
        taskTypes: ['简单分类', '数据录入', '网页标注'],
        difficulty: '简单',
        availability: '极高'
      }
    };
  }

  async findAnnotationTasks(options = {}) {
    const { platforms = 'scale,remotasks,appen', auto = false } = options;
    const platformList = platforms.split(',');
    
    const allTasks = [];
    
    for (const platformName of platformList) {
      try {
        const platformTasks = await this.getPlatformTasks(platformName);
        allTasks.push(...platformTasks);
      } catch (error) {
        console.warn(`获取${platformName}任务失败:`, error.message);
      }
    }

    // 按收益排序
    allTasks.sort((a, b) => b.hourlyRate - a.hourlyRate);
    
    if (auto) {
      return await this.autoApplyTasks(allTasks.slice(0, 5));
    }
    
    return allTasks;
  }

  async getPlatformTasks(platformName) {
    const config = this.platforms[platformName];
    if (!config) return [];

    // 模拟获取任务数据（实际项目中需要API集成）
    const mockTasks = this.generateMockTasks(platformName, config);
    
    // 用AI分析任务的实际情况
    const analyzedTasks = [];
    for (const task of mockTasks) {
      try {
        const analysis = await this.analyzeTask(task, config);
        analyzedTasks.push(analysis);
      } catch (error) {
        analyzedTasks.push(task); // 使用原始数据
      }
    }

    return analyzedTasks;
  }

  generateMockTasks(platformName, config) {
    const taskTemplates = {
      scale: [
        {
          type: '图像标注',
          description: '为自动驾驶算法标注街景图像',
          estimatedTime: 180, // 分钟
          reward: 45, // 美元
          requirements: ['细心', '基本计算机操作'],
          difficulty: 'medium'
        },
        {
          type: '文本分类',
          description: '将用户评论分类为正面/负面/中性',
          estimatedTime: 60,
          reward: 18,
          requirements: ['英语阅读', '理解能力'],
          difficulty: 'easy'
        },
        {
          type: '语音转录',
          description: '将音频内容转录为文字',
          estimatedTime: 120,
          reward: 36,
          requirements: ['听力', '打字速度'],
          difficulty: 'medium'
        }
      ],
      remotasks: [
        {
          type: '图像分割',
          description: '精确分割图像中的物体轮廓',
          estimatedTime: 240,
          reward: 48,
          requirements: ['耐心', '细致'],
          difficulty: 'hard'
        },
        {
          type: '3D标注',
          description: '为3D点云数据添加标签',
          estimatedTime: 300,
          reward: 60,
          requirements: ['空间想象力', '培训证书'],
          difficulty: 'hard'
        },
        {
          type: '数据清洗',
          description: '清理和标准化数据格式',
          estimatedTime: 90,
          reward: 15,
          requirements: ['Excel基础'],
          difficulty: 'easy'
        }
      ],
      appen: [
        {
          type: '语音评测',
          description: '评测语音识别的准确性',
          estimatedTime: 150,
          reward: 50,
          requirements: ['母语水平', '语音学知识'],
          difficulty: 'medium'
        },
        {
          type: '搜索评测',
          description: '评估搜索引擎结果的相关性',
          estimatedTime: 45,
          reward: 15,
          requirements: ['文化背景知识'],
          difficulty: 'easy'
        }
      ]
    };

    const tasks = taskTemplates[platformName] || [];
    return tasks.map(task => ({
      id: `${platformName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform: config.name,
      platformUrl: config.url,
      ...task,
      hourlyRate: Math.round((task.reward / task.estimatedTime) * 60 * 10) / 10
    }));
  }

  async analyzeTask(task, config) {
    try {
      const prompt = `
分析以下数据标注任务的实际情况：

任务类型：${task.type}
描述：${task.description}
预计时间：${task.estimatedTime}分钟
报酬：$${task.reward}
平台：${config.name}

请分析：
1. 实际难度如何？
2. 预计时间是否合理？
3. 市场平均报酬是多少？
4. 是否值得做？
5. 有什么注意事项？

返回JSON格式分析结果。
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      
      return {
        ...task,
        aiAnalysis: analysis,
        recommendation: analysis.recommendation || 'neutral',
        realHourlyRate: analysis.realHourlyRate || task.hourlyRate
      };
    } catch (error) {
      return task; // 分析失败返回原始数据
    }
  }

  async autoApplyTasks(tasks) {
    const results = [];
    
    for (const task of tasks) {
      try {
        const result = await this.simulateApply(task);
        results.push(result);
      } catch (error) {
        results.push({
          taskId: task.id,
          success: false,
          message: error.message
        });
      }
    }

    return {
      applied: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  async simulateApply(task) {
    // 模拟申请过程
    // 实际项目中需要集成各平台的申请API
    
    const successRate = {
      easy: 0.8,
      medium: 0.6,
      hard: 0.4
    }[task.difficulty] || 0.5;

    const isSuccess = Math.random() < successRate;
    
    if (isSuccess) {
      return {
        taskId: task.id,
        success: true,
        message: '申请成功，等待平台审核',
        nextSteps: [
          '完成平台注册',
          '参加培训（如需要）',
          '开始接受任务',
          '按时高质量完成'
        ]
      };
    } else {
      return {
        taskId: task.id,
        success: false,
        message: '申请失败，可能原因：竞争激烈、资格不符、任务已满',
        suggestion: '可以尝试其他平台或提升技能后再申请'
      };
    }
  }

  async getPlatformStats() {
    const stats = {};
    
    for (const [name, config] of Object.entries(this.platforms)) {
      stats[name] = {
        name: config.name,
        avgPay: config.avgPay,
        totalTasks: await this.estimateTotalTasks(name),
        difficulty: config.difficulty,
        availability: config.availability,
        recommended: config.avgPay >= 15 && config.availability === '高'
      };
    }

    return stats;
  }

  async estimateTotalTasks(platformName) {
    // 估算平台任务总量
    const platformData = {
      scale: { total: 5000, dailyNew: 200 },
      remotasks: { total: 8000, dailyNew: 300 },
      appen: { total: 3000, dailyNew: 100 },
      lionbridge: { total: 2000, dailyNew: 50 },
      clickworker: { total: 10000, dailyNew: 500 }
    };

    return platformData[platformName] || { total: 1000, dailyNew: 50 };
  }

  generateApplicationTips() {
    return [
      '完善个人资料，突出相关技能',
      '从简单任务开始，积累评价',
      '保持高质量完成率',
      '多平台同时申请，增加机会',
      '关注平台培训机会',
      '建立良好的工作记录',
      '及时响应平台通知',
      '参与社区讨论，学习经验'
    ];
  }
}

async function dataAnnotation(options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('请设置OPENAI_API_KEY环境变量');
  }

  const finder = new DataAnnotationFinder(apiKey);
  
  const tasks = await finder.findAnnotationTasks(options);
  const platformStats = await finder.getPlatformStats();
  const tips = finder.generateApplicationTips();

  return {
    tasks,
    platformStats,
    tips,
    summary: {
      totalTasks: tasks.length,
      avgHourlyRate: tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + (task.realHourlyRate || task.hourlyRate), 0) / tasks.length * 10) / 10 : 0,
      bestPlatform: Object.values(platformStats).sort((a, b) => b.avgPay - a.avgPay)[0]?.name,
      recommendedTasks: tasks.filter(t => t.recommendation === 'recommended').length
    }
  };
}

module.exports = { dataAnnotation };