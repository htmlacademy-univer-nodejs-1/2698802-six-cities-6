import { Location } from '../../types/types';
import { UserRdo } from '../user/user.dto';
import { OfferPreviewRdo } from './offer-preview.rdo';

export class OfferRdo extends OfferPreviewRdo {
  public description!: string;

  public photos!: string[];

  public rooms!: number;

  public guests!: number;

  public amenities!: string[];

  public author!: UserRdo;

  public coordinates!: Location;
}
