import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { createOffer, getMongoURI } from '../../shared/helpers/index.js';
import { UserService } from '../../shared/modules/user/user-service.interface.js';
import { OfferService } from '../../shared/modules/offer/offer-service.interface.js';
import { DatabaseClient, MongoDatabaseClient } from '../../shared/libs/database-client/index.js';
import { Logger } from '../../shared/libs/logger/index.js';
import { DefaultUserService, UserModel } from '../../shared/modules/user/index.js';
import { DefaultOfferService, OfferModel } from '../../shared/modules/offer/index.js';
import { DefaultCommentService, CommentModel } from '../../shared/modules/comment/index.js';
import { DefaultFavoriteService, FavoriteModel } from '../../shared/modules/favorite/index.js';
import { DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD } from './command.constant.js';
import { OfferType } from '../../shared/types/index.js';
import { ConsoleLogger } from '../../shared/libs/logger/console.logger.js';

export class ImportCommand implements Command {
  private readonly userService: UserService;
  private readonly offerService: OfferService;
  private readonly databaseClient: DatabaseClient;
  private readonly logger: Logger;
  private salt = '';
  private importedOffersCount = 0;

  constructor() {
    this.logger = new ConsoleLogger();
    this.userService = new DefaultUserService(this.logger, UserModel);
    const favoriteService = new DefaultFavoriteService(this.logger, FavoriteModel);
    const commentService = new DefaultCommentService(this.logger, CommentModel, OfferModel);
    this.offerService = new DefaultOfferService(this.logger, OfferModel, commentService, favoriteService);
    this.databaseClient = new MongoDatabaseClient(this.logger);

    this.onImportedLine = this.onImportedLine.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);
  }

  private async onImportedLine(line: string, resolve: () => void): Promise<void> {
    try {
      const offer: OfferType = createOffer(line);

      const user = await this.userService.findOrCreate({
        name: offer.author.name,
        email: offer.author.email,
        avatarPath: offer.author.avatar || '',
        type: offer.author.type,
        password: DEFAULT_USER_PASSWORD,
      }, this.salt);

      await this.offerService.create({
        title: offer.title,
        description: offer.description,
        publishedDate: offer.publishedDate,
        city: offer.city.name,
        previewImage: offer.previewImage,
        photos: offer.photos,
        isPremium: offer.isPremium,
        rating: offer.rating,
        type: offer.type,
        rooms: offer.rooms,
        guests: offer.guests,
        price: offer.price,
        amenities: offer.amenities,
        author: user.id.toString(),
        coordinates: offer.coordinates,
      });

      this.importedOffersCount += 1;
      this.logger.info(`Offer "${offer.title}" imported successfully`);
    } catch (error) {
      this.logger.error('Failed to import offer', error as Error);
    } finally {
      resolve();
    }
  }

  private onCompleteImport(count: number): void {
    this.logger.info(
      `Import completed! Processed: ${count}, imported: ${this.importedOffersCount}.`
    );
    this.databaseClient.disconnect().catch((err) =>
      this.logger.error('Disconnect error', err)
    );
  }

  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename, login, password, host, dbname, salt] = parameters;

    if (!filename) {
      console.error('Error: filename is required for --import command');
      return;
    }

    this.salt = salt || process.env.SALT || '';

    const uri = getMongoURI(
      login || process.env.DB_USER || 'admin',
      password || process.env.DB_PASSWORD || 'test',
      host || process.env.DB_HOST || '127.0.0.1',
      DEFAULT_DB_PORT,
      dbname || process.env.DB_NAME || 'six-cities'
    );

    try {
      await this.databaseClient.connect(uri);
      this.logger.info('Connected to MongoDB for import');

      const fileReader = new TSVFileReader(filename.trim());
      fileReader.on('line', this.onImportedLine);
      fileReader.on('end', this.onCompleteImport);

      await fileReader.read();
    } catch (error) {
      this.logger.error('Import command failed', error as Error);
    }
  }
}
