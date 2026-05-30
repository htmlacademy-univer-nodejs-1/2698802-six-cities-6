import { CreateCommentDto } from './dto/comment/create-comment.dto';
import { CreateOfferDto } from './dto/offer/create-offer.dto';
import { UpdateOfferDto } from './dto/offer/update-offer.dto';
import { Comment, NewOffer, Offer } from './types/types';

const buildPhotos = (previewImage: string, images?: string[]): string[] => {
  if (images && images.length === 6) {
    return images;
  }

  return Array.from({ length: 6 }, () => previewImage);
};

export const adaptCreateOfferToServer = (offer: NewOffer): CreateOfferDto => ({
  title: offer.title,
  description: offer.description,
  publishedDate: new Date().toISOString(),
  city: offer.city.name,
  previewImage: offer.previewImage,
  photos: buildPhotos(offer.previewImage, offer.images),
  isPremium: offer.isPremium,
  rating: 4,
  type: offer.type,
  rooms: offer.bedrooms,
  guests: offer.maxAdults,
  price: offer.price,
  amenities: offer.goods,
  coordinates: offer.location,
});

export const adaptUpdateOfferToServer = (offer: Offer): UpdateOfferDto => ({
  title: offer.title,
  description: offer.description,
  city: offer.city.name,
  previewImage: offer.previewImage,
  photos: buildPhotos(offer.previewImage, offer.images),
  isPremium: offer.isPremium,
  rating: offer.rating,
  type: offer.type,
  rooms: offer.bedrooms,
  guests: offer.maxAdults,
  price: offer.price,
  amenities: offer.goods,
  coordinates: offer.location,
});

export const adaptCreateCommentToServer = (comment: Pick<Comment, 'comment' | 'rating'>): CreateCommentDto => ({
  text: comment.comment,
  rating: comment.rating,
});
