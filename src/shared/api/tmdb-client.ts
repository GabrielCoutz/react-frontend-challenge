import axios from "axios";

const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN as string;
const baseURL = import.meta.env.VITE_TMDB_BASE_URL as string;

export const tmdbClient = axios.create({
  baseURL,
  headers: { Authorization: `Bearer ${accessToken}` },
  params: { language: "pt-BR" },
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
