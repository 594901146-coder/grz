export type ProjectMetric = {
  value: string
  label: string
}

export type Project = {
  slug: string
  number: string
  title: string
  eyebrow: string
  summary: string
  role: string
  year?: string
  stack: string[]
  cover: string
  tone: 'mist' | 'iris' | 'plum'
  challenge: string
  solution: string
  outcome: string
  metrics?: ProjectMetric[]
  detailKind?: 'agent-team' | 'agent-workflow'
  hideChallenge?: boolean
  isPlaceholder?: boolean
  repository?: string
  demo?: string
}

export const projects: Project[] = [
  {
    slug: 'agent-team',
    number: '01',
    title: 'AgentTeam',
    eyebrow: 'AI 协作 · 全栈工作台',
    summary: '一个本地优先的多 Agent 协作工作台，将 Team、执行 Harness 与 Memory 划分为独立的持久化边界。',
    role: '系统设计 / 全栈开发',
    year: '2026',
    stack: ['FastAPI', 'SQLite / PostgreSQL', 'GraphRAG', 'OpenAI-compatible API'],
    cover: '多 Agent 协作工作台与可追溯执行链路',
    tone: 'mist',
    challenge: '多 Agent 协作既要保留成员身份与角色经验，又要让 Team 配置、运行快照和对话记忆各自保持可追溯、可恢复的边界。',
    solution: '以 Agent、Team、Harness 和 Memory 四个工程对象组织系统；用不可变 Run 快照、数据库队列与租约执行任务，并将执行轨迹与记忆证据持续写入数据库。',
    outcome: '形成从用户消息、Turn、Run 到 AgentExecution、ToolCall 与 Artifact 的完整追溯链路，进程重启后仍可查询、恢复和重试协作任务。',
    detailKind: 'agent-team',
    metrics: [
      { value: '5', label: '预置角色类型' },
      { value: '4', label: '核心工程对象' },
      { value: '2', label: '后台 Worker' },
    ],
  },
  {
    slug: 'agent-workflow-system',
    number: '02',
    title: 'Agent 自动化',
    eyebrow: '',
    summary: '由浏览器扩展、本地 Gateway 与 Goal 运行时组成的电商 IM 自动化系统，覆盖消息采集、知识辅助、安全审查、受控发送与结果回传。',
    role: '系统设计 / 全栈开发',
    stack: ['Next.js', 'Chrome Extension MV3', 'Node.js Gateway', 'pnpm / Turborepo', 'Chrome CDP'],
    cover: '电商平台消息采集、Agent 审查与受控发送闭环',
    tone: 'iris',
    challenge: '将电商平台页面中的买家消息转化为可持续运行的本地自动化流程，同时保证上下文聚合、回复证据与交易风险都能在发送前被检查。',
    solution: '由浏览器扩展接入页面消息，本地 Gateway 完成去重、会话聚合与审查；Goal 运行时负责规划和工具调用，并把低风险动作交回扩展执行，高风险内容留给人工确认。',
    outcome: '已形成从页面消息采集、知识辅助草稿、安全审查到受控发送和结果回传的完整链路，并以测试覆盖消息规范化、风险拦截、Goal 循环和发送动作。',
    detailKind: 'agent-workflow',
  },
  {
    slug: 'meow',
    number: '03',
    title: 'Meow',
    eyebrow: '终端 AI · Coding Agent',
    summary: '基于开源项目，以最少新增代码构建的个人终端 Coding Agent；复用模型适配、Agent Runtime 与终端交互能力，快速形成可持续使用、可扩展的开发工具。',
    role: '开源项目改造 / TypeScript 开发',
    stack: ['TypeScript', 'Node.js', 'Bun', 'Terminal TUI', 'Vitest', 'Biome'],
    cover: 'Meow 终端 Coding Agent 界面',
    tone: 'plum',
    challenge: '希望在终端中获得一个可按个人工作流调整的编程助手，同时避免从零重复搭建模型适配、工具调用和会话管理等 Agent 基础设施。',
    hideChallenge: true,
    solution: '复用开源项目已有的模型适配、Agent Runtime、终端交互和扩展机制，在明确边界上补充个人化命令入口、启动与发布脚本，以及最小持续对话 Agent 示例。',
    outcome: '形成一个可在日常开发中使用的终端 Agent，支持多模型、多种运行模式、会话管理、扩展与 SDK 接入，并保持现有配置和第三方扩展的兼容性。',
  },
]

export const findProject = (slug?: string) => projects.find((project) => project.slug === slug)
