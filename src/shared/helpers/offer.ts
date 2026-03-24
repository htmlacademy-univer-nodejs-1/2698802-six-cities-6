import { OfferType, HouseType, AmenitiesType, UserType, City, CoordinatesType, User } from '../types/index.js';

export function createOffer(offerData: string): OfferType {
  const [
    title,
    description,
    publishedDateStr,
    cityName,
    previewImage,
    photosStr,
    isPremiumStr,
    isFavoriteStr,
    ratingStr,
    houseTypeStr,
    roomsStr,
    guestsStr,
    priceStr,
    amenitiesStr,
    authorName,
    authorEmail,
    authorAvatar,
    authorPassword,
    authorTypeStr,
    commentsCountStr,
    coordinatesStr,
  ] = offerData.split('\t');

  const [latitudeStr, longitudeStr] = coordinatesStr.split(',');

  const latitude = Number.parseFloat(latitudeStr);
  const longitude = Number.parseFloat(longitudeStr);

  const author: User = {
    name: authorName?.trim() ?? '',
    email: authorEmail?.trim() ?? '',
    avatar: authorAvatar?.trim() || undefined,
    password: authorPassword?.trim() ?? '',
    type: authorTypeStr?.trim() as UserType,
  };

  return {
    title: title?.trim() ?? '',
    description: description?.trim() ?? '',
    publishedDate: new Date(publishedDateStr),
    city: {
      name: cityName?.trim() ?? '',
      latitude,
      longitude,
    } satisfies City,
    previewImage: previewImage?.trim() ?? '',
    photos: photosStr
      ?.split(';')
      .map((p) => p.trim())
      .filter(Boolean) ?? [],
    isPremium: isPremiumStr?.trim().toLowerCase() === 'true',
    isFavorite: isFavoriteStr?.trim().toLowerCase() === 'true',
    rating: Number.parseFloat(ratingStr),
    type: houseTypeStr?.trim() as HouseType,
    rooms: Number.parseInt(roomsStr, 10),
    guests: Number.parseInt(guestsStr, 10),
    price: Number.parseInt(priceStr, 10),
    amenities: amenitiesStr
      ?.split(';')
      .map((a) => a.trim() as AmenitiesType)
      .filter((a) => a in AmenitiesType) ?? [],
    author,
    commentsCount: Number.parseInt(commentsCountStr, 10),
    coordinates: {
      latitude,
      longitude,
    } satisfies CoordinatesType,
  };
}
