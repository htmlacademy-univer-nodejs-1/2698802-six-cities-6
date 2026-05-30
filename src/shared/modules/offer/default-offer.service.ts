import { inject, injectable } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CommentService } from '../comment/comment-service.interface.js';
import { FavoriteService } from '../favorite/favorite-service.interface.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.FavoriteService) private readonly favoriteService: FavoriteService,
  ) {}

  private async applyFavoriteFlags(
    offers: DocumentType<OfferEntity>[],
    userId?: string
  ): Promise<DocumentType<OfferEntity>[]> {
    if (!userId) {
      for (const offer of offers) {
        offer.isFavorite = false;
      }
      return offers;
    }

    const favoriteOfferIds = new Set(await this.favoriteService.findOfferIdsByUserId(userId));
    for (const offer of offers) {
      offer.isFavorite = favoriteOfferIds.has(offer.id);
    }
    return offers;
  }

  private async applyFavoriteFlag(
    offer: DocumentType<OfferEntity> | null,
    userId?: string
  ): Promise<DocumentType<OfferEntity> | null> {
    if (!offer) {
      return null;
    }

    if (!userId) {
      offer.isFavorite = false;
      return offer;
    }

    offer.isFavorite = await this.favoriteService.exists(userId, offer.id);
    return offer;
  }

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create({
      ...dto,
      isFavorite: false,
      commentsCount: 0,
    });
    this.logger.info(`New offer created: ${dto.title}`);
    return result;
  }

  public async findById(offerId: string, userId?: string): Promise<DocumentType<OfferEntity> | null> {
    const offer = await this.offerModel.findById(offerId).populate('author').exec();
    return this.applyFavoriteFlag(offer, userId);
  }

  public async find(limit = 60, userId?: string, city?: string): Promise<DocumentType<OfferEntity>[]> {
    const filter = city ? { city } : {};
    const offers = await this.offerModel
      .find(filter)
      .sort({ publishedDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();

    return this.applyFavoriteFlags(offers, userId);
  }

  public async findNew(limit: number, userId?: string): Promise<DocumentType<OfferEntity>[]> {
    const offers = await this.offerModel
      .find()
      .sort({ publishedDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();

    return this.applyFavoriteFlags(offers, userId);
  }

  public async findDiscussed(limit: number, userId?: string): Promise<DocumentType<OfferEntity>[]> {
    const offers = await this.offerModel
      .find()
      .sort({ commentsCount: -1, publishedDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();

    return this.applyFavoriteFlags(offers, userId);
  }

  public async findPremiumByCity(city: string, limit = 3, userId?: string): Promise<DocumentType<OfferEntity>[]> {
    const offers = await this.offerModel
      .find({ city, isPremium: true })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();

    return this.applyFavoriteFlags(offers, userId);
  }

  public async updateById(offerId: string, dto: UpdateOfferDto, userId: string): Promise<DocumentType<OfferEntity> | null> {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      return null;
    }

    if (offer.author.toString() !== userId) {
      return null;
    }

    return this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate('author')
      .exec();
  }

  public async deleteById(offerId: string, userId: string): Promise<boolean> {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) {
      return false;
    }

    if (offer.author.toString() !== userId) {
      return false;
    }

    await this.commentService.deleteByOfferId(offerId);
    await this.favoriteService.deleteByOfferId(offerId);

    const result = await this.offerModel.deleteOne({ _id: offerId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }

  public async findFavorites(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const offerIds = await this.favoriteService.findOfferIdsByUserId(userId);
    if (offerIds.length === 0) {
      return [];
    }

    const offers = await this.offerModel
      .find({ _id: { $in: offerIds } })
      .sort({ publishedDate: -1 })
      .populate('author')
      .exec();

    for (const offer of offers) {
      offer.isFavorite = true;
    }
    return offers;
  }

  public async setFavorite(userId: string, offerId: string, isFavorite: boolean): Promise<boolean> {
    return this.favoriteService.toggle(userId, offerId, isFavorite);
  }

  public async exists(documentId: string): Promise<boolean> {
    return await this.offerModel.exists({ _id: documentId }) !== null;
  }
}
