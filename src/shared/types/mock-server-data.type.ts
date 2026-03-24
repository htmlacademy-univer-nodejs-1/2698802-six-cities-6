import { UserType } from './enums/user.type.enum.js';

export type MockServerData = {
  titles: string[];
  descriptions: string[];
  cities: string[];
  previewImages: string[];
  photos: string[];
  amenities: string[];
  authors: {
    name: string;
    email: string;
    avatar?: string;
    password: string;
    type: UserType;
  }[];
};
