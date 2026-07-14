import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BlurText from '../components/reactbits/BlurText/BlurText'
import Magnet from '../components/reactbits/Magnet/Magnet'
import ShinyText from '../components/reactbits/ShinyText/ShinyText'
import SpotlightCard from '../components/reactbits/SpotlightCard/SpotlightCard'
import { CopyEmail } from '../components/CopyEmail'
import { ProjectArtwork } from '../components/ProjectArtwork'
import { projects } from '../data/projects'
import HeroScene, { type HeroSceneHandle } from '../components/HeroScene/HeroScene'

gsap.registerPlugin(ScrollTrigger)

const heroStars = [
  { left: '6%', top: '22%', size: 1, duration: 5.4, delay: 1.1 },
  { left: '18%', top: '68%', size: 1.5, duration: 4.8, delay: 2.6 },
  { left: '31%', top: '14%', size: 1, duration: 6.2, delay: 3.4 },
  { left: '44%', top: '72%', size: 2, duration: 5.7, delay: 0.8 },
  { left: '57%', top: '34%', size: 1, duration: 4.6, delay: 1.9 },
  { left: '70%', top: '10%', size: 1.5, duration: 6.5, delay: 4.1 },
  { left: '83%', top: '64%', size: 1, duration: 5.2, delay: 2.2 },
  { left: '94%', top: '28%', size: 2, duration: 6, delay: 5 },
  { left: '12%', top: '45%', size: 1, duration: 4.9, delay: 3.1 },
  { left: '38%', top: '50%', size: 1.5, duration: 5.8, delay: 1.3 },
  { left: '65%', top: '58%', size: 1, duration: 6.4, delay: 4.6 },
  { left: '88%', top: '76%', size: 2, duration: 5.5, delay: 2.8 },
] as const

export function HomePage() {
  const page = useRef<HTMLElement>(null)
  const heroScene = useRef<HeroSceneHandle>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add({
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 900px)',
    }, (context) => {
      const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean }

      if (motion) {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro
          .from('[data-hero-scene]', { opacity: 0, scale: 1.025, duration: 1.15 })
          .from('[data-hero-line]', { yPercent: 115, duration: 0.72, stagger: 0.07 }, 0.72)
          .from('[data-hero-meta]', { y: 16, opacity: 0, duration: 0.5, stagger: 0.07 }, 0.92)
          .from('[data-scroll-cue]', { opacity: 0, y: -10, duration: 0.42 }, 1.08)

        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.from(element, {
            y: 50,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 86%', once: true },
          })
        })
      }

      if (motion && desktop) {
        gsap.to('[data-hero-content]', {
          opacity: 0,
          y: -30,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: '35% top', end: 'bottom top', scrub: true },
        })

        gsap.utils.toArray<HTMLElement>('[data-project]').forEach((section) => {
          const art = section.querySelector('[data-project-art]')
          const copy = section.querySelector('[data-project-copy]')
          const number = section.querySelector('[data-project-number]')
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              end: 'bottom 28%',
              scrub: 0.65,
            },
          })
          tl.fromTo(art, { scale: 0.9, y: 70 }, { scale: 1, y: -24, ease: 'none' }, 0)
            .fromTo(copy, { y: 55, opacity: 0.3 }, { y: -12, opacity: 1, ease: 'none' }, 0)
            .fromTo(number, { x: -36, opacity: 0.15 }, { x: 18, opacity: 0.8, ease: 'none' }, 0)
        })
      }

    })

    return () => mm.revert()
  }, { scope: page })

  return (
    <main ref={page}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-scene-layer" data-hero-scene aria-hidden="true">
          <HeroScene
            ref={heroScene}
            accentColor="#c4b5fd"
            quality="auto"
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="hero-stars" aria-hidden="true">
          {heroStars.map((star, index) => (
            <i
              className={star.size === 2 ? 'hero-star hero-star--large' : 'hero-star'}
              key={`${star.left}-${star.top}`}
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDuration: `${star.duration}s`,
                animationDelay: `-${star.delay}s`,
              }}
              data-star-index={index + 1}
            />
          ))}
        </div>
        <div className="hero-statement" aria-hidden="true">
          <ShinyText
            text="Zero Doubt, Just"
            segments={[
              { text: 'Zero', className: 'hero-statement__word hero-statement__word--back' },
              { text: 'Doubt,', className: 'hero-statement__word hero-statement__word--front' },
              { text: 'Just', className: 'hero-statement__word hero-statement__word--middle' },
            ]}
            className="hero-statement__text"
            color="#d9d5e4"
            shineColor="#ffffff"
            speed={5.5}
            delay={5}
            spread={118}
            direction="left"
            disabled={reducedMotion}
          />
        </div>
        <div className="hero-layout" data-hero-content>
          <p className="hero-kicker" data-hero-meta>ZD / AI APPLICATION ENGINEERING / 2026</p>
          <div className="hero-heading-wrap">
            <h1 className="hero-headline" id="hero-title">
              <span className="hero-headline__mask"><span data-hero-line>AI 应用开发 /</span></span>
              <span className="hero-headline__mask"><span data-hero-line>Agent Workflow</span></span>
            </h1>
            <BlurText
              text="Harness · Graph RAG · 可控执行"
              delay={70}
              stepDuration={0.28}
              direction="bottom"
              className="hero-role"
            />
          </div>
          <a className="scroll-cue" data-scroll-cue href="#work">
            <span>向下探索</span><i />
          </a>
        </div>
      </section>

      <section className="work" id="work" aria-labelledby="work-title">
        <header className="section-heading" data-reveal>
          <p>PERSONAL PROJECTS / {String(projects.length).padStart(2, '0')}</p>
          <h2 id="work-title">个人项目</h2>
          <span>两个真实项目，呈现 Agent 协作、工具执行与风险控制的工程实践。</span>
        </header>

        <div className="project-list">
          {projects.map((project) => (
            <article className={`project-section project-section--${project.tone}`} data-project key={project.slug}>
              <span className="project-number" data-project-number aria-hidden="true">{project.number}</span>
              <div className="project-visual" data-project-art>
                <SpotlightCard className="project-card" spotlightColor="rgba(196, 181, 253, 0.22)">
                  <Link to={`/projects/${project.slug}`} aria-label={`查看 ${project.title} 项目详情`}>
                    <ProjectArtwork project={project} />
                  </Link>
                </SpotlightCard>
              </div>
              <div className="project-copy" data-project-copy>
                {project.eyebrow && <p className="project-eyebrow">{project.eyebrow}</p>}
                <h3>{project.title}</h3>
                <p className="project-summary">{project.summary}</p>
                <ul className="tag-list" aria-label="使用技术">
                  {project.stack.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <Magnet padding={50} magnetStrength={7}>
                  <Link className="project-link" to={`/projects/${project.slug}`}>
                    查看项目 <span aria-hidden="true">↗</span>
                  </Link>
                </Magnet>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-index" data-reveal>ENGINEERING FOCUS / 04</div>
        <div className="about-copy" data-reveal>
          <p className="section-label">工程落地与系统整合</p>
          <h2>让 Agent Workflow<em>在真实业务中跑起来。</em></h2>
          <p>持续进行 Agent Workflow 的工程实践，关注系统整合、任务闭环、执行可靠性与风险控制；从真实业务问题出发，快速迭代可落地的解决方案。</p>
        </div>
        <div className="capabilities" data-reveal>
          <div><span>01</span><p>Agent Workflow 设计</p></div>
          <div><span>02</span><p>Harness</p></div>
          <div><span>03</span><p>Graph RAG</p></div>
          <div><span>04</span><p>执行可靠性与风险控制</p></div>
        </div>
      </section>

      <footer className="contact" id="contact">
        <h2 data-reveal>Thanks for<br /><span>watching!</span></h2>
        <CopyEmail />
        <div className="footer-meta">
          <span>© 2026 ZD</span>
          <span>AI APPLICATION / AGENT WORKFLOW</span>
        </div>
      </footer>
    </main>
  )
}
