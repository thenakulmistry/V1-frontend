import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token is already being refreshed, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token available, logout
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent('auth-error-logout'));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/public/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.accessToken;
        localStorage.setItem('authToken', newAccessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh token failed, logout
        window.dispatchEvent(new CustomEvent('auth-error-logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Add an event listener in a central place (like App.jsx or main.jsx)
// to handle the logout event dispatched from the interceptor.
// Example for App.jsx:
// useEffect(() => {
//   const handleLogout = () => {
//     logout(); // Assuming logout is available from useAuth
//   };
//   window.addEventListener('auth-error-logout', handleLogout);
//   return () => {
//     window.removeEventListener('auth-error-logout', handleLogout);
//   };
// }, [logout]);


export default apiClient;