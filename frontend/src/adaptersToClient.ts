import { CommentRdo } from './dto/comment/comment.dto';
import { OfferPreviewRdo } from './dto/offer/offer-preview.rdo';
import { OfferRdo } from './dto/offer/offer.dto';
import { UserRdo } from './dto/user/user.dto';
import { CityName, Comment, Offer, OfferPreview, User } from './types/types';

const getOfferId = (offer: { id?: string; _id?: string }): string => offer.id ?? offer._id ?? '';

export const adaptOfferPreviewToClient = (offer: OfferPreviewRdo): OfferPreview => ({
  id: getOfferId(offer),
  title: offer.title,
  previewImage: offer.previewImage,
  isPremium: offer.isPremium,
  isFavorite: offer.isFavorite,
  type: offer.type,
  price: offer.price,
  rating: offer.rating,
  cityName: typeof offer.city === 'string' ? offer.city : offer.city.name,
  location: {
    latitude: offer.city.latitude,
    longitude: offer.city.longitude,
  },
});

export const adaptOfferToClient = (offer: OfferRdo): Offer => ({
  id: getOfferId(offer),
  title: offer.title,
  description: offer.description,
  city: {
    name: offer.city.name,
    location: {
      latitude: offer.city.latitude,
      longitude: offer.city.longitude,
    },
  },
  previewImage: offer.previewImage,
  images: offer.photos,
  isFavorite: offer.isFavorite,
  isPremium: offer.isPremium,
  type: offer.type,
  price: offer.price,
  goods: offer.amenities,
  bedrooms: offer.rooms,
  maxAdults: offer.guests,
  location: offer.coordinates,
  rating: offer.rating,
  host: adaptUserToClient(offer.author),
});

export const adaptCommentToClient = (comment: CommentRdo, index: number): Comment => ({
  id: `${comment.publishDate}-${index}`,
  comment: comment.text,
  date: String(comment.publishDate),
  rating: comment.rating,
  user: adaptUserToClient(comment.author),
});

export const adaptUserToClient = (user: UserRdo): User => ({
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarPath,
  isPro: user.type === 'pro',
});
