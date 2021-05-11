export const LOCAL_STORAGE_API_KEY = 'dton_api_key';

export const getApiKeyFromLocalStorage = () => {
  return localStorage.getItem(LOCAL_STORAGE_API_KEY);
};

export const saveApiKeyToLocalStorage = (token) => {
  localStorage.setItem(LOCAL_STORAGE_API_KEY, token);
};

export const removeApiKeyFromLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_API_KEY);
};
