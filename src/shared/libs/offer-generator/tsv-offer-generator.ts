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
    const amenities = getRandomItems(this.mockData.amenities).join(';');

    const authorObj = getRandomItem(this.mockData.authors);
    const { name: authorName, email: authorEmail, avatar: authorAvatar } = authorObj;

    const publishedDate = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .toISOString();

    return [
      title,
      description,
      publishedDate,
      city,
      previewImage,
      photos,
      amenities,
      authorName,
      authorEmail,
      authorAvatar ?? '',
    ].join('\t');
  }
}
