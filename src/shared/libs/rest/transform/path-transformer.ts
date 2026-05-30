import { inject, injectable } from 'inversify';
import { DEFAULT_STATIC_IMAGES, STATIC_RESOURCE_FIELDS } from './path-transformer.constant.js';
import { Component } from '../../../types/index.js';
import { Logger } from '../../logger/index.js';
import { STATIC_FILES_ROUTE, STATIC_UPLOAD_ROUTE } from '../../../../rest/index.js';
import { getFullServerPath } from '../../../helpers/index.js';
import { Config, RestSchema } from '../../config/index.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@injectable()
export class PathTransformer {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {
    this.logger.info('PathTranformer created!');
  }

  private normalizeFilename(filename: string): string {
    return filename.replace(/^\/+/, '');
  }

  private isExternalUrl(filename: string): boolean {
    return /^https?:\/\//i.test(filename);
  }

  private isStaticResource(filename: string): boolean {
    const normalized = this.normalizeFilename(filename);

    if (DEFAULT_STATIC_IMAGES.includes(normalized)) {
      return true;
    }

    return normalized.startsWith('img/');
  }

  private isStaticProperty(property: string) {
    return STATIC_RESOURCE_FIELDS.includes(property);
  }

  private buildResourcePath(filename: string): string {
    if (this.isExternalUrl(filename)) {
      return filename;
    }

    const normalized = this.normalizeFilename(filename);
    const staticPath = STATIC_FILES_ROUTE;
    const uploadPath = STATIC_UPLOAD_ROUTE;
    const serverHost = this.config.get('HOST');
    const serverPort = this.config.get('PORT');
    const rootPath = this.isStaticResource(normalized) ? staticPath : uploadPath;

    return `${getFullServerPath(serverHost, serverPort)}${rootPath}/${normalized}`;
  }

  public execute(data: Record<string, unknown>): Record<string, unknown> {
    const stack = [data];
    while (stack.length > 0) {
      const current = stack.pop();

      for (const key in current) {
        if (Object.hasOwn(current, key)) {
          const value = current[key];

          if (isObject(value)) {
            stack.push(value);
            continue;
          }

          if (this.isStaticProperty(key) && typeof value === 'string') {
            current[key] = this.buildResourcePath(value);
            continue;
          }

          if (this.isStaticProperty(key) && Array.isArray(value)) {
            current[key] = value.map((item) =>
              typeof item === 'string' ? this.buildResourcePath(item) : item
            );
          }
        }
      }
    }

    return data;
  }
}
