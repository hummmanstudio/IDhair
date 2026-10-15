import { sanityDataset, sanityProjectId, urlForSanityImage } from "./sanity";

const sanityQueryUrl = sanityProjectId
  ? `/sanity-data/query/${sanityDataset}`
  : "";

const regionLabels = {
  seoul: "서울",
  gyeonggi: "경기",
  local: "전국",
  atelier: "아틀리에",
};

const regionOrder = ["seoul", "gyeonggi", "local", "atelier"];

const runQuery = async (query) => {
  const searchParams = new URLSearchParams({ query });
  const response = await fetch(`${sanityQueryUrl}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Sanity salon request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.result;
};

const getSalonImageUrl = (image) => {
  if (!image?.asset?._ref && !image?.asset?._id) return "";

  return urlForSanityImage(image)
    .width(1600)
    .auto("format")
    .fit("crop")
    .url();
};

const localizedText = (store, field, language) =>
  (language === "en" && store[`${field}En`]?.trim()) || store[field] || "";

const toStore = (store, language) => ({
  id: store._id,
  name: localizedText(store, "name", language) || "매장명 없음",
  address: localizedText(store, "address", language),
  phone: store.phone || "",
  hours: localizedText(store, "hours", language),
  off: localizedText(store, "off", language),
  instagramUrl: store.instagramUrl || "",
  reservationUrl: store.reservationUrl || "",
  images: (store.images || [])
    .map(getSalonImageUrl)
    .filter(Boolean),
});

export const fetchSalonRegions = async (language = "ko") => {
  const stores = await runQuery(`
    *[_type == "salonLocation" && (!defined(isHidden) || isHidden != true)]
      | order(order asc, name asc) {
        _id,
        name,
        region,
        address,
        phone,
        hours,
        off,
        nameEn,
        addressEn,
        hoursEn,
        offEn,
        instagramUrl,
        reservationUrl,
        images
      }
  `);

  return regionOrder.map((regionId) => ({
    id: regionId,
    name: regionLabels[regionId],
    stores: stores
      .filter((store) => store.region === regionId)
      .map((store) => toStore(store, language)),
  }));
};
