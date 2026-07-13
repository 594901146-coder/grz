import type { Project } from '../data/projects'

type ProjectArtworkProps = {
  project: Project
  compact?: boolean
}

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
        aria-label="Agent 自动化：本地 Gateway 连接消息接入、Agent 决策与受控执行"
      >
        <span className="workflow-art__label">AGENT AUTOMATION / 02</span>
        <div className="workflow-art__core">LOCAL<br />GATEWAY</div>
        <div className="workflow-art__footer">
          <span>接入</span><i /><span>决策</span><i /><span>执行</span>
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
