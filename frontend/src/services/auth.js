import api, { setToken, clearToken, getToken } from './api';

export const loginWithGoogle = async (credential) => {
  const { data } = await api.post('/auth/google', { credential });
  if (data?.token) setToken(data.token);
  return data.user;
};

export const fetchMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

export const logout = () => clearToken();

export const hasToken = () => !!getToken();
