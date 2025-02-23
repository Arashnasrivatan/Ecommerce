const getLocationDetail = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`,
    {
      method: "GET",
    }
  );

  const data = await response.json();
  return {
    display_name: data.display_name,
    village: data.village,
    city: data.city,
    district: data.district,
    county: data.county,
    state: data.state
  };
};

module.exports = { getFormatedAddress };
