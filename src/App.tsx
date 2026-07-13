import { useLocation } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import { PageTransition } from './components/PageTransition'
import { ScrollToTop } from './components/ScrollToTop'
import { SiteHeader } from './components/SiteHeader'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectPage } from './pages/ProjectPage'

export default function App() {
  const location = useLocation()

  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <SiteHeader />
      <ScrollToTop />
      <div id="main-content">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <PageTransition routeKey={location.pathname} />
    </>
  )
}
