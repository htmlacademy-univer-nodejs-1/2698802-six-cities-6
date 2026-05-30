import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { DocumentExists } from '../../types/index.js';

export interface OfferService extends DocumentExists {
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string, userId?: string): Promise<DocumentType<OfferEntity> | null>;
  updateById(offerId: string, dto: UpdateOfferDto, userId: string): Promise<DocumentType<OfferEntity> | null>;
  deleteById(offerId: string, userId: string): Promise<boolean>;
  find(limit?: number, userId?: string, city?: string): Promise<DocumentType<OfferEntity>[]>;
  findNew(limit: number, userId?: string): Promise<DocumentType<OfferEntity>[]>;
  findDiscussed(limit: number, userId?: string): Promise<DocumentType<OfferEntity>[]>;
  findPremiumByCity(city: string, limit?: number, userId?: string): Promise<DocumentType<OfferEntity>[]>;
  findFavorites(userId: string): Promise<DocumentType<OfferEntity>[]>;
  setFavorite(userId: string, offerId: string, isFavorite: boolean): Promise<boolean>;
}
