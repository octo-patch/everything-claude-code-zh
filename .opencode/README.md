# OpenCode ECC 插件

> ⚠️ 此 README 专门针对 OpenCode 的使用。  
> 如果您通过 npm 安装了 ECC（例如 `npm install opencode-ecc`），请参考根目录下的 README。

面向 OpenCode 的 Everything Claude Code (ECC) 插件 —— 包含智能体（Agents）、命令（Commands）、生命周期钩子（Hooks）和技能（Skills）。

## 安装

## 安装概览

有两种方式可以使用 Everything Claude Code (ECC)：

1. **npm 软件包（推荐大多数用户使用）**  
   通过 npm/bun/yarn 安装，并使用 `ecc-install` CLI 来设置规则和智能体。

2. **直接克隆 / 插件模式**  
   克隆仓库并在其中直接运行 OpenCode。

请在下方选择适合您工作流的方法。

### 选项 1：npm 软件包

```bash
npm install ecc-universal
```

添加到您的 `opencode.json`：

```json
{
  "plugin": ["ecc-universal"]
}
```
安装后，可以使用 `ecc-install` CLI：

```bash
npx ecc-install typescript
```

### 选项 2：直接使用

克隆仓库并在仓库中运行 OpenCode：

```bash
git clone https://github.com/affaan-m/everything-claude-code
cd everything-claude-code
opencode
```

## 功能特性

### 智能体 (Agents) (12)

| 智能体 (Agent) | 描述 |
|-------|-------------|
| planner | 实施计划制定 |
| architect | 系统设计 |
| code-reviewer | 代码审查 |
| security-reviewer | 安全分析 |
| tdd-guide | 测试驱动开发 (TDD) 指南 |
| build-error-resolver | 构建错误修复 |
| e2e-runner | 端到端 (E2E) 测试运行 |
| doc-updater | 文档更新 |
| refactor-cleaner | 废弃代码清理 |
| go-reviewer | Go 代码审查 |
| go-build-resolver | Go 构建错误解决 |
| database-reviewer | 数据库优化 |

### 命令 (Commands) (24)

| 命令 (Command) | 描述 |
|---------|-------------|
| `/plan` | 创建实施计划 |
| `/tdd` | TDD 工作流 |
| `/code-review` | 审查代码变更 |
| `/security` | 安全审查 |
| `/build-fix` | 修复构建错误 |
| `/e2e` | E2E 测试 |
| `/refactor-clean` | 移除废弃代码 |
| `/orchestrate` | 多智能体编排工作流 |
| `/learn` | 提取模式 (Patterns) |
| `/checkpoint` | 保存进度 |
| `/verify` | 验证循环 (Verification Loop) |
| `/eval` | 评测 (Eval) |
| `/update-docs` | 更新文档 |
| `/update-codemaps` | 更新代码映射 (Codemaps) |
| `/test-coverage` | 覆盖率分析 |
| `/setup-pm` | 包管理器设置 |
| `/go-review` | Go 代码审查 |
| `/go-test` | Go TDD |
| `/go-build` | Go 构建修复 |
| `/skill-create` | 生成技能 (Skills) |
| `/instinct-status` | 查看直觉 (Instincts) 状态 |
| `/instinct-import` | 导入直觉 (Instincts) |
| `/instinct-export` | 导出直觉 (Instincts) |
| `/evolve` | 聚类直觉 (Instincts) |
| `/promote` | 晋升项目直觉 (Instincts) |
| `/projects` | 列出已知项目 |

### 插件钩子 (Plugin Hooks)

| 钩子 (Hook) | 事件 | 用途 |
|------|-------|---------|
| Prettier | `file.edited` | 自动格式化 JS/TS |
| TypeScript | `tool.execute.after` | 检查类型错误 |
| console.log | `file.edited` | 警示调试语句 |
| Notification | `session.idle` | 桌面通知 |
| Security | `tool.execute.before` | 检查密钥 (Secrets) |

### 自定义工具 (Custom Tools)

| 工具 (Tool) | 描述 |
|------|-------------|
| run-tests | 运行带有选项的测试套件 |
| check-coverage | 分析测试覆盖率 |
| security-audit | 安全漏洞扫描 |

## 钩子事件映射 (Hook Event Mapping)

OpenCode 的插件系统映射到 Claude Code 钩子：

| Claude Code | OpenCode |
|-------------|----------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

OpenCode 拥有 20 多个 Claude Code 中不可用的额外事件。

## 技能 (Skills)

默认的 OpenCode 配置通过 `instructions` 数组加载了 11 个精选的 ECC 技能 (Skills)：

- coding-standards (编码标准)
- backend-patterns (后端模式)
- frontend-patterns (前端模式)
- frontend-slides (前端幻灯片)
- security-review (安全审查)
- tdd-workflow (TDD 工作流)
- strategic-compact (战略压缩)
- eval-harness (评测框架)
- verification-loop (验证循环)
- api-design (API 设计)
- e2e-testing (E2E 测试)

额外的专业技能存放在 `skills/` 目录中，但为了保持 OpenCode 会话 (Sessions) 精简，默认情况下未加载：

- article-writing (文章撰写)
- content-engine (内容引擎)
- market-research (市场研究)
- investor-materials (投资者材料)
- investor-outreach (投资者触达)

## 配置 (Configuration)

在 `opencode.json` 中的完整配置：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "plugin": ["./.opencode/plugins"],
  "instructions": [
    "skills/tdd-workflow/SKILL.md",
    "skills/security-review/SKILL.md"
  ],
  "agent": { /* 12 个智能体 */ },
  "command": { /* 24 个命令 */ }
}
```

## MiniMax Provider Presets

The bundled `opencode.json` keeps the existing defaults and adds OpenAI-compatible
presets for both MiniMax regions. Set `MINIMAX_API_KEY`, then select one of these
models:

| Region | Model selector                             |
| ------ | ------------------------------------------ |
| Global | `minimax-global-openai/MiniMax-M3.1-Flash` |
| Global | `minimax-global-openai/MiniMax-M3`         |
| Global | `minimax-global-openai/MiniMax-M2.7`       |
| China  | `minimax-cn-openai/MiniMax-M3.1-Flash`     |
| China  | `minimax-cn-openai/MiniMax-M3`             |
| China  | `minimax-cn-openai/MiniMax-M2.7`           |

For the Anthropic-compatible protocol, merge this configuration into
`~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.minimax.io/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "<MINIMAX_API_KEY>",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "1000000",
    "ANTHROPIC_MODEL": "MiniMax-M3.1-Flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "MiniMax-M3.1-Flash",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "MiniMax-M3.1-Flash",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "MiniMax-M3.1-Flash"
  }
}
```

Use `https://api.minimaxi.com/anthropic` as `ANTHROPIC_BASE_URL` for the China
endpoint. Keep the base URL ending in `/anthropic`; compatible clients append
`/v1/messages` to it.

## 许可证 (License)

MIT
