import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionFilter } from './core/filters/all-exception.filter';
import { HttpReqTransformInterceptor } from './core/interceptors/http-req.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as express from 'express';
import * as history from 'connect-history-api-fallback';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: ['error', 'warn', 'log'],
  });

  // 全局异常过滤
  app.useGlobalFilters(new AllExceptionFilter())
  
  // 全局拦截器
  app.useGlobalInterceptors(new HttpReqTransformInterceptor())

  // 全局管道
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 全局配置添加请求前缀
  app.setGlobalPrefix('/api')

  // 设置允许跨域访问
  // app.enableCors();
  
  // 获取上下文
  const appContext = await NestFactory.createApplicationContext(AppModule);
  
  // 配置仅生产环境托管静态资源
  const historyRouter = JSON.parse(appContext.get(ConfigService).get<string>('HISTORY_ROUTER'));
  
  if (historyRouter) {
    app.use(history());
    app.use(express.static(path.join(__dirname, 'public')))
  }

  // 配置swagger仅在开发环境启用
  const swaggerEnabled = JSON.parse(appContext.get(ConfigService).get<string>('SWAGGER_ENABLED'));
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

  await appContext.close();

  await app.listen(9000);
}
bootstrap();
