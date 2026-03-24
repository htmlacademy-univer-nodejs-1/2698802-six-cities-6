import EventEmitter from 'node:events';
import { createReadStream } from 'node:fs';
import { FileReader } from './file-reader.interface.js';
import chalk from 'chalk';
import { OfferType } from '../../types/index.js';
import { createOffer } from '../../helpers/offer.js';

const CHUNK_SIZE = 16384; // 16KB

export class TSVFileReader extends EventEmitter implements FileReader {
  private rawData = '';

  constructor(private readonly filename: string) {
    super();
  }

  public async read(): Promise<void> {
    try {
      const readStream = createReadStream(this.filename, {
        highWaterMark: CHUNK_SIZE,
        encoding: 'utf-8',
      });

      let remainingData = '';
      let nextLinePosition = -1;
      let importedRowCount = 0;
      let isFirstLine = true;

      for await (const chunk of readStream) {
        remainingData += chunk.toString();

        while ((nextLinePosition = remainingData.indexOf('\n')) >= 0) {
          const completeRow = remainingData.slice(0, nextLinePosition + 1);
          remainingData = remainingData.slice(++nextLinePosition);

          if (isFirstLine) {
            isFirstLine = false;
            continue;
          }

          importedRowCount++;
          this.emit('line', completeRow);
        }
      }

      console.log(chalk.green(`Успешно прочитан файл: ${this.filename}`));
      console.log(chalk.blue(`Импортировано строк: ${importedRowCount}`));
      this.emit('end', importedRowCount);
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

    return lines.map((line) => createOffer(line));
  }
}
