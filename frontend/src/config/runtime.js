const trimTrailingSlash = (value) => value.replace(/\/$/, '');

const getBrowserOrigin = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.origin;
};

const getBrowserWebSocketOrigin = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

const defaultApiBaseUrl = import.meta.env.PROD
  ? getBrowserOrigin()
  : 'http://127.0.0.1:8000';

const defaultWsBaseUrl = import.meta.env.PROD
  ? getBrowserWebSocketOrigin()
  : 'ws://127.0.0.1:8000';

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    defaultApiBaseUrl
);

export const WS_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_WS_BASE_URL ||
    defaultWsBaseUrl
);
