import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        groupMember: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
                visibility: true,
                maxCapacity: true,
                ownerId: true,
                _count: {
                  select: {
                    members: true,
                  },
                },
              },
            },
          },
        },
        ownedGroups: {
          select: {
            id: true,
            name: true,
            description: true,
            visibility: true,
            maxCapacity: true,
            inviteCode: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      currentGroup: user.groupMember?.group
        ? {
            ...user.groupMember.group,
            memberCount: user.groupMember.group._count.members,
            isOwner: user.groupMember.group.ownerId === userId,
            _count: undefined,
          }
        : null,
      ownedGroups: user.ownedGroups.map(group => ({
        ...group,
        memberCount: group._count.members,
        _count: undefined,
      })),
      groupMember: undefined,
    };
  }

  async getMyInvites(userId: string) {
    const invites = await this.prisma.invite.findMany({
      where: {
        receiverId: userId,
        status: 'SENT',
      },
      include: {
        sender: {
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
            description: true,
            maxCapacity: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invites.map(invite => ({
      ...invite,
      group: {
        ...invite.group,
        memberCount: invite.group._count.members,
        _count: undefined,
      },
    }));
  }

  async respondToInvite(userId: string, inviteId: string, accept: boolean) {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
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
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.receiverId !== userId) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'SENT') {
      throw new NotFoundException('Invite has already been responded to');
    }

    if (accept) {
      // Check if group is at capacity
      if (invite.group._count.members >= invite.group.maxCapacity) {
        throw new NotFoundException('Group is at maximum capacity');
      }

      // Check if user is already in a group
      const existingMembership = await this.prisma.groupMember.findUnique({
        where: { userId },
      });

      if (existingMembership) {
        throw new NotFoundException('You can only belong to one group at a time');
      }

      // Accept invite and add to group
      await this.prisma.$transaction(async (tx) => {
        await tx.invite.update({
          where: { id: inviteId },
          data: { status: 'ACCEPTED' },
        });

        await tx.groupMember.create({
          data: {
            userId,
            groupId: invite.groupId,
          },
        });
      });

      return { message: 'Invite accepted successfully' };
    } else {
      // Decline invite
      await this.prisma.invite.update({
        where: { id: inviteId },
        data: { status: 'DECLINED' },
      });

      return { message: 'Invite declined' };
    }
  }
}