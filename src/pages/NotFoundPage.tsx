import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <p>ERROR / 404</p>
      <div className="not-found__number">4<span>○</span>4</div>
      <h1>这一页漂出了轨道。</h1>
      <Link className="project-link" to="/">回到作品列表 <span>↗</span></Link>
    </main>
  )
}
