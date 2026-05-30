import { UserType } from '../../const';

export class UserRdo {
  public id!: string;

  public name!: string;

  public email!: string;

  public avatarPath!: string;

  public type!: UserType;
}

export class LoggedUserRdo {
  public email!: string;

  public token!: string;
}
