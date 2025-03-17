import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

export class SwaggerSetupOptions {
  public prefix = 'doc';
  public jsonUrl = 'doc/schema.json';
  public yamlUrl = 'doc/schema.yaml';
  public version = '1.0';
  public title = 'API';
  public description = 'API description';
  public options: Partial<SwaggerCustomOptions> = {};
  constructor(source: Partial<SwaggerSetupOptions>) {
    Object.assign(this, source);
  }
}

export function swaggerSetup(
  app: INestApplication,
  options: Partial<SwaggerSetupOptions> = {},

  patchDocument: (
    req: any,
    res: any,
    document: OpenAPIObject,
  ) => OpenAPIObject = patchDocumentServers,
) {
  const fullOptions = new SwaggerSetupOptions(options);
  const config = new DocumentBuilder()
    .setTitle(fullOptions.title)
    .setDescription(fullOptions.description)
    .setVersion(fullOptions.version);

  const document = SwaggerModule.createDocument(app, config.build());
  SwaggerModule.setup(fullOptions.prefix, app, document, {
    explorer: true,
    jsonDocumentUrl: fullOptions.jsonUrl,
    yamlDocumentUrl: fullOptions.yamlUrl,
    patchDocumentOnRequest: patchDocument,
    swaggerOptions: {
      persistAuthorization: true,
    },
    ...options.options,
  });
}

export function patchDocumentServers(
  req: Request,
  res: Response,
  document: OpenAPIObject,
): OpenAPIObject {
  document.servers = [{ url: req.protocol + '://' + req.get('host') }];
  return document;
}
