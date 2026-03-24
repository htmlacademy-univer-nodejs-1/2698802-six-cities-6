import dayjs from 'dayjs';
import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerData } from '../../types/mock-server-data.type.js';
import { generateRandomValue, getRandomItem, getRandomItems } from '../../helpers/index.js';

const MIN_PRICE = 5000;
const MAX_PRICE = 100000;

const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 7;

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerData) {}

  public generate(): string {
    const title = getRandomItem(this.mockData.titles);
    const description = getRandomItem(this.mockData.descriptions);
    const city = getRandomItem(this.mockData.cities);
    const previewImage = getRandomItem(this.mockData.previewImages);
    const photos = getRandomItem(this.mockData.photos);

    const isPremium = Math.random() < 0.5;
    const isFavorite = Math.random() < 0.5;
    const rating = generateRandomValue(1, 5, 1);
    const type = 'apartment';
    const rooms = Math.floor(generateRandomValue(1, 5));
    const guests = Math.floor(generateRandomValue(1, 10));
    const price = Math.floor(generateRandomValue(MIN_PRICE, MAX_PRICE));

    const amenities = getRandomItems(this.mockData.amenities).join(';');

    const authorObj = getRandomItem(this.mockData.authors);
    const { name, email, avatar, password, type: authorType } = authorObj;

    const publishedDate = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .format('YYYY-MM-DD');

    const commentsCount = 0;

    const latitude = generateRandomValue(48, 52, 6);
    const longitude = generateRandomValue(2, 14, 6);
    const coordinates = `${latitude},${longitude}`;

    return [
      title,
      description,
      publishedDate,
      city,
      previewImage,
      photos,
      isPremium,
      isFavorite,
      rating,
      type,
      rooms,
      guests,
      price,
      amenities,
      name,
      email,
      avatar ?? '',
      password,
      authorType,
      commentsCount,
      coordinates,
    ].join('\t');
  }
}
