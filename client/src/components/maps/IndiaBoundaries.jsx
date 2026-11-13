import { GeoJSON } from "react-leaflet";
import boundaries from "../../data/indiaMapBoundaries.json";

const boundaryStyle = (feature) => {
  const isCountry = feature?.properties?.boundaryType === "country";
  return {
    color: isCountry ? "#f5f8ff" : "#cbd8ec",
    fill: false,
    interactive: false,
    opacity: isCountry ? 0.95 : 0.78,
    weight: isCountry ? 1.7 : 1.1,
  };
};

export default function IndiaBoundaries() {
  return <GeoJSON data={boundaries} style={boundaryStyle} interactive={false} />;
}
