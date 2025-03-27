import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      this.logger.error(exception.name + ' ' + exception.message);
    } else {
      this.logger.error(exception);
    }
    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        statusCode: status,
        message: exception instanceof Error ? exception.message : '',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else if (host.getType() === 'rpc') {
      const ctx = host.switchToRpc();
      const context = ctx.getContext();
      this.logger.error('RPC error');
      this.logger.error(context);
    }
  }
}
