import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
