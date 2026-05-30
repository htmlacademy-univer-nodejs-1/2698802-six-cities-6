import { UserRdo } from '../user/user.dto';

export class CommentRdo {
  public id!: string;

  public text!: string;

  public publishDate!: Date;

  public rating!: number;

  public author!: UserRdo;
}
