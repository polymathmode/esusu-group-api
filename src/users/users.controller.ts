import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RespondInviteDto } from './dto/respond-invite.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get detailed user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.usersService.getUserProfile(req.user.id);
  }

  @Get('invites')
  @ApiOperation({ summary: 'Get my pending invites' })
  @ApiResponse({ status: 200, description: 'Invites retrieved successfully' })
  async getMyInvites(@Request() req) {
    return this.usersService.getMyInvites(req.user.id);
  }

  @Patch('invites/:inviteId')
  @ApiOperation({ summary: 'Accept or decline invite' })
  @ApiResponse({ status: 200, description: 'Invite responded to successfully' })
  async respondToInvite(
    @Request() req,
    @Param('inviteId') inviteId: string,
    @Body() respondDto: RespondInviteDto,
  ) {
    return this.usersService.respondToInvite(req.user.id, inviteId, respondDto.accept);
  }
}