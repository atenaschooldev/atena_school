import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Внутренняя ошибка сервера';
    let code = 'INTERNAL_ERROR';
    let type = exception?.name || 'Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent: any = exception.getResponse();
      if (typeof resContent === 'object') {
        message = resContent.message || resContent.detail || resContent.error;
      } else {
        message = resContent;
      }
      code = 'HTTP_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      if (process.env.APP_ENV === 'development') {
        type = exception.stack || exception.name;
      }
    }

    console.error(`[${request.method}] ${request.url} - Error:`, exception);

    const formattedMessage = Array.isArray(message) ? message.join(', ') : message;

    response.status(status).send({
      statusCode: status,
      message: formattedMessage,
      error: type,
      detail: formattedMessage,
      code: code,
      type: type,
    });
  }
}
