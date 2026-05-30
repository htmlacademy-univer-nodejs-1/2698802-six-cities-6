import { Expose, Transform } from 'class-transformer';
import { toIdString } from '../../../helpers/common.js';
import { CITIES } from '../const/city.const.js';

export class OfferPreviewRdo {
  @Expose()
  @Transform(({ obj }) => toIdString(obj._id ?? obj.id))
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public price!: number;

  @Expose()
  public type!: string;

  @Expose()
  public publishedDate!: Date;

  @Expose()
  @Transform(({ obj }) => {
    const cityName = typeof obj.city === 'string' ? obj.city : obj.city?.name;
    return CITIES[cityName] ?? { name: cityName, latitude: 0, longitude: 0 };
  })
  public city!: { name: string; latitude: number; longitude: number };

  @Expose()
  public previewImage!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public commentsCount!: number;
}
