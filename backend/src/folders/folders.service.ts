import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.folder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        boards: {
          select: {
            id: true,
            name: true,
            folderId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        boards: {
          select: {
            id: true,
            name: true,
            folderId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
    if (!folder) throw new NotFoundException('Folder not found');
    return folder;
  }

  async create(dto: CreateFolderDto) {
    return this.prisma.folder.create({
      data: { name: dto.name },
      include: {
        boards: {
          select: {
            id: true,
            name: true,
            folderId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateFolderDto) {
    await this.findOne(id);
    return this.prisma.folder.update({
      where: { id },
      data: { name: dto.name },
      include: {
        boards: {
          select: {
            id: true,
            name: true,
            folderId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.folder.delete({ where: { id } });
  }
}
