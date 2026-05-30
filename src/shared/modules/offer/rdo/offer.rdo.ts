import { Expose, Transform, Type } from 'class-transformer';
import { toIdString } from '../../../helpers/common.js';
import { CITIES } from '../const/city.const.js';
import { UserRdo } from '../../user/rdo/user.rdo.js';

export class OfferRdo {
  @Expose()
  @Transform(({ obj }) => toIdString(obj._id ?? obj.id))
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

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
  public photos!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public rooms!: number;

  @Expose()
  public guests!: number;

  @Expose()
  public price!: number;

  @Expose()
  public amenities!: string[];

  @Expose()
  @Type(() => UserRdo)
  public author!: UserRdo;

  @Expose()
  public commentsCount!: number;

  @Expose()
  public coordinates!: { latitude: number; longitude: number };
}

