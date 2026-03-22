import { HouseType } from './enums/house.type.enum';
import { AmenitiesType } from './enums/amenities.type.enum';
import { User } from './user.type';
import { City } from './city.type';
import { CoordinatesType } from './coordinates.type';

export type OfferType = {
  title: string;
  description: string;
  publishedDate: Date;
  city: City;
  previewImage: string;
  photos: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HouseType;
  rooms: number;
  guests: number;
  price: number;
  amenities: AmenitiesType[];
  author: User;
  commentsCount: number;
  coordinates: CoordinatesType;
};
