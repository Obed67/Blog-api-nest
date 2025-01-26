import { Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';
import { PostModule } from './post/post.module';
import { CommentService } from './comment/comment.service';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal : true}), AuthModule, PrismaModule, MailerModule, PostModule, CommentModule],
  providers: [CommentService],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
