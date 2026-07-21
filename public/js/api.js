/* API wrapper — all calls go through here */
const api = {
  async request(method, url, body) {
    const opts = { method, credentials: 'same-origin' };
    if (body) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) { location.href = '/login'; return; }
      throw new Error(data.error || `Erro ${res.status}`);
    }
    return data;
  },

  get: (url) => api.request('GET', url),
  post: (url, body) => api.request('POST', url, body),
  put:   (url, body) => api.request('PUT',   url, body),
  patch: (url, body) => api.request('PATCH', url, body),
  del:   (url)       => api.request('DELETE', url),

  async upload(url, formData) {
    const res = await fetch(url, { method: 'POST', credentials: 'same-origin', body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
    return data;
  }
};
