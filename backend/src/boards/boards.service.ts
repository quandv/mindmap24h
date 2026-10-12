import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

const DEFAULT_CONTENT = {
  nodes: [
    {
      id: 'root',
      type: 'mindmap',
      position: { x: 300, y: 300 },
      data: { label: 'Central Idea', isRoot: true, collapsed: false },
    },
  ],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.board.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, folderId: true, createdAt: true, updatedAt: true },
    });
  }

  async findOne(id: string) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async create(dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        name: dto.name,
        content: DEFAULT_CONTENT,
        folderId: dto.folderId ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateBoardDto) {
    await this.findOne(id);
    return this.prisma.board.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.folderId !== undefined && { folderId: dto.folderId }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.board.delete({ where: { id } });
  }
}

