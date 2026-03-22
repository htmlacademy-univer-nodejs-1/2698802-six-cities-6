import { User } from './user.type.js';

export type Comment = {
  text: string;
  publishDate: Date;
  rating: number;
  author: User;
};
