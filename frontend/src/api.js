async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || `请求失败 (${response.status})`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' })
}

export function fetchMe() {
  return request('/api/auth/me')
}

export function listProjects(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const suffix = query.toString() ? `?${query}` : ''
  return request(`/api/projects${suffix}`)
}

export function getProject(id) {
  return request(`/api/projects/${id}`)
}

export function listProjectUpgrades(id) {
  return request(`/api/projects/${id}/upgrades`)
}

export function createProject(payload) {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProject(id, payload) {
  return request(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function listFollowUps(projectId) {
  return request(`/api/projects/${projectId}/followups`)
}

export function createFollowUp(projectId, payload) {
  return request(`/api/projects/${projectId}/followups`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function projectAction(projectId, payload) {
  return request(`/api/projects/${projectId}/actions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchSummary() {
  return request('/api/summary')
}

export function reorderSummary(list, orderedIds) {
  return request('/api/summary/reorder', {
    method: 'POST',
    body: JSON.stringify({
      list,
      ordered_ids: orderedIds,
    }),
  })
}

export function listWorkItems(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const suffix = query.toString() ? `?${query}` : ''
  return request(`/api/work_items${suffix}`)
}

export function getWorkItem(id) {
  return request(`/api/work_items/${id}`)
}

export function createWorkItem(payload) {
  return request('/api/work_items', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateWorkItem(id, payload) {
  return request(`/api/work_items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteWorkItem(id) {
  return request(`/api/work_items/${id}`, { method: 'DELETE' })
}

export function formatValidationError(err) {
  const errors = err?.data?.errors
  if (!errors || typeof errors !== 'object') {
    return err?.message || '请求失败'
  }
  const first = Object.values(errors).flat()[0]
  return first || err.message || '校验失败'
}
