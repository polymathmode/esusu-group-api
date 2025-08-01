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

// import { Controller, Get } from '@nestjs/common';

// @Controller()
// export class AppController {
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


import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Header('Content-Type', 'text/html')
  getWelcome() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Esusu Group API</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 40px auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 10px;
                font-size: 2.5em;
            }
            .version {
                text-align: center;
                color: #7f8c8d;
                margin-bottom: 30px;
                font-size: 1.1em;
            }
            .status {
                text-align: center;
                background: #2ecc71;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                margin: 20px auto;
                font-weight: bold;
            }
            .description {
                text-align: center;
                color: #5a6c7d;
                margin: 20px 0;
                font-size: 1.1em;
            }
            .section {
                margin: 30px 0;
            }
            .section h3 {
                color: #34495e;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 10px;
            }
            .endpoint-group {
                margin: 15px 0;
            }
            .endpoint-group h4 {
                color: #2980b9;
                margin-bottom: 10px;
            }
            .endpoint {
                background: #f8f9fa;
                padding: 8px 12px;
                margin: 5px 0;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                border-left: 4px solid #3498db;
            }
            .docs-link {
                display: block;
                text-align: center;
                margin: 30px 0;
            }
            .docs-link a {
                background: #3498db;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                transition: background 0.3s;
            }
            .docs-link a:hover {
                background: #2980b9;
            }
            .center {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Esusu Group API</h1>
            <div class="version">Version 1.0.0</div>
            <div class="center">
                <div class="status">Live and Running 🎉</div>
            </div>
            <div class="description">
                A NestJS API for managing group savings (Esusu) - Built with TypeScript, Prisma, and JWT Authentication
            </div>
            
            <div class="docs-link">
                <a href="/api/docs">📚 View API Documentation</a>
            </div>
            
            <div class="section">
                <h3>🔗 Available Endpoints</h3>
                
                <div class="endpoint-group">
                    <h4>Authentication</h4>
                    <div class="endpoint">POST /auth/register</div>
                    <div class="endpoint">POST /auth/login</div>
                    <div class="endpoint">GET /auth/profile</div>
                </div>
                
                <div class="endpoint-group">
                    <h4>Groups</h4>
                    <div class="endpoint">POST /groups</div>
                    <div class="endpoint">GET /groups/search</div>
                    <div class="endpoint">POST /groups/:id/join</div>
                </div>
                
                <div class="endpoint-group">
                    <h4>Users</h4>
                    <div class="endpoint">GET /users/profile</div>
                    <div class="endpoint">GET /users/invites</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}