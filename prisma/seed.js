const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ROLES = [
  { name: 'Super Admin', slug: 'super_admin', isSystem: true, description: 'Full system access' },
  { name: 'Owner', slug: 'owner', isSystem: true, description: 'Business owner with full access' },
  { name: 'Manager', slug: 'manager', isSystem: true, description: 'Manages day to day operations' },
  { name: 'Investor', slug: 'investor', isSystem: true, description: 'Read-only financial access' },
  { name: 'Accountant', slug: 'accountant', isSystem: true, description: 'Financial management' },
  { name: 'HR', slug: 'hr', isSystem: true, description: 'Human resources management' },
  { name: 'Employee', slug: 'employee', isSystem: true, description: 'Basic employee access' },
];

const PERMISSIONS = [
  { name: 'Create User', slug: 'users.create', group: 'users' },
  { name: 'Read User', slug: 'users.read', group: 'users' },
  { name: 'Update User', slug: 'users.update', group: 'users' },
  { name: 'Delete User', slug: 'users.delete', group: 'users' },
  { name: 'Restore User', slug: 'users.restore', group: 'users' },
  { name: 'Create Role', slug: 'roles.create', group: 'roles' },
  { name: 'Read Role', slug: 'roles.read', group: 'roles' },
  { name: 'Update Role', slug: 'roles.update', group: 'roles' },
  { name: 'Delete Role', slug: 'roles.delete', group: 'roles' },
  { name: 'Assign Permission', slug: 'permissions.assign', group: 'permissions' },
  { name: 'Remove Permission', slug: 'permissions.remove', group: 'permissions' },
  { name: 'Create Employee', slug: 'employees.create', group: 'employees' },
  { name: 'Read Employee', slug: 'employees.read', group: 'employees' },
  { name: 'Update Employee', slug: 'employees.update', group: 'employees' },
  { name: 'Delete Employee', slug: 'employees.delete', group: 'employees' },
  { name: 'Archive Employee', slug: 'employees.archive', group: 'employees' },
  { name: 'Restore Employee', slug: 'employees.restore', group: 'employees' },
  { name: 'Create Project', slug: 'projects.create', group: 'projects' },
  { name: 'Read Project', slug: 'projects.read', group: 'projects' },
  { name: 'Update Project', slug: 'projects.update', group: 'projects' },
  { name: 'Delete Project', slug: 'projects.delete', group: 'projects' },
  { name: 'Create Internal Project', slug: 'internal_projects.create', group: 'internal_projects' },
  { name: 'Read Internal Project', slug: 'internal_projects.read', group: 'internal_projects' },
  { name: 'Update Internal Project', slug: 'internal_projects.update', group: 'internal_projects' },
  { name: 'Delete Internal Project', slug: 'internal_projects.delete', group: 'internal_projects' },
  { name: 'Read Finance', slug: 'finance.read', group: 'finance' },
  { name: 'Create Transaction', slug: 'finance.create_transaction', group: 'finance' },
  { name: 'Generate Report', slug: 'finance.generate_report', group: 'finance' },
  { name: 'Create Treasury', slug: 'treasury.create', group: 'treasury' },
  { name: 'Read Treasury', slug: 'treasury.read', group: 'treasury' },
  { name: 'Update Treasury', slug: 'treasury.update', group: 'treasury' },
  { name: 'Create Expense', slug: 'expenses.create', group: 'expenses' },
  { name: 'Read Expense', slug: 'expenses.read', group: 'expenses' },
  { name: 'Update Expense', slug: 'expenses.update', group: 'expenses' },
  { name: 'Delete Expense', slug: 'expenses.delete', group: 'expenses' },
  { name: 'Read Audit Logs', slug: 'audit_logs.read', group: 'audit_logs' },
  { name: 'Read Salary', slug: 'salaries.read', group: 'salaries' },
  { name: 'Create Salary', slug: 'salaries.create', group: 'salaries' },
  { name: 'Approve Salary', slug: 'salaries.approve', group: 'salaries' },
  { name: 'Read Settings', slug: 'settings.read', group: 'settings' },
  { name: 'Create Backup', slug: 'settings.backup', group: 'settings' },
];

// Super Admin gets all permissions
const SUPER_ADMIN_PERMISSIONS = PERMISSIONS.map((p) => p.slug);

// Owner gets most permissions
const OWNER_PERMISSIONS = PERMISSIONS.map((p) => p.slug).filter(
  (s) => !['roles.delete', 'permissions.remove'].includes(s)
);

// Manager permissions
const MANAGER_PERMISSIONS = [
  'users.read', 'employees.create', 'employees.read', 'employees.update', 'employees.delete', 'employees.archive', 'employees.restore',
  'projects.create', 'projects.read', 'projects.update', 'projects.delete',
  'internal_projects.create', 'internal_projects.read', 'internal_projects.update',
  'expenses.create', 'expenses.read', 'expenses.update',
  'finance.read', 'finance.generate_report', 'treasury.read',
  'salaries.read', 'salaries.create', 'salaries.approve',
];

// Investor permissions (read-only)
const INVESTOR_PERMISSIONS = [
  'finance.read', 'finance.generate_report', 'treasury.read',
  'expenses.read', 'projects.read', 'audit_logs.read', 'employees.read',
];

// Accountant permissions
const ACCOUNTANT_PERMISSIONS = [
  'finance.read', 'finance.create_transaction', 'finance.generate_report',
  'treasury.create', 'treasury.read', 'treasury.update',
  'expenses.create', 'expenses.read', 'expenses.update', 'expenses.delete',
  'salaries.read', 'salaries.create', 'salaries.approve',
];

// HR permissions
const HR_PERMISSIONS = [
  'users.read', 'employees.create', 'employees.read', 'employees.update',
  'employees.delete', 'employees.archive', 'employees.restore',
];

// Employee permissions
const EMPLOYEE_PERMISSIONS = [
  'projects.read', 'internal_projects.read', 'employees.read',
];

const ROLE_PERMISSIONS_MAP = {
  super_admin: SUPER_ADMIN_PERMISSIONS,
  owner: OWNER_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  investor: INVESTOR_PERMISSIONS,
  accountant: ACCOUNTANT_PERMISSIONS,
  hr: HR_PERMISSIONS,
  employee: EMPLOYEE_PERMISSIONS,
};

async function main() {
  console.log('🌱 Starting seed...');

  // Create permissions
  console.log('Creating permissions...');
  const permissionMap = {};
  for (const perm of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, group: perm.group },
      create: perm,
    });
    permissionMap[perm.slug] = created.id;
  }
  console.log(`  ✅ ${Object.keys(permissionMap).length} permissions created`);

  // Create roles and assign permissions
  console.log('Creating roles and assigning permissions...');
  const roleMap = {};
  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { slug: roleData.slug },
      update: { name: roleData.name, description: roleData.description },
      create: roleData,
    });
    roleMap[roleData.slug] = role.id;

    // Assign permissions
    const permSlugs = ROLE_PERMISSIONS_MAP[roleData.slug] || [];
    for (const slug of permSlugs) {
      if (permissionMap[slug]) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permissionMap[slug] } },
          update: {},
          create: { roleId: role.id, permissionId: permissionMap[slug] },
        });
      }
    }
    console.log(`  ✅ ${roleData.name} - ${permSlugs.length} permissions assigned`);
  }

  // Create super admin user
  console.log('Creating super admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bluedesk.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@bluedesk.com',
      password: hashedPassword,
      roleId: roleMap['super_admin'],
      status: 'ACTIVE',
    },
  });
  console.log(`  ✅ Super admin created: admin@bluedesk.com / Admin@123456`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Default login credentials:');
  console.log('  Email: admin@bluedesk.com');
  console.log('  Password: Admin@123456');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
