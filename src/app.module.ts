// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { APP_FILTER } from '@nestjs/core';
// import { PrismaModule } from './prisma/prisma.module';
// import { AuthModule } from './auth/auth.module';
// import { GroupsModule } from './groups/groups.module';
// import { UsersModule } from './users/users.module';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// import { AppController } from './app.controller';


// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     PrismaModule,
//     AuthModule,
//     GroupsModule,
//     UsersModule,
//   ],
//     controllers: [AppController],
//   providers: [
//     {
//       provide: APP_FILTER,
//       useClass: HttpExceptionFilter,
//     },
//   ],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { UsersModule } from './users/users.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    GroupsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}