export function AgentTeamTechnicalOverview() {
  return (
    <>
      <section className="document-section" aria-labelledby="agent-team-architecture-title">
        <div className="document-section__label document-section__label--index">03</div>
        <div className="document-section__content">
          <h2 id="agent-team-architecture-title">总体架构</h2>
          <p>Web 工作台负责 Team 编排、会话和状态展示。FastAPI API 管理两个后台 Worker：一个领取并执行 Run，另一个异步更新知识图谱投影；模型服务与工具注册表位于 Harness 边界之外，通过统一接口调用。</p>
          <figure className="architecture-figure">
            <img
              src="/projects/agent-team-architecture.png"
              alt="AgentTeam 总体架构图：用户经 Web 工作台和 FastAPI API 进入协作领域；Agent、Team 与 Conversation 生成不可变 Run 快照，经数据库队列和运行时调度连接模型、工具、执行产物与 Memory Harness，最终持久化至 SQLite 或 PostgreSQL。"
            />
            <figcaption>
              <span>AgentTeam 总体架构</span>
              <a href="/projects/agent-team-architecture.png" target="_blank" rel="noreferrer">查看原图</a>
            </figcaption>
          </figure>
          <p>系统把身份、协作配置、执行与记忆分为独立的持久化边界。调整 Team 不会改写 Agent 身份，已经创建的 Run 也不会读取后续发布的新配置。</p>
          <table className="document-table">
            <thead><tr><th>对象</th><th>职责</th></tr></thead>
            <tbody>
              <tr><td>Agent</td><td>保存稳定身份、能力、基础 Prompt 与角色经验，可跨 Team 延续历史。</td></tr>
              <tr><td>Team</td><td>保存成员组合、版本与协作协议，分别维护 active graph 和 draft graph。</td></tr>
              <tr><td>Harness</td><td>将请求转换为可执行、可追溯、可恢复的 Run，并负责调度与产物持久化。</td></tr>
              <tr><td>Memory</td><td>从会话与 Artifact 沉淀证据，提供长期上下文与 GraphRAG 投影。</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="document-section" aria-labelledby="agent-team-harness-title">
        <div className="document-section__label document-section__label--index">04</div>
        <div className="document-section__content">
          <h2 id="agent-team-harness-title">Harness 工程</h2>
          <p>API 创建 Task 和 Run 时，将 active graph、Agent 快照、Prompt 层、有效工具、模型标识、节点超时和会话锚点写入 <code>Run.execution_spec_json</code>。Runtime 只读取这份不可变快照，Prompt 按“Agent 基础 Prompt、Team 覆盖、当前目标、用户输入与上游 Artifact、知识上下文”的顺序组装。</p>
          <ul className="document-list">
            <li><strong>队列与租约：</strong>FastAPI lifespan 启动 DatabaseRunWorker，RuntimeLease 保证同一数据库只有一个 Worker 领取任务，并按创建时间 FIFO 处理 queued Run。</li>
            <li><strong>外部边界：</strong>模型与工具通过统一接口接入。Harness 仅使用工具注册表、Agent 能力和 Team 节点权限三者的交集。</li>
            <li><strong>持久化产物：</strong>每个步骤创建 AgentExecution，工具调用通过 <code>agent_execution_id</code> 关联 ToolCall，输出标准化为 AgentArtifact，最终 Markdown 只从持久化 Artifact 合成。</li>
          </ul>
        </div>
      </section>

      <section className="document-section" aria-labelledby="agent-team-memory-title">
        <div className="document-section__label document-section__label--index">05</div>
        <div className="document-section__content">
          <h2 id="agent-team-memory-title">Memory</h2>
          <ul className="document-list">
            <li><strong>分层记忆：</strong>工作上下文只服务当前调用；MemoryEpisode 记录一次 Turn；MemoryItem 按项目、Team 和 Agent 作用域保存事实、偏好、约束、决策与经验。</li>
            <li><strong>GraphRAG 投影：</strong>Memory 与 DocumentChunk 被投影为实体、关系、社区和证据链接。GraphIndexWorker 通过数据库租约异步更新，原始事实仍由 Memory 和知识库实体持有。</li>
            <li><strong>检索与回退：</strong>运行时优先检索 GraphRAG；图中没有可用证据或索引未完成时，回退到 MemoryItem 与 MemoryEpisode 组成的 Memory Pack。</li>
            <li><strong>本地优先：</strong>SQLite 可承担默认数据库队列；PostgreSQL 可承载 GraphRAG 表和租约，无需 Redis、Celery 或 Neo4j 双写。</li>
          </ul>
        </div>
      </section>

      <section className="document-section" aria-labelledby="agent-team-execution-title">
        <div className="document-section__label document-section__label--index">06</div>
        <div className="document-section__content">
          <h2 id="agent-team-execution-title">执行与恢复</h2>
          <ol className="document-steps">
            <li><strong>排队与领取</strong><span>DatabaseRunWorker 通过数据库队列与 RuntimeLease 按创建顺序 FIFO 领取 queued Run；当前 Run 与就绪节点采用串行调度。</span></li>
            <li><strong>执行与溯源</strong><span>用户消息定位 Turn，Turn 定位 Run，Run 再定位每一次 AgentExecution、ToolCall 和 Artifact，最终 Deliverable 可追到成员的输入和输出。</span></li>
            <li><strong>取消与恢复</strong><span>queued Run 可立即取消，running Run 在节点边界响应取消；Worker 重启后保留 queued Run，并将遗留运行标记为 interrupted。</span></li>
            <li><strong>从快照重试</strong><span>失败或中断的轮次可从原快照重试；模型瞬时错误最多重试两次，节点超时随 Run 一同冻结。</span></li>
          </ol>
        </div>
      </section>

      <section className="document-section" aria-labelledby="agent-team-agent-title">
        <div className="document-section__label document-section__label--index">07</div>
        <div className="document-section__content">
          <h2 id="agent-team-agent-title">单个 Agent 的能力边界</h2>
          <p><code>AgentProfile</code> 是成员身份的唯一来源，包含代号、角色类型、基础 Prompt、工具能力、激活标签、启停状态和运行状态。Team 节点只引用 <code>agent_id</code>，因此同一个 Agent 可以跨 Team 保留执行记录和角色经验。</p>
          <ul className="document-list">
            <li><strong>能力收敛：</strong>Team 可以收窄场景职责与工具权限，但无法扩大 Agent 实体未声明的能力。</li>
            <li><strong>状态归属：</strong>Worker 领取步骤时将成员标记为 busy；结束、失败、取消或中断时释放状态，成员页无需从前端会话推测运行情况。</li>
            <li><strong>历史兼容：</strong>软禁用会阻止 Agent 加入新 Team 和新 Run，但不会删除历史引用；旧消息、Artifact 和 Memory 仍可定位到原身份。</li>
          </ul>
        </div>
      </section>

      <section className="document-section" aria-labelledby="agent-team-collaboration-title">
        <div className="document-section__label document-section__label--index">08</div>
        <div className="document-section__content">
          <h2 id="agent-team-collaboration-title">Team 协作的设计</h2>
          <p><code>AgentTeam</code> 保存稳定身份，<code>WorkflowGraph</code> 保存带版本的协作配置。Team 分别指向 active graph 和 draft graph：编排助手修改 draft，用户确认后发布并切换 active 版本；历史 Run 保留自己的快照，不受新版本影响。</p>
          <ul className="document-list">
            <li><strong>成员选择：</strong>每个 Team 必须且只包含一位 ATLAS，总人数不超过 12。ATLAS 每轮依据任务、角色简介和 <code>activation_tags</code> 选择最多四位专业成员，实际参与者被写入消息元数据、Run checkpoint 与 MemoryEpisode。</li>
            <li><strong>图的职责：</strong>节点保存 <code>agent_id</code>、场景职责、Prompt 覆盖、工具权限子集和激活标签；<code>collaboration_links</code> 只描述优先协作对象，不表示 Scheduler 的执行顺序。</li>
          </ul>
          <dl className="document-definition-list">
            <div><dt>协作任务</dt><dd>ATLAS 整理共同问题，专业 Agent 先形成独立意见，再读取同伴初稿并交叉审议；ATLAS 最终综合取舍、风险与行动计划。</dd></div>
            <div><dt>圆桌讨论</dt><dd>ATLAS 按议题选择成员，专业 Agent 轮换发言，再梳理共识、分歧和开放问题。用户可在运行中追加消息，后续成员会先读取最新会话记录。</dd></div>
          </dl>
        </div>
      </section>
    </>
  )
}
