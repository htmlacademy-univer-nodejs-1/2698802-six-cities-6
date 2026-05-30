import { CityName, Type } from '../../types/types';

export type CityRdo = {
  name: CityName;
  latitude: number;
  longitude: number;
};

export class OfferPreviewRdo {
  public id!: string;

  public _id?: string;

  public title!: string;

  public publishedDate!: string;

  public city!: CityRdo;

  public previewImage!: string;

  public isPremium!: boolean;

  public isFavorite!: boolean;

  public type!: Type;

  public price!: number;

  public rating!: number;

  public commentsCount!: number;
}
