import { Link, useLocation } from 'react-router-dom'

export function SiteHeader() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="site-header" data-site-header>
      <Link className="site-logo" to="/" aria-label="返回首页">
        ZD<span>®</span>
      </Link>
      <nav className="site-nav" aria-label="主导航">
        {isHome ? (
          <>
            <a href="#work">项目</a>
            <a href="#about">关于</a>
            <a href="#contact">联系</a>
          </>
        ) : (
          <Link to="/">返回项目</Link>
        )}
      </nav>
    </header>
  )
}
