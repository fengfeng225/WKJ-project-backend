import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from 'src/core/logger/custom-logger-service';
import envConfig from 'config/envConfig';
import * as path from 'path';
import * as express from 'express';
import * as history from 'connect-history-api-fallback';

async function bootstrap() {
  const logger: CustomLogger = new CustomLogger('main');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  });

  // 全局管道
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 全局配置添加请求前缀
  app.setGlobalPrefix('/api')

  app.useLogger(app.get(CustomLogger));

  // 设置允许跨域访问
  // app.enableCors();
  
  const configService = new ConfigService({
    envFilePath: [envConfig.path],
  });
  
  const historyRouter = JSON.parse(configService.get<string>('HISTORY_ROUTER'));
  const swaggerEnabled = JSON.parse(configService.get<string>('SWAGGER_ENABLED'));
  
  // 配置仅生产环境托管静态资源
  if (historyRouter) {
    app.use(history());
    app.use(express.static(path.join(__dirname, '..', 'public')))
  }

  // 配置swagger仅在开发环境启用
  if (swaggerEnabled) {
    const options = new DocumentBuilder()
    .setTitle('防互窜管理系统')
    .setDescription('防互窜管理系统项目后端搭建')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

    const documents = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('index.html', app, documents, {
      swaggerOptions: {
        url: '/api',
      },
    });
  }

  await app.listen(9000, () => {
    logger.log(`Now listening on: http://localhost:9000`, 'info');
  });
}
bootstrap();
