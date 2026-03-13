const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const { discoverOpportunities } = require('./commands/discover');
const { promptCash } = require('./commands/prompt-cash');
const { contentArbitrage } = require('./commands/content-arbitrage');
const { dataAnnotation } = require('./commands/data-annotation');
const { projectAnalyzer } = require('./commands/project-analyzer');
const { earningTracker } = require('./commands/earning-tracker');

const program = new Command();

program
  .name('ai-hustler')
  .description('🤖 AI赚钱黑客 - 用AI工具快速变现')
  .version('1.0.0');

// 发现套利机会
program
  .command('discover-opportunities')
  .alias('discover')
  .description('发现AI套利机会')
  .option('-p, --platforms <platforms>', '目标平台(fiverr,zhubajie)', 'fiverr,zhubajie')
  .option('-m, --min-price <price>', '最低价格', '50')
  .action(async (options) => {
    const spinner = ora('正在发现套利机会...').start();
    try {
      const opportunities = await discoverOpportunities(options);
      spinner.succeed(`发现 ${opportunities.length} 个套利机会！`);
      console.table(opportunities);
    } catch (error) {
      spinner.fail('发现失败: ' + error.message);
    }
  });

// 生成提示词
program
  .command('prompt-cash')
  .description('生成高价值提示词')
  .argument('<需求>', '需求描述')
  .option('-s, --style <style>', '风格(professional,casual,creative)', 'professional')
  .option('-c, --complexity <level>', '复杂度(simple,medium,complex)', 'medium')
  .action(async (requirement, options) => {
    const spinner = ora('正在生成高价值提示词...').start();
    try {
      const prompt = await promptCash(requirement, options);
      spinner.succeed('提示词生成完成！');
      console.log(chalk.green('💰 高价值提示词:'));
      console.log(chalk.cyan(prompt.content));
      console.log(chalk.yellow(`💵 建议售价: $${prompt.suggestedPrice}`));
    } catch (error) {
      spinner.fail('生成失败: ' + error.message);
    }
  });

// 内容套利
program
  .command('content-arbitrage')
  .alias('content')
  .description('AI内容套利模式')
  .option('-p, --platform <platform>', '平台(xiaohongshu,weibo,zhihu)', 'xiaohongshu')
  .option('-c, --count <count>', '生成数量', '10')
  .option('-n, --niche <niche>', '细分领域', '科技数码')
  .action(async (options) => {
    const spinner = ora('正在批量生成内容...').start();
    try {
      const contents = await contentArbitrage(options);
      spinner.succeed(`生成完成！共 ${contents.length} 篇内容`);
      contents.forEach((content, index) => {
        console.log(chalk.green(`\n📝 内容 ${index + 1}:`));
        console.log(chalk.cyan(content.text));
        console.log(chalk.yellow(`💰 预估收益: ¥${content.estimatedEarning}`));
      });
    } catch (error) {
      spinner.fail('生成失败: ' + error.message);
    }
  });

// 数据标注
program
  .command('data-annotation')
  .alias('annotation')
  .description('数据标注众包任务')
  .option('-p, --platforms <platforms>', '平台(scale,remotasks,appen)', 'scale,remotasks')
  .option('-a, --auto', '自动接取任务', false)
  .action(async (options) => {
    const spinner = ora('正在获取标注任务...').start();
    try {
      const tasks = await dataAnnotation(options);
      spinner.succeed(`获取完成！共 ${tasks.length} 个任务`);
      console.table(tasks.map(task => ({
        平台: task.platform,
        任务类型: task.type,
        报酬: `$${task.reward}`,
        预计时间: `${task.estimatedTime}分钟`,
        时薪: `$${task.hourlyRate}`
      })));
    } catch (error) {
      spinner.fail('获取失败: ' + error.message);
    }
  });

// 项目分析器
program
  .command('project-analyzer')
  .alias('analyze')
  .description('AI项目分析和建议')
  .option('-s, --service <service>', '服务类型', 'AI客服')
  .option('-l, --location <location>', '地区', '全国')
  .action(async (options) => {
    const spinner = ora('正在分析AI项目机会...').start();
    try {
      const projects = await projectAnalyzer(options);
      spinner.succeed(`分析完成！找到 ${projects.length} 个项目机会`);
      projects.forEach((project, index) => {
        console.log(chalk.green(`\n🎯 项目机会 ${index + 1}:`));
        console.log(chalk.cyan(`类型: ${project.type}`));
        console.log(chalk.cyan(`需求: ${project.needs}`));
        console.log(chalk.cyan(`市场潜力: ${project.marketPotential}`));
        console.log(chalk.cyan(`技术难度: ${project.techDifficulty}`));
        console.log(chalk.cyan(`预估收益: ¥${project.estimatedEarning}`));
        console.log(chalk.yellow(`💡 建议: ${project.suggestion}`));
      });
    } catch (error) {
      spinner.fail('分析失败: ' + error.message);
    }
  });

// 收入追踪
program
  .command('earning-tracker')
  .alias('earnings')
  .description('收入追踪器')
  .option('-p, --period <period>', '时间周期(day,week,month)', 'month')
  .option('-e, --export <format>', '导出格式(csv,json)', 'csv')
  .action(async (options) => {
    const spinner = ora('正在统计收入...').start();
    try {
      const earnings = await earningTracker(options);
      spinner.succeed('统计完成！');
      console.log(chalk.green(`💰 总收入: ¥${earnings.total}`));
      console.log(chalk.green(`📈 平均日收入: ¥${earnings.dailyAverage}`));
      console.log(chalk.green(`🏆 最高单日: ¥${earnings.maxDay}`));
      
      if (earnings.details) {
        console.log(chalk.yellow('\n📊 收入明细:'));
        console.table(earnings.details);
      }
    } catch (error) {
      spinner.fail('统计失败: ' + error.message);
    }
  });

// 交互模式
program
  .command('interactive')
  .alias('i')
  .description('交互式赚钱模式')
  .action(async () => {
    console.log(chalk.blue.bold('🤖 AI赚钱黑客 - 交互模式\n'));
    
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: '选择赚钱模式:',
        choices: [
          { name: '🎯 发现套利机会', value: 'discover' },
          { name: '💡 生成提示词', value: 'prompt' },
          { name: '📝 内容套利', value: 'content' },
          { name: '🏷️ 数据标注', value: 'annotation' },
          { name: '🔍 项目分析', value: 'analyze' },
          { name: '📊 收入统计', value: 'earnings' }
        ]
      }
    ]);

    // 根据选择执行对应命令
    switch (mode) {
      case 'discover':
        await program.parseAsync(['node', 'ai-hustler', 'discover-opportunities']);
        break;
      case 'prompt':
        const { requirement } = await inquirer.prompt([
          { type: 'input', name: 'requirement', message: '输入提示词需求:' }
        ]);
        await program.parseAsync(['node', 'ai-hustler', 'prompt-cash', requirement]);
        break;
      case 'content':
        await program.parseAsync(['node', 'ai-hustler', 'content-arbitrage']);
        break;
      case 'annotation':
        await program.parseAsync(['node', 'ai-hustler', 'data-annotation']);
        break;
      case 'analyze':
        await program.parseAsync(['node', 'ai-hustler', 'project-analyzer']);
        break;
      case 'earnings':
        await program.parseAsync(['node', 'ai-hustler', 'earning-tracker']);
        break;
    }
  });

// 显示欢迎信息
if (process.argv.length === 2) {
  console.log(chalk.blue.bold('\n🤖 AI赚钱黑客 - AI Hustler'));
  console.log(chalk.white('用AI工具快速变现的终极技能包\n'));
  console.log(chalk.yellow('💡 试试这些命令:'));
  console.log(chalk.cyan('  ai-hustler discover     - 发现套利机会'));
  console.log(chalk.cyan('  ai-hustler prompt-cash  - 生成提示词赚钱'));
  console.log(chalk.cyan('  ai-hustler content      - 内容套利模式'));
  console.log(chalk.cyan('  ai-hustler annotation   - 数据标注任务'));
  console.log(chalk.cyan('  ai-hustler analyze      - AI项目分析'));
  console.log(chalk.cyan('  ai-hustler earnings     - 收入追踪'));
  console.log(chalk.cyan('  ai-hustler interactive  - 交互模式\n'));
}

program.parse();