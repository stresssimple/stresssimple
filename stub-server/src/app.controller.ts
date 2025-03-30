import { All, Controller, Req, Res } from '@nestjs/common';
import { Response } from 'express';
@Controller()
export class AppController {
  constructor() {}

  @All('*')
  public async getHello(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    if (request.headers['x-stub-delay']) {
      const delay = Number(request.headers['x-stub-delay']);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (request.headers['x-stub-cpu']) {
      const cpu = Number(request.headers['x-stub-cpu']);
      const start = Date.now();
      while (Date.now() < start + cpu) {
        // Burn CPU
      }
    }

    let status = 200;
    if (request.headers['x-stub-status']) {
      status = Number(request.headers['x-stub-status']);
    }

    response.status(status).send({
      message: 'Hello World!',
    });
  }
}
