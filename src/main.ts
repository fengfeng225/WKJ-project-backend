import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionFilter } from './core/filters/all-exception.filter';
import { HttpReqTransformInterceptor } from './core/interceptors/http-req.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局异常过滤
  app.useGlobalFilters(new AllExceptionFilter())
  
  // 全局拦截器
  app.useGlobalInterceptors(new HttpReqTransformInterceptor())

  const options = new DocumentBuilder()
    .setTitle('防互窜管理系统')
    .setDescription('防互窜管理系统项目后端搭建')
    .setVersion('1.0')
    .build();

  const documents = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, documents);

  await app.listen(9000);
}
bootstrap();
