const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class EarningTracker {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'data', 'earnings.json');
    this.initDataFile();
  }

  async initDataFile() {
    await fs.ensureDir(path.dirname(this.dataFile));
    
    if (!await fs.pathExists(this.dataFile)) {
      await fs.writeJSON(this.dataFile, {
        earnings: [],
        createdAt: new Date().toISOString(),
        totalEarning: 0,
        currency: 'CNY'
      });
    }
  }

  async trackEarning(amount, source, description = '', date = null) {
    const data = await fs.readJSON(this.dataFile);
    
    const earning = {
      id: `earn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: parseFloat(amount),
      source,
      description,
      date: date ? moment(date).toISOString() : moment().toISOString(),
      createdAt: new Date().toISOString(),
      currency: data.currency || 'CNY'
    };

    data.earnings.push(earning);
    data.totalEarning = data.earnings.reduce((sum, e) => sum + e.amount, 0);
    
    await fs.writeJSON(this.dataFile, data);
    
    return earning;
  }

  async getEarnings(period = 'month', startDate = null, endDate = null) {
    const data = await fs.readJSON(this.dataFile);
    
    let filteredEarnings = data.earnings;
    
    // 时间筛选
    if (startDate && endDate) {
      filteredEarnings = filteredEarnings.filter(e => 
        moment(e.date).isBetween(startDate, endDate, null, '[]')
      );
    } else {
      // 按周期筛选
      const now = moment();
      let start;
      
      switch (period) {
        case 'day':
          start = now.startOf('day');
          break;
        case 'week':
          start = now.startOf('week');
          break;
        case 'month':
          start = now.startOf('month');
          break;
        case 'year':
          start = now.startOf('year');
          break;
        default:
          start = now.startOf('month');
      }
      
      filteredEarnings = filteredEarnings.filter(e => 
        moment(e.date).isSameOrAfter(start)
      );
    }

    return {
      earnings: filteredEarnings,
      total: filteredEarnings.reduce((sum, e) => sum + e.amount, 0),
      count: filteredEarnings.length,
      average: filteredEarnings.length > 0 ? filteredEarnings.reduce((sum, e) => sum + e.amount, 0) / filteredEarnings.length : 0,
      currency: data.currency
    };
  }

  async getStatistics(period = 'month') {
    const earnings = await this.getEarnings(period);
    
    if (earnings.earnings.length === 0) {
      return {
        period,
        total: 0,
        count: 0,
        average: 0,
        dailyAverage: 0,
        maxDay: 0,
        sourceBreakdown: {},
        trend: [],
        currency: earnings.currency
      };
    }

    // 来源分析
    const sourceBreakdown = {};
    earnings.earnings.forEach(e => {
      if (!sourceBreakdown[e.source]) {
        sourceBreakdown[e.source] = { amount: 0, count: 0 };
      }
      sourceBreakdown[e.source].amount += e.amount;
      sourceBreakdown[e.source].count += 1;
    });

    // 日趋势分析
    const dailyData = {};
    earnings.earnings.forEach(e => {
      const day = moment(e.date).format('YYYY-MM-DD');
      if (!dailyData[day]) {
        dailyData[day] = 0;
      }
      dailyData[day] += e.amount;
    });

    const trend = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));

    // 计算统计数据
    const maxDay = Math.max(...Object.values(dailyData));
    const dailyAverage = earnings.total / Object.keys(dailyData).length;

    return {
      period,
      total: earnings.total,
      count: earnings.count,
      average: earnings.average,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      maxDay,
      sourceBreakdown,
      trend,
      currency: earnings.currency
    };
  }

  async exportData(format = 'csv', period = 'month') {
    const earnings = await this.getEarnings(period);
    
    if (format === 'csv') {
      return this.exportToCSV(earnings);
    } else if (format === 'json') {
      return this.exportToJSON(earnings);
    }
  }

  async exportToCSV(earnings) {
    const { createObjectCsvWriter } = require('csv-writer');
    const csvWriter = createObjectCsvWriter({
      path: path.join(process.cwd(), 'exports', `earnings-${Date.now()}.csv`),
      header: [
        { id: 'date', title: '日期' },
        { id: 'source', title: '收入来源' },
        { id: 'amount', title: '金额' },
        { id: 'description', title: '描述' },
        { id: 'currency', title: '货币' }
      ]
    });

    const records = earnings.earnings.map(e => ({
      date: moment(e.date).format('YYYY-MM-DD HH:mm:ss'),
      source: e.source,
      amount: e.amount,
      description: e.description,
      currency: e.currency
    }));

    await csvWriter.writeRecords(records);
    
    return {
      filepath: csvWriter.fileWriter.path,
      recordCount: records.length,
      totalAmount: earnings.total
    };
  }

  async exportToJSON(earnings) {
    const filepath = path.join(process.cwd(), 'exports', `earnings-${Date.now()}.json`);
    await fs.ensureDir(path.dirname(filepath));
    
    const data = {
      exportDate: new Date().toISOString(),
      summary: {
        total: earnings.total,
        count: earnings.count,
        average: earnings.average,
        currency: earnings.currency
      },
      earnings: earnings.earnings.map(e => ({
        ...e,
        date: moment(e.date).format('YYYY-MM-DD HH:mm:ss'),
        createdAt: moment(e.createdAt).format('YYYY-MM-DD HH:mm:ss')
      }))
    };

    await fs.writeJSON(filepath, data, { spaces: 2 });
    
    return {
      filepath,
      recordCount: earnings.count,
      totalAmount: earnings.total
    };
  }

  async getInsights() {
    const monthlyStats = await this.getStatistics('month');
    const weeklyStats = await this.getStatistics('week');
    
    const insights = [];
    
    // 收入增长分析
    if (monthlyStats.trend.length > 1) {
      const recentDays = monthlyStats.trend.slice(-7);
      const avgRecent = recentDays.reduce((sum, day) => sum + day.amount, 0) / recentDays.length;
      const avgPrevious = monthlyStats.trend.slice(-14, -7).reduce((sum, day) => sum + day.amount, 0) / 7;
      
      if (avgRecent > avgPrevious * 1.2) {
        insights.push('📈 最近一周收入增长超过20%，表现优秀！');
      } else if (avgRecent < avgPrevious * 0.8) {
        insights.push('📉 最近一周收入下降明显，需要寻找新的收入来源。');
      }
    }
    
    // 来源分析
    const topSource = Object.entries(monthlyStats.sourceBreakdown)
      .sort(([,a], [,b]) => b.amount - a.amount)[0];
    
    if (topSource) {
      insights.push(`💰 主要收入来源：${topSource[0]}，占比${Math.round(topSource[1].amount / monthlyStats.total * 100)}%`);
    }
    
    // 目标建议
    const dailyTarget = 100; // 日收入目标100元
    const currentDailyAvg = monthlyStats.dailyAverage;
    
    if (currentDailyAvg < dailyTarget) {
      const gap = dailyTarget - currentDailyAvg;
      insights.push(`🎯 距离日收入目标还差¥${gap.toFixed(2)}，建议：
        - 寻找新的收入来源
        - 提高现有收入效率
        - 增加工作时长`);
    } else {
      insights.push('🎉 已达到日收入目标，继续保持！');
    }
    
    return insights;
  }
}

async function earningTracker(options = {}) {
  const { period = 'month', export: exportFormat = null } = options;
  
  const tracker = new EarningTracker();
  
  if (exportFormat) {
    return await tracker.exportData(exportFormat, period);
  }
  
  const stats = await tracker.getStatistics(period);
  const insights = await tracker.getInsights();
  
  return {
    ...stats,
    insights,
    lastUpdated: new Date().toISOString()
  };
}

// 快速记录收入的辅助函数
async function quickTrack(amount, source, description) {
  const tracker = new EarningTracker();
  return await tracker.trackEarning(amount, source, description);
}

module.exports = { earningTracker, quickTrack };