export function AgentAutomationOverview() {
  return (
    <>
      <section className="document-section" aria-labelledby="automation-architecture-title">
        <div className="document-section__label document-section__label--index">02</div>
        <div className="document-section__content">
          <h2 id="automation-architecture-title">系统架构</h2>
          <p>系统由 Web 控制台、Chrome/Edge MV3 扩展、本地 Gateway 和可复用的 Agent Packages 组成。扩展连接电商平台聊天页面，控制台承载任务与运行状态，Gateway 负责把客户端请求接入 Agent Runtime、工具、知识与模型服务。</p>
          <table className="document-table">
            <thead><tr><th>层级</th><th>职责</th></tr></thead>
            <tbody>
              <tr><td>Web 控制台</td><td>发起自然语言任务，管理 Goal、知识目录、消息运行状态与模型配置。</td></tr>
              <tr><td>浏览器扩展</td><td>采集电商平台页面消息，轮询待发送动作，操作页面并回传执行结果。</td></tr>
              <tr><td>本地 Gateway</td><td>提供接入 API，聚合会话，执行回复审查，并连接后台 Goal Worker 与本地状态。</td></tr>
              <tr><td>Agent Packages</td><td>提供 Goal、Policy、Replan、工具、Memory 和 Provider 等可复用能力。</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="document-section" aria-labelledby="commerce-flow-title">
        <div className="document-section__label document-section__label--index">03</div>
        <div className="document-section__content">
          <h2 id="commerce-flow-title">电商平台消息自动化</h2>
          <ol className="document-steps">
            <li><strong>采集与聚合</strong><span>扩展监听电商平台 IM 页面并上报买家消息，Gateway 负责去重、会话聚合与状态保存。</span></li>
            <li><strong>生成草稿</strong><span>消息 Agent 读取当前会话和本地商品知识，生成与问题相关的候选回复。</span></li>
            <li><strong>安全审查</strong><span>审查层先执行硬性规则，再用评分卡判断证据、重复风险和交易敏感度。</span></li>
            <li><strong>受控发送</strong><span>低风险草稿进入发送队列；高风险或证据不足的内容保留为待审草稿。扩展完成填入与发送后，将成功或失败结果回传。</span></li>
          </ol>
        </div>
      </section>

      <section className="document-section" aria-labelledby="goal-runtime-title">
        <div className="document-section__label document-section__label--index">04</div>
        <div className="document-section__content">
          <h2 id="goal-runtime-title">Goal 驱动运行时</h2>
          <p>后台 Worker 消费排队中的 Goal，并支持读取、恢复和取消；每次运行保留目标状态、约束、验证步骤与时间线。</p>
          <ol className="document-steps">
            <li><strong>Router</strong><span>区分通用问答、知识查询、页面提取、复杂任务与浏览器操作。</span></li>
            <li><strong>Planner / Replan</strong><span>生成执行计划，并根据新的 observation 调整步骤、探索替代路径或停止继续迭代。</span></li>
            <li><strong>Action / Tool</strong><span>选择受控工具执行动作，将真实返回结果写回运行状态。</span></li>
            <li><strong>Policy / Output</strong><span>根据约束、收敛信号和验证结果判断完成、失败、取消或继续探索，最后再生成对用户可读的输出。</span></li>
          </ol>
        </div>
      </section>

      <section className="document-section" aria-labelledby="automation-integrations-title">
        <div className="document-section__label document-section__label--index">05</div>
        <div className="document-section__content">
          <h2 id="automation-integrations-title">Provider、工具与本地知识</h2>
          <ul className="document-list">
            <li><strong>模型适配：</strong>Gateway 支持 Mock、OpenAI Compatible、Anthropic Compatible 与自定义 HTTP Provider，可在控制台测试连接并切换模型。</li>
            <li><strong>工具系统：</strong>覆盖知识查询、页面提取、Markdown 编辑、受控文件与命令操作、Web 请求、浏览器自动化、Goal 和持久化任务管理。</li>
            <li><strong>浏览器执行：</strong>除电商平台扩展外，通用浏览器任务还可通过本机 Chrome DevTools Protocol 执行。</li>
            <li><strong>本地知识：</strong>当前以 Markdown/TXT 文件扫描、关键词和文本匹配完成轻量召回；尚未接入向量数据库与 Rerank。</li>
          </ul>
        </div>
      </section>

      <section className="document-section" aria-labelledby="automation-safety-title">
        <div className="document-section__label document-section__label--index">06</div>
        <div className="document-section__content">
          <h2 id="automation-safety-title">安全审查与可控发送</h2>
          <p>自动发送采用保守策略。敏感词、退款与售后承诺、订单修改或取消、账号安全和重复回复等情况会被硬性拦截；只有简短确认、基础问候或评分较高且风险较低的草稿可以进入发送队列。</p>
          <ul className="document-list">
            <li><strong>人工确认：</strong>高风险或证据不足的内容停留在待审状态，由用户批准或拒绝后再决定是否执行。</li>
            <li><strong>真实结果：</strong>扩展完成页面操作后必须回传成功或失败，系统不会仅依据模型文本把动作标记为已完成。</li>
            <li><strong>受控写入：</strong>知识与 Memory 写入需要工具产生提案并经过 Policy 批准，避免把模型声明当作真实持久化结果。</li>
          </ul>
        </div>
      </section>

      <section className="document-section" aria-labelledby="automation-boundaries-title">
        <div className="document-section__label document-section__label--index">07</div>
        <div className="document-section__content">
          <h2 id="automation-boundaries-title">工程验证与当前边界</h2>
          <p>测试覆盖 Agent 路由、规划、Goal、Policy、Replan、消息去重、会话聚合、风险拦截、发送动作、知识工具与 JSON/SQLite Store，验证从页面接入到受控发送的关键路径。</p>
          <dl className="document-definition-list">
            <div><dt>页面依赖</dt><dd>消息识别和自动发送依赖电商平台页面 DOM；页面改版后需要更新选择器与角色识别规则。</dd></div>
            <div><dt>任务调度</dt><dd>持久化任务可以保存并手动重复运行，但计划说明字段尚未接入 Cron 或日历触发器。</dd></div>
            <div><dt>知识召回</dt><dd>当前适合本地轻量知识库；多商品规模扩大后需要引入 Embedding、向量检索与 Rerank。</dd></div>
            <div><dt>服务拆分</dt><dd>当前 Provider、API、消息 Agent 与 Store 仍集中在较大的 Gateway 入口，后续需要继续按边界拆分。</dd></div>
          </dl>
        </div>
      </section>
    </>
  )
}
