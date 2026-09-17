import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

const HTTP_STATUS_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Внутренняя ошибка сервера';
    let code = 'INTERNAL_ERROR';
    let errorName = exception?.name || 'InternalServerError';
    let invalidParams: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent: any = exception.getResponse();
      if (typeof resContent === 'object' && resContent !== null) {
        message = resContent.message || resContent.detail || resContent.error || 'Http Exception';
        if (Array.isArray(resContent.message)) {
          invalidParams = resContent.message;
        }
        errorName = resContent.error || exception.name;
      } else {
        message = resContent;
      }
      code = 'HTTP_ERROR';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }

    const title = HTTP_STATUS_TITLES[status] || 'Error';
    const formattedMessage = Array.isArray(message) ? message.join(', ') : String(message);
    const typeUri = `https://httpstatuses.com/${status}`;

    console.error(`[${request.method}] ${request.url} [${status} ${title}] - Detail:`, formattedMessage);

    const problemDetails: Record<string, any> = {
      type: typeUri,
      title: title,
      status: status,
      detail: formattedMessage,
      instance: request.url,
      statusCode: status,
      message: formattedMessage,
      error: errorName,
      code: code,
      success: false,
    };

    if (invalidParams) {
      problemDetails.invalidParams = invalidParams;
    }

    if (process.env.APP_ENV === 'development' && exception instanceof Error && exception.stack) {
      problemDetails.stack = exception.stack;
    }

    response.status(status).send(problemDetails);
  }
}

