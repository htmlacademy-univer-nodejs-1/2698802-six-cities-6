import { FileReader } from './file-reader.interface.js';
import { readFileSync } from 'node:fs';
import chalk from 'chalk';
import {
  OfferType,
  HouseType,
  AmenitiesType,
  UserType,
  City,
  CoordinatesType,
  User
} from '../../types/index.js';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(private readonly filename: string) {}

  public read(): void {
    try {
      this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
      console.log(chalk.green(`Успешно прочитан файл: ${this.filename}`));
    } catch (err) {
      console.error(chalk.red(`Ошибка чтения файла: ${this.filename}`));
      throw err;
    }
  }

  public toArray(): OfferType[] {
    if (!this.rawData) {
      throw new Error(chalk.red('Файл не был прочитан. Вызовите метод read() перед toArray()'));
    }

    const lines = this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .slice(1);

    console.log(chalk.blue(`Найдено записей: ${lines.length}`));

    return lines.map((line) => this.parseLine(line));
  }

  private parseLine(line: string): OfferType {
    const [
      title,
      description,
      publishedDateStr,
      cityName,
      previewImage,
      photosStr,
      isPremiumStr,
      isFavoriteStr,
      ratingStr,
      houseTypeStr,
      roomsStr,
      guestsStr,
      priceStr,
      amenitiesStr,
      authorName,
      authorEmail,
      authorAvatar,
      authorPassword,
      authorTypeStr,
      commentsCountStr,
      coordinatesStr,
    ] = line.split('\t');

    const [latitudeStr, longitudeStr] = coordinatesStr.split(',');

    const latitude = Number.parseFloat(latitudeStr);
    const longitude = Number.parseFloat(longitudeStr);

    const author: User = {
      name: authorName?.trim() ?? '',
      email: authorEmail?.trim() ?? '',
      avatar: authorAvatar?.trim() || undefined,
      password: authorPassword?.trim() ?? '',
      type: authorTypeStr?.trim() as UserType,
    };

    return {
      title: title?.trim() ?? '',
      description: description?.trim() ?? '',
      publishedDate: new Date(publishedDateStr),
      city: {
        name: cityName?.trim() ?? '',
        latitude,
        longitude,
      } satisfies City,
      previewImage: previewImage?.trim() ?? '',
      photos: photosStr
        ?.split(';')
        .map((p) => p.trim())
        .filter(Boolean) ?? [],
      isPremium: isPremiumStr?.trim().toLowerCase() === 'true',
      isFavorite: isFavoriteStr?.trim().toLowerCase() === 'true',
      rating: Number.parseFloat(ratingStr),
      type: houseTypeStr?.trim() as HouseType,
      rooms: Number.parseInt(roomsStr, 10),
      guests: Number.parseInt(guestsStr, 10),
      price: Number.parseInt(priceStr, 10),
      amenities: amenitiesStr
        ?.split(';')
        .map((a) => a.trim() as AmenitiesType)
        .filter((a) => a in AmenitiesType) ?? [],
      author,
      commentsCount: Number.parseInt(commentsCountStr, 10),
      coordinates: {
        latitude,
        longitude,
      } satisfies CoordinatesType,
    };
  }
}
