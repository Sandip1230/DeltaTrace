const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY;

export const CARTO_TILE_URL = cartoApiKey
  ? `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoApiKey)}`
  : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
