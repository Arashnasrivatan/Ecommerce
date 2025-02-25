const getLocationDetails = async (lat, lng) => {
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
    state: data.state,
  };
};

const isLocationInIran = (lat, lng) => {
  const iranBounds = {
    latMin: 25.0,
    latMax: 39.5,
    lngMin: 44.0,
    lngMax: 63.5,
  };
  return (
    lat >= iranBounds.latMin &&
    lat <= iranBounds.latMax &&
    lng >= iranBounds.lngMin &&
    lng <= iranBounds.lngMax
  );
};

const createPaginationData = (page, limit, totalCount, resource) => ({
  page,
  limit,
  totalPage: Math.ceil(totalCount / limit),
  ["total" + resource]: totalCount,
});

module.exports = { getLocationDetails, isLocationInIran, createPaginationData };
