import { Expose, Transform } from 'class-transformer';
import { toIdString } from '../../../helpers/common.js';
import { DEFAULT_AVATAR_FILE_NAME } from '../user.constant.js';

export class UserRdo {
  @Expose()
  @Transform(({ obj }) => toIdString(obj._id ?? obj.id))
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  @Transform(({ value }) => value || DEFAULT_AVATAR_FILE_NAME)
  public avatarPath!: string;

  @Expose()
  public type!: string;
}
