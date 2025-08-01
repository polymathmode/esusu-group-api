// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getWelcome() {
//     return {
//       message: "Welcome to Esusu Group API",
//       version: "1.0.0",
//       documentation: "/api/docs",
//       endpoints: {
//         auth: ["/auth/register", "/auth/login", "/auth/profile"],
//         groups: ["/groups", "/groups/search", "/groups/:id/join"],
//         users: ["/users/profile", "/users/invites"]
//       },
//       status: "Live and Running 🚀",
//       description: "A NestJS API for managing group savings (Esusu) - Built with TypeScript, Prisma, and JWT Authentication"
//     };
//   }
// }

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getWelcome() {
    return {
      message: "Welcome to Esusu Group API",
      version: "1.0.0",
      documentation: "/api/docs",
      endpoints: {
        auth: ["/auth/register", "/auth/login", "/auth/profile"],
        groups: ["/groups", "/groups/search", "/groups/:id/join"],
        users: ["/users/profile", "/users/invites"]
      },
      status: "Live and Running 🚀",
      description: "A NestJS API for managing group savings (Esusu) - Built with TypeScript, Prisma, and JWT Authentication"
    };
  }
}