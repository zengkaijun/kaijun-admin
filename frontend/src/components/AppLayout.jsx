import { Button, Layout, Menu, Typography } from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../api'

const { Header, Sider, Content } = Layout

function initialChar(user) {
  const name = (user?.name || user?.username || '用').trim()
  return name.slice(0, 1).toUpperCase()
}

export default function AppLayout({ user, onLoggedOut, children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const selected = location.pathname.startsWith('/projects')
    ? 'projects'
    : location.pathname.startsWith('/work-items')
      ? 'work-items'
      : 'home'

  const onLogout = async () => {
    await logout()
    onLoggedOut()
    navigate('/login', { replace: true })
  }

  return (
    <Layout className="app-shell">
      <Sider width={240} theme="dark" className="app-sider">
        <div className="app-brand">
          <span className="app-brand-mark" aria-hidden>
            凯
          </span>
          <span className="app-brand-text">凯俊后台</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selected]}
          items={[
            { key: 'home', label: <Link to="/">总览</Link> },
            { key: 'projects', label: <Link to="/projects">项目</Link> },
            { key: 'work-items', label: <Link to="/work-items">工作项</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <span className="app-user-avatar" aria-hidden>
            {initialChar(user)}
          </span>
          <Typography.Text type="secondary" className="app-user-name">
            {user?.name || user?.username}
          </Typography.Text>
          <Button type="link" className="app-logout" onClick={onLogout}>
            退出
          </Button>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>
    </Layout>
  )
}
