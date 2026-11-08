import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { fetchMe } from './api'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectFormPage from './pages/ProjectFormPage'
import ProjectListPage from './pages/ProjectListPage'
import WorkItemListPage from './pages/WorkItemListPage'
import { appTheme } from './theme'

function Protected({ user, onLoggedOut, children }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return (
    <AppLayout user={user} onLoggedOut={onLoggedOut}>
      {children}
    </AppLayout>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchMe()
      .then((data) => {
        if (!cancelled) {
          setUser(data.user)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBooting(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (booting) {
    return (
      <ConfigProvider locale={zhCN} theme={appTheme}>
        <div className="boot-screen">
          <Spin size="large" tip="加载中…" />
        </div>
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider locale={zhCN} theme={appTheme}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLoggedIn={setUser} />
              )
            }
          />
          <Route
            path="/"
            element={
              <Protected user={user} onLoggedOut={() => setUser(null)}>
                <HomePage user={user} />
              </Protected>
            }
          />
          <Route
            path="/projects"
            element={
              <Protected user={user} onLoggedOut={() => setUser(null)}>
                <ProjectListPage />
              </Protected>
            }
          />
          <Route
            path="/projects/new"
            element={
              <Protected user={user} onLoggedOut={() => setUser(null)}>
                <ProjectFormPage />
              </Protected>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <Protected user={user} onLoggedOut={() => setUser(null)}>
                <ProjectDetailPage />
              </Protected>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <Protected user={user} onLoggedOut={() => setUser(null)}>
                <ProjectFormPage />
              </Protected>
            }
          />
          <Route
            path="/work-items"
            element={
              <Protected user={user} onLoggedOut={() => setUser(null)}>
                <WorkItemListPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
