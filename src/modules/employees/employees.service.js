const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination, parseSort } = require('../../utils/helpers');

class EmployeesService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const { search, status, department, position, includeDeleted } = query;

    const where = {};
    if (includeDeleted !== 'true') where.deletedAt = null;
    if (status) where.status = status;
    if (department) where.department = { contains: department };
    if (position) where.position = { contains: position };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { employeeNumber: { contains: search } },
        { email: { contains: search } },
        { department: { contains: search } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query),
      }),
      prisma.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: employees,
      pagination: { page, limit, total, totalPages },
    };
  }

  async findById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { assignedProjects: { include: { project: true } } },
    });
    if (!employee) throw new AppError('Employee not found', 404);
    return employee;
  }

  async create(data) {
    const existing = await prisma.employee.findUnique({
      where: { employeeNumber: data.employeeNumber },
    });
    if (existing) throw new AppError('Employee number already exists', 409);

    if (data.email) {
      const emailExists = await prisma.employee.findUnique({ where: { email: data.email } });
      if (emailExists) throw new AppError('Email already exists', 409);
    }

    const allowedFields = {
      employeeNumber: data.employeeNumber,
      nationalId: data.nationalId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      image: data.image,
      position: data.position,
      department: data.department,
      salary: data.salary,
      hireDate: data.hireDate,
      status: data.status,
    };
    Object.keys(allowedFields).forEach((k) => { if (allowedFields[k] === undefined) delete allowedFields[k]; });

    return prisma.employee.create({ data: allowedFields });
  }

  async update(id, data) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new AppError('Employee not found', 404);

    const allowedFields = {};
    if (data.employeeNumber !== undefined) {
      if (data.employeeNumber !== employee.employeeNumber) {
        const existing = await prisma.employee.findUnique({ where: { employeeNumber: data.employeeNumber } });
        if (existing) throw new AppError('Employee number already exists', 409);
      }
      allowedFields.employeeNumber = data.employeeNumber;
    }
    if (data.nationalId !== undefined) allowedFields.nationalId = data.nationalId;
    if (data.name !== undefined) allowedFields.name = data.name;
    if (data.email !== undefined) {
      if (data.email !== employee.email && data.email !== null) {
        const emailExists = await prisma.employee.findUnique({ where: { email: data.email } });
        if (emailExists) throw new AppError('Email already exists', 409);
      }
      allowedFields.email = data.email;
    }
    if (data.phone !== undefined) allowedFields.phone = data.phone;
    if (data.image !== undefined) allowedFields.image = data.image;
    if (data.position !== undefined) allowedFields.position = data.position;
    if (data.department !== undefined) allowedFields.department = data.department;
    if (data.salary !== undefined) allowedFields.salary = data.salary;
    if (data.hireDate !== undefined) allowedFields.hireDate = data.hireDate;
    if (data.status !== undefined) allowedFields.status = data.status;

    return prisma.employee.update({ where: { id }, data: allowedFields });
  }

  async delete(id) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new AppError('Employee not found', 404);

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async archive(id) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new AppError('Employee not found', 404);

    await prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async restore(id) {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee || !employee.deletedAt) {
      throw new AppError('Employee not found or not deleted', 404);
    }

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: null, status: 'ACTIVE' },
    });
  }
}

module.exports = new EmployeesService();
