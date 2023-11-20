import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './feature/user/user.module';
import { PostModule } from './feature/post/post.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // 连接mysql数据库
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'admin123',
      database: 'my_db_01',
      // 自动加载实体
      autoLoadEntities: true,
      // 手动导入
      // entities: [],
      synchronize: true,
    }),
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
