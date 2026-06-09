import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router, Route, Switch, Redirect } from 'wouter'
import { LandingPage } from './features/landing'
import { DocsLayout } from './features/docs/layout'
import './styles/index.css'

const _spa = new URLSearchParams(globalThis.location.search)
const _spaPath = _spa.get('p')
if (_spaPath) {
  const _spaQuery = _spa.get('q')
  globalThis.history.replaceState(
    null,
    '',
    import.meta.env.BASE_URL.replace(/\/$/, '') +
    _spaPath +
    (_spaQuery ? '?' + _spaQuery : '') +
    globalThis.location.hash,
  )
}

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router base={routerBase}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/docs/:page?" component={DocsLayout} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  </StrictMode>,
)
