import type { Project } from '../data/projects'

type ProjectArtworkProps = {
  project: Project
  compact?: boolean
}

const automationSteps = ['采集', '路由', '规划', '审查', '发送', '回传']

export function ProjectArtwork({ project, compact = false }: ProjectArtworkProps) {
  const isAgentTeam = project.slug === 'agent-team'
  const isAgentWorkflow = project.slug === 'agent-workflow-system'

  if (isAgentTeam) {
    return (
      <div className="project-art project-art--image">
        <img src="/projects/agent-team-workbench.png" alt="AgentTeam 工作台界面截图" />
      </div>
    )
  }

  if (isAgentWorkflow) {
    return (
      <div
        className={`project-art project-art--workflow${compact ? ' project-art--compact' : ''}`}
        role="img"
        aria-label="Agent 自动化流程：消息采集、任务路由、目标规划、安全审查、受控发送与结果回传"
      >
        <span className="workflow-art__label">AGENT AUTOMATION / 02</span>
        <div className="workflow-art__core">LOCAL<br />GATEWAY</div>
        <ol className="workflow-art__steps">
          {automationSteps.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>
          ))}
        </ol>
        <div className="workflow-art__footer">
          <span>浏览器扩展</span><i /><span>Goal 运行时</span><i /><span>人工审核</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`project-art project-art--${project.tone}${compact ? ' project-art--compact' : ''}`}
      role="img"
      aria-label={project.cover}
    >
      <div className="project-art__grid" />
      <div className="project-art__orb project-art__orb--one" />
      <div className="project-art__orb project-art__orb--two" />
      <div className="project-art__window">
        <span className="project-art__window-label">PROJECT / {project.number}</span>
        <span className="project-art__window-line" />
        <span className="project-art__window-line project-art__window-line--short" />
      </div>
      <span className="project-art__index">{project.number}</span>
      <span className="project-art__caption">{project.title}</span>
    </div>
  )
}
