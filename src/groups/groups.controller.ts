import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { SearchGroupsDto } from './dto/search-groups.dto';
import { JoinRequestActionDto } from './dto/join-request-action.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 409, description: 'User already belongs to a group' })
  async createGroup(@Request() req, @Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.createGroup(req.user.id, createGroupDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search public groups' })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
  async searchGroups(@Query() searchDto: SearchGroupsDto) {
    return this.groupsService.searchPublicGroups(searchDto);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Request to join a public group' })
  @ApiResponse({ status: 201, description: 'Join request created successfully' })
  @ApiResponse({ status: 409, description: 'User already in a group or request exists' })
  async requestToJoin(@Request() req, @Param('id') groupId: string) {
    return this.groupsService.requestToJoinGroup(req.user.id, groupId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get group members (admin only)' })
  @ApiResponse({ status: 200, description: 'Members retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Only group admins can view members' })
  async getGroupMembers(@Request() req, @Param('id') groupId: string) {
    return this.groupsService.getGroupMembers(req.user.id, groupId);
  }

  @Get(':id/join-requests')
  @ApiOperation({ summary: 'Get pending join requests (admin only)' })
  @ApiResponse({ status: 200, description: 'Join requests retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Only group admins can view join requests' })
  async getJoinRequests(@Request() req, @Param('id') groupId: string) {
    return this.groupsService.getJoinRequests(req.user.id, groupId);
  }

  @Patch('join-requests/:requestId')
  @ApiOperation({ summary: 'Approve or reject join request (admin only)' })
  @ApiResponse({ status: 200, description: 'Join request processed successfully' })
  @ApiResponse({ status: 403, description: 'Only group admins can handle requests' })
  async handleJoinRequest(
    @Request() req,
    @Param('requestId') requestId: string,
    @Body() actionDto: JoinRequestActionDto,
  ) {
    return this.groupsService.handleJoinRequest(req.user.id, requestId, actionDto);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite user to private group (admin only)' })
  @ApiResponse({ status: 201, description: 'Invite sent successfully' })
  @ApiResponse({ status: 403, description: 'Only group admins can send invites' })
  async inviteUser(
    @Request() req,
    @Param('id') groupId: string,
    @Body('email') email: string,
  ) {
    return this.groupsService.inviteUserToPrivateGroup(req.user.id, groupId, email);
  }

  @Delete(':groupId/members/:userId')
  @ApiOperation({ summary: 'Remove user from group (admin only)' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 403, description: 'Only group admins can remove members' })
  async removeUser(
    @Request() req,
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.groupsService.removeUserFromGroup(req.user.id, groupId, userId);
  }

  @Post('join-with-code')
  @ApiOperation({ summary: 'Join private group with invite code' })
  @ApiResponse({ status: 201, description: 'Successfully joined group' })
  @ApiResponse({ status: 404, description: 'Invalid invite code' })
  async joinWithCode(@Request() req, @Body('inviteCode') inviteCode: string) {
    return this.groupsService.joinPrivateGroupWithCode(req.user.id, inviteCode);
  }
}