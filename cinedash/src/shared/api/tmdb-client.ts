import axios from "axios";

const apiKey = import.meta.env.VITE_TMDB_API_KEY as string;
const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN as string | undefined;
const baseURL = import.meta.env.VITE_TMDB_BASE_URL as string;

// Use Bearer token (VITE_TMDB_ACCESS_TOKEN) to keep credentials out of URLs.
// Falls back to api_key query param when access token is not configured.
export const tmdbClient = axios.create({
  baseURL,
  headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  params: {
    ...(accessToken ? {} : { api_key: apiKey }),
    language: "pt-BR",
  },
});

tmdbClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(error),
);

export const getImageUrl = (path: string | null, size = "w500") => {
  if (!path) return null;
  const imageBase = import.meta.env.VITE_TMDB_IMAGE_BASE_URL as string;
  return `${imageBase}/${size}${path}`;
};
