import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL,
});

export const createEvent = () => api.post("/events");

export const uploadImages = (eventId, formData) =>
  api.post(`/events/${eventId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const searchImages = (eventId, formData, page = 1, size = 20) =>
  api.post(`/events/${eventId}/search?page=${page}&size=${size}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


export const getEventStatus = (eventId) => api.get(`/events/${eventId}/status`);

export const downloadAllImages = (eventId) => {
  window.open(`${baseURL}/events/${eventId}/download`, "_blank");
};

export const downloadSingleImage = async (url, filename = "photo.jpg") => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
};

export default api;
