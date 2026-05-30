import {inject, injectable} from 'inversify';
import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {HttpError} from '../../libs/rest/index.js';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {OfferService} from './offer-service.interface.js';
import {CreateOfferDto} from './dto/create-offer.dto.js';
import {UpdateOfferDto} from './dto/update-offer.dto.js';
import {fillDTO} from '../../helpers/index.js';
import {OfferRdo} from './rdo/offer.rdo.js';
import {OfferPreviewRdo} from './rdo/offer-preview.rdo.js';
import {
  DEFAULT_DISCUSSED_OFFER_COUNT,
  DEFAULT_NEW_OFFER_COUNT
} from './offer.constant.js';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpMethod,
  PrivateRouteMiddleware,
  UploadFileMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { UploadImageRdo } from './rdo/upload-image.rdo.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);
    this.logger.info('Register routes for OfferController...');

    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.index});
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({
      path: '/premium',
      method: HttpMethod.Get,
      handler: this.premium
    });
    this.addRoute({
      path: '/bundles/new',
      method: HttpMethod.Get,
      handler: this.getNew
    });
    this.addRoute({
      path: '/bundles/discussed',
      method: HttpMethod.Get,
      handler: this.getDiscussed
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId/image',
      method: HttpMethod.Post,
      handler: this.uploadImage,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'image'),
      ]
    });
  }

  public async index(req: Request, res: Response): Promise<void> {
    const limitRaw = req.query.limit;
    const parsedLimit = typeof limitRaw === 'string' ? Number.parseInt(limitRaw, 10) : undefined;
    const limit = parsedLimit !== undefined && !Number.isNaN(parsedLimit) ? parsedLimit : undefined;
    const city = typeof req.query.city === 'string' && req.query.city.length > 0
      ? req.query.city
      : undefined;
    const offers = await this.offerService.find(limit, req.tokenPayload?.id, city);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async premium(req: Request, res: Response): Promise<void> {
    const city = typeof req.query.city === 'string' ? req.query.city : '';
    if (!city) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Query param "city" is required', 'OfferController');
    }

    const offers = await this.offerService.findPremiumByCity(city, undefined, req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferPreviewRdo, offers));
  }

  public async show(req: Request, res: Response): Promise<void> {
    const offerId = req.params.offerId;
    const offer = await this.offerService.findById(offerId, req.tokenPayload?.id);

    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async create(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }
    const dto = req.body as CreateOfferDto;

    dto.author = userId;
    dto.publishedDate = dto.publishedDate ? new Date(dto.publishedDate) : new Date();

    const offer = await this.offerService.create(dto);
    this.created(res, fillDTO(OfferRdo, offer));
  }

  public async update(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }
    const offerId = req.params.offerId;
    const dto = req.body as UpdateOfferDto;

    const updated = await this.offerService.updateById(offerId, dto, userId);
    if (!updated) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden', 'OfferController');
    }

    this.ok(res, fillDTO(OfferRdo, updated));
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }
    const offerId = req.params.offerId;

    const deleted = await this.offerService.deleteById(offerId, userId);
    if (!deleted) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden', 'OfferController');
    }

    res.status(StatusCodes.NO_CONTENT).send();
  }

  public async getNew(req: Request, res: Response) {
    const newOffers = await this.offerService.findNew(DEFAULT_NEW_OFFER_COUNT, req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferRdo, newOffers));
  }

  public async getDiscussed(req: Request, res: Response) {
    const discussedOffers = await this.offerService.findDiscussed(DEFAULT_DISCUSSED_OFFER_COUNT, req.tokenPayload?.id);
    this.ok(res, fillDTO(OfferRdo, discussedOffers));
  }

  public async uploadImage(req: Request, res: Response) {
    const userId = req.tokenPayload?.id;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'OfferController');
    }

    const { offerId } = req.params;
    const updateDto = { previewImage: req.file?.filename };
    const updated = await this.offerService.updateById(offerId, updateDto, userId);

    if (!updated) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Forbidden', 'OfferController');
    }

    this.created(res, fillDTO(UploadImageRdo, { image: updateDto.previewImage }));
  }
}
