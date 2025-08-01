import { Injectable, ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { SearchGroupsDto } from './dto/search-groups.dto';
import { JoinRequestActionDto } from './dto/join-request-action.dto';
import { Visibility, JoinRequestStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(userId: string, createGroupDto: CreateGroupDto) {
    const { name, description, maxCapacity, visibility } = createGroupDto;

    // Check if user is already in a group
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: { userId },
    });

    if (existingMembership) {
      throw new ConflictException('You can only belong to one group at a time');
    }

    // Generate invite code for private groups
    const inviteCode = visibility === Visibility.PRIVATE ? uuidv4() : null;

    // Create group and add creator as first member
    const group = await this.prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          description,
          maxCapacity,
          visibility,
          inviteCode,
          ownerId: userId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      // Add creator as first member
      await tx.groupMember.create({
        data: {
          userId,
          groupId: newGroup.id,
        },
      });

      return newGroup;
    });

    return {
      ...group,
      memberCount: 1, // Creator is the first member
    };
  }

  async searchPublicGroups(searchDto: SearchGroupsDto) {
    const { name } = searchDto;

    const groups = await this.prisma.group.findMany({
      where: {
        visibility: Visibility.PUBLIC,
        ...(name && {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return groups.map(group => ({
      ...group,
      memberCount: group._count.members,
      _count: undefined,
    }));
  }

  async requestToJoinGroup(userId: string, groupId: string) {
    // Check if group exists and is public
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.visibility !== Visibility.PUBLIC) {
      throw new ForbiddenException('Cannot request to join private groups');
    }

    // Check if group is at capacity
    if (group._count.members >= group.maxCapacity) {
      throw new ConflictException('Group is at maximum capacity');
    }

    // Check if user is already in a group
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: { userId },
    });

    if (existingMembership) {
      throw new ConflictException('You can only belong to one group at a time');
    }

    // Check if user already has a pending request
    const existingRequest = await this.prisma.joinRequest.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (existingRequest) {
      throw new ConflictException('You already have a pending request for this group');
    }

    const joinRequest = await this.prisma.joinRequest.create({
      data: {
        userId,
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return joinRequest;
  }

  async getGroupMembers(userId: string, groupId: string) {
    // Check if user is the group owner
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only group admins can view members');
    }

    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members.map(member => ({
      id: member.id,
      joinedAt: member.joinedAt,
      user: member.user,
    }));
  }

  async getJoinRequests(userId: string, groupId: string) {
    // Check if user is the group owner
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException('Only group admins can view join requests');
    }

    const requests = await this.prisma.joinRequest.findMany({
      where: {
        groupId,
        status: JoinRequestStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return requests;
  }

  async handleJoinRequest(userId: string, requestId: string, actionDto: JoinRequestActionDto) {
    const { action } = actionDto;

    // Find the join request
    const joinRequest = await this.prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        group: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.group.ownerId !== userId) {
      throw new ForbiddenException('Only group admins can handle join requests');
    }

    if (joinRequest.status !== JoinRequestStatus.PENDING) {
      throw new ConflictException('This request has already been processed');
    }

    if (action === 'APPROVE') {
      // Check if group is at capacity
      if (joinRequest.group._count.members >= joinRequest.group.maxCapacity) {
        throw new ConflictException('Group is at maximum capacity');
      }

      // Check if user is already in a group
      const existingMembership = await this.prisma.groupMember.findUnique({
        where: { userId: joinRequest.userId },
      });

      if (existingMembership) {
        throw new ConflictException('User is already in a group');
      }

      // Approve request and add user to group
      await this.prisma.$transaction(async (tx) => {
        await tx.joinRequest.update({
          where: { id: requestId },
          data: { status: JoinRequestStatus.APPROVED },
        });

        await tx.groupMember.create({
          data: {
            userId: joinRequest.userId,
            groupId: joinRequest.groupId,
          },
        });
      });

      return { message: 'Join request approved successfully' };
    } else {
      // Reject request
      await this.prisma.joinRequest.update({
        where: { id: requestId },
        data: { status: JoinRequestStatus.REJECTED },
      });

      return { message: 'Join request rejected' };
    }
  }

  async inviteUserToPrivateGroup(adminId: string, groupId: string, userEmail: string) {
    // Check if group exists and user is admin
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.ownerId !== adminId) {
      throw new ForbiddenException('Only group admins can send invites');
    }

    if (group.visibility !== Visibility.PRIVATE) {
      throw new BadRequestException('Invites are only for private groups');
    }

    // Check if group is at capacity
    if (group._count.members >= group.maxCapacity) {
      throw new ConflictException('Group is at maximum capacity');
    }

    // Find user to invite
    const userToInvite = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!userToInvite) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already in a group
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: { userId: userToInvite.id },
    });

    if (existingMembership) {
      throw new ConflictException('User is already in a group');
    }

    // Check if invite already exists
    const existingInvite = await this.prisma.invite.findUnique({
      where: {
        receiverId_groupId: {
          receiverId: userToInvite.id,
          groupId,
        },
      },
    });

    if (existingInvite) {
      throw new ConflictException('User already has a pending invite for this group');
    }

    const invite = await this.prisma.invite.create({
      data: {
        senderId: adminId,
        receiverId: userToInvite.id,
        groupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            inviteCode: true,
          },
        },
      },
    });

    return invite;
  }

  async removeUserFromGroup(adminId: string, groupId: string, userIdToRemove: string) {
    // Check if group exists and user is admin
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.ownerId !== adminId) {
      throw new ForbiddenException('Only group admins can remove members');
    }

    if (adminId === userIdToRemove) {
      throw new BadRequestException('Group admin cannot remove themselves');
    }

    // Check if user is actually a member
    const membership = await this.prisma.groupMember.findFirst({
      where: {
        userId: userIdToRemove,
        groupId,
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this group');
    }

    // Remove user from group
    await this.prisma.groupMember.delete({
      where: { id: membership.id },
    });

    return { message: 'User removed from group successfully' };
  }

  async joinPrivateGroupWithCode(userId: string, inviteCode: string) {
    // Find group by invite code
    const group = await this.prisma.group.findUnique({
      where: { inviteCode },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Invalid invite code');
    }

    // Check if group is at capacity
    if (group._count.members >= group.maxCapacity) {
      throw new ConflictException('Group is at maximum capacity');
    }

    // Check if user is already in a group
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: { userId },
    });

    if (existingMembership) {
      throw new ConflictException('You can only belong to one group at a time');
    }

    // Add user to group
    const membership = await this.prisma.groupMember.create({
      data: {
        userId,
        groupId: group.id,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return membership;
  }
}