import { RouterProvider, Route } from './router.jsx'
import Landing from './pages/Landing.jsx'
import Demo from './pages/Demo.jsx'

function App() {
  return (
    <RouterProvider>
      <Route path="/">
        <Landing />
      </Route>
      <Route path="/demo">
        <Demo />
      </Route>
    </RouterProvider>
  )
}

export default App
