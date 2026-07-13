import { Injectable } from '@nestjs/common';
import { DocumentRenderer } from '../abstractions/document-renderer.interface';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as handlebars from 'handlebars';
import * as fs from 'fs-extra';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class WeasyPrintRendererService implements DocumentRenderer {
  async render(templateName: string, data: any, language: string = 'it'): Promise<Buffer> {
    const templatePath = path.join(
      process.cwd(),
      `src/features/documents/templates/${templateName}_${language}.html`,
    );

    // Локальная папка для временных файлов
    const tempDir = path.join(process.cwd(), 'tmp');
    await fs.ensureDir(tempDir);

    let htmlContent = `<html><body><h1>Atena School Document Mock</h1><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;

    if (await fs.pathExists(templatePath)) {
      const htmlTemplate = await fs.readFile(templatePath, 'utf-8');
      const compiled = handlebars.compile(htmlTemplate);
      htmlContent = compiled(data);
    } else {
      console.warn(`[PDF WARNING]: Шаблон ${templateName}_${language}.html не найден. Будет сгенерирован плейсхолдер.`);
    }

    const tempHtmlPath = path.join(tempDir, `${templateName}_${Date.now()}.html`);
    const tempPdfPath = path.join(tempDir, `${templateName}_${Date.now()}.pdf`);

    try {
      await fs.writeFile(tempHtmlPath, htmlContent, 'utf-8');

      // Попытка запустить WeasyPrint CLI
      const command = `export DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib && weasyprint "${tempHtmlPath}" "${tempPdfPath}"`;
      await execAsync(command);

      const pdfBuffer = await fs.readFile(tempPdfPath);
      return pdfBuffer;
    } catch (error) {
      console.warn('[PDF WARNING]: Не удалось запустить WeasyPrint. Возвращаем плейсхолдер PDF (HTML контент).');
      // В случае отсутствия WeasyPrint возвращаем HTML контент в виде буфера в целях тестирования
      return Buffer.from(htmlContent, 'utf-8');
    } finally {
      // Очистка временных файлов
      await fs.remove(tempHtmlPath).catch(() => {});
      await fs.remove(tempPdfPath).catch(() => {});
    }
  }
}
