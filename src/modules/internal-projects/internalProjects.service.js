const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination, parseSort } = require('../../utils/helpers');

class InternalProjectsService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const { search, status } = query;

    const where = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.name = { contains: search };
    }

    const [projects, total] = await Promise.all([
      prisma.internalProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query),
        include: {
          _count: { select: { teamMembers: true, notes: true } },
        },
      }),
      prisma.internalProject.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: projects,
      pagination: { page, limit, total, totalPages },
    };
  }

  async findById(id) {
    const project = await prisma.internalProject.findUnique({
      where: { id },
      include: {
        teamMembers: true,
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) throw new AppError('Internal project not found', 404);
    return project;
  }

  async create(data) {
    const { teamMembers, notes, ...projectData } = data;

    return prisma.internalProject.create({
      data: {
        ...projectData,
        ...(teamMembers && teamMembers.length > 0
          ? { teamMembers: { create: teamMembers } }
          : {}),
      },
      include: { teamMembers: true },
    });
  }

  async update(id, data) {
    const project = await prisma.internalProject.findUnique({ where: { id } });
    if (!project) throw new AppError('Internal project not found', 404);

    const { teamMembers, ...updateData } = data;

    const allowedFields = {};
    if (updateData.name !== undefined) allowedFields.name = updateData.name;
    if (updateData.description !== undefined) allowedFields.description = updateData.description;
    if (updateData.status !== undefined) allowedFields.status = updateData.status;
    if (updateData.progress !== undefined) allowedFields.progress = updateData.progress;
    if (updateData.startDate !== undefined) allowedFields.startDate = updateData.startDate;
    if (updateData.endDate !== undefined) allowedFields.endDate = updateData.endDate;

    return prisma.$transaction(async (tx) => {
      if (teamMembers !== undefined) {
        await tx.internalProjectMember.deleteMany({ where: { internalProjectId: id } });
        if (teamMembers.length > 0) {
          await tx.internalProjectMember.createMany({
            data: teamMembers.map((m) => ({
              internalProjectId: id,
              name: m.name,
              role: m.role,
            })),
          });
        }
      }

      return tx.internalProject.update({
        where: { id },
        data: allowedFields,
        include: { teamMembers: true, notes: true },
      });
    });
  }

  async updateStatus(id, status) {
    const project = await prisma.internalProject.findUnique({ where: { id } });
    if (!project) throw new AppError('Internal project not found', 404);

    return prisma.internalProject.update({
      where: { id },
      data: { status },
    });
  }

  async updateProgress(id, progress) {
    const project = await prisma.internalProject.findUnique({ where: { id } });
    if (!project) throw new AppError('Internal project not found', 404);

    return prisma.internalProject.update({
      where: { id },
      data: { progress },
    });
  }

  async delete(id) {
    const project = await prisma.internalProject.findUnique({ where: { id } });
    if (!project) throw new AppError('Internal project not found', 404);

    await prisma.internalProject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addNote(projectId, content, userId) {
    const project = await prisma.internalProject.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Internal project not found', 404);

    return prisma.internalProjectNote.create({
      data: { internalProjectId: projectId, content, createdBy: userId },
    });
  }

  async addTeamMember(projectId, data) {
    const project = await prisma.internalProject.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Internal project not found', 404);

    return prisma.internalProjectMember.create({
      data: { internalProjectId: projectId, ...data },
    });
  }

  async removeTeamMember(projectId, memberId) {
    const member = await prisma.internalProjectMember.findFirst({
      where: { id: memberId, internalProjectId: projectId },
    });
    if (!member) throw new AppError('Team member not found', 404);

    await prisma.internalProjectMember.delete({ where: { id: memberId } });
  }
}

module.exports = new InternalProjectsService();
