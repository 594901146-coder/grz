import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AgentAutomationOverview } from '../components/AgentAutomationOverview'
import { AgentTeamTechnicalOverview } from '../components/AgentTeamTechnicalOverview'
import { findProject, projects } from '../data/projects'
import { NotFoundPage } from './NotFoundPage'

export function ProjectPage() {
  const { slug } = useParams()
  const project = findProject(slug)
  const isAgentTeam = project?.detailKind === 'agent-team'
  const isAgentWorkflow = project?.detailKind === 'agent-workflow'

  useEffect(() => {
    if (project) document.title = `${project.title} | ZD 作品集`
    return () => { document.title = 'ZD | AI 应用开发 / Agent Workflow' }
  }, [project])

  if (!project) return <NotFoundPage />

  const currentIndex = projects.findIndex((item) => item.slug === project.slug)
  const nextProject = projects[(currentIndex + 1) % projects.length]

  return (
    <main className={`project-document project-document--${project.tone}`}>
      <header className="project-document__header">
        <p className="project-document__kicker">PROJECT / {project.number}</p>
        <h1>{project.title}</h1>
        {project.eyebrow && <p className="project-document__category">{project.eyebrow}</p>}
        <dl className={`project-document__meta${project.year ? '' : ' project-document__meta--two'}`}>
          <div><dt>职责</dt><dd>{project.role}</dd></div>
          {project.year && <div><dt>年份</dt><dd>{project.year}</dd></div>}
          <div><dt>技术</dt><dd>{project.stack.join(' · ')}</dd></div>
        </dl>
      </header>

      <article className="project-document__body">
        <section className="document-section" aria-labelledby="overview-title">
          <div className="document-section__label document-section__label--index">01</div>
          <div className="document-section__content">
            <h2 id="overview-title">项目概览</h2>
            <p className="document-section__lead">{project.summary}</p>
          </div>
        </section>

        {!isAgentWorkflow && <section className="document-section" aria-labelledby="challenge-title">
          <div className="document-section__label document-section__label--index">02</div>
          <div className="document-section__content">
            <h2 id="challenge-title">{isAgentTeam ? '让多个专业 Agent 像一个长期协作的团队一样工作' : '需要解决什么'}</h2>
            {isAgentTeam ? (
              <div className="challenge-points">
                <p><strong>可靠执行：</strong>任务进入持久化队列，执行配置会被冻结；系统记录每次调用、工具使用和产物，并支持取消、失败恢复与重试。</p>
                <p><strong>过程可见：</strong>用户能看到谁参与了任务、各成员提出了什么观点、如何交叉审议，以及最终结果采用了哪些意见。</p>
                <p><strong>长期记忆：</strong>系统保存项目事实、团队决策、Agent 经验和历史 Episode，并通过 GraphRAG 检索相关证据，让后续任务延续已有上下文。</p>
              </div>
            ) : <p>{project.challenge}</p>}
          </div>
        </section>}

        {!isAgentTeam && !isAgentWorkflow && <section className="document-section" aria-labelledby="approach-title">
          <div className="document-section__label document-section__label--index">03</div>
          <div className="document-section__content">
            <h2 id="approach-title">实现方式</h2>
            <p>{project.solution}</p>
          </div>
        </section>}

        {isAgentTeam && <AgentTeamTechnicalOverview />}
        {isAgentWorkflow && <AgentAutomationOverview />}

        {!isAgentTeam && !isAgentWorkflow && <section className="document-section" aria-labelledby="outcome-title">
          <div className="document-section__label document-section__label--index">08</div>
          <div className="document-section__content">
            <h2 id="outcome-title">项目产出</h2>
            <p>{project.outcome}</p>
            {project.isPlaceholder && <p className="document-note">示例内容，待替换为真实项目资料。</p>}
          </div>
        </section>}

        {!isAgentTeam && project.metrics?.length ? <section className="document-section" aria-labelledby="facts-title">
          <div className="document-section__label">关键事实</div>
          <div className="document-section__content">
            <h2 id="facts-title">项目数据</h2>
            <dl className="document-metrics">
              {project.metrics.map((metric) => (
                <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>
              ))}
            </dl>
          </div>
        </section> : null}
      </article>

      <nav className="project-next" aria-label="下一项目">
        <span>下一项目</span>
        <Link to={`/projects/${nextProject.slug}`}>{nextProject.number} / {nextProject.title}</Link>
      </nav>
    </main>
  )
}
