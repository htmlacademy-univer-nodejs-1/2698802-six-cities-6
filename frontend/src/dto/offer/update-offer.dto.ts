import { CityName, Location, Type } from '../../types/types';

export class UpdateOfferDto {
  public title?: string;

  public description?: string;

  public publishedDate?: string;

  public city?: CityName;

  public previewImage?: string;

  public photos?: string[];

  public isPremium?: boolean;

  public rating?: number;

  public type?: Type;

  public rooms?: number;

  public guests?: number;

  public price?: number;

  public amenities?: string[];

  public coordinates?: Location;
}
