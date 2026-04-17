import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext({
  path: '/',
  navigate: () => {},
})

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => window.location.pathname || '/')

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo(() => {
    const navigate = (to) => {
      if (typeof to !== 'string') return
      if (to === window.location.pathname) return
      window.history.pushState({}, '', to)
      setPath(to)
    }

    return { path, navigate }
  }, [path])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  return useContext(RouterContext)
}

export function Link({ to, children, className, ...props }) {
  const { navigate } = useRouter()

  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented) return
        if (e.button !== 0) return
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        navigate(to)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

export function Route({ path: routePath, children }) {
  const { path } = useRouter()

  if (routePath === path) return children
  return null
}

export function Navigate({ to }) {
  const { navigate } = useRouter()

  useEffect(() => {
    navigate(to)
  }, [navigate, to])

  return null
}
