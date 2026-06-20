const ROLES = {
  SUPER_ADMIN: { id: 1, name: 'Super Admin', slug: 'super_admin' },
  OWNER: { id: 2, name: 'Owner', slug: 'owner' },
  MANAGER: { id: 3, name: 'Manager', slug: 'manager' },
  INVESTOR: { id: 4, name: 'Investor', slug: 'investor' },
  ACCOUNTANT: { id: 5, name: 'Accountant', slug: 'accountant' },
  HR: { id: 6, name: 'HR', slug: 'hr' },
  EMPLOYEE: { id: 7, name: 'Employee', slug: 'employee' },
};

const PERMISSION_GROUPS = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  EMPLOYEES: 'employees',
  PROJECTS: 'projects',
  INTERNAL_PROJECTS: 'internal_projects',
  FINANCE: 'finance',
  TREASURY: 'treasury',
  EXPENSES: 'expenses',
  AUDIT_LOGS: 'audit_logs',
  SALARIES: 'salaries',
};

const PERMISSIONS = [
  // Users
  { name: 'Create User', slug: 'users.create', group: PERMISSION_GROUPS.USERS },
  { name: 'Read User', slug: 'users.read', group: PERMISSION_GROUPS.USERS },
  { name: 'Update User', slug: 'users.update', group: PERMISSION_GROUPS.USERS },
  { name: 'Delete User', slug: 'users.delete', group: PERMISSION_GROUPS.USERS },
  { name: 'Restore User', slug: 'users.restore', group: PERMISSION_GROUPS.USERS },

  // Roles
  { name: 'Create Role', slug: 'roles.create', group: PERMISSION_GROUPS.ROLES },
  { name: 'Read Role', slug: 'roles.read', group: PERMISSION_GROUPS.ROLES },
  { name: 'Update Role', slug: 'roles.update', group: PERMISSION_GROUPS.ROLES },
  { name: 'Delete Role', slug: 'roles.delete', group: PERMISSION_GROUPS.ROLES },

  // Permissions
  { name: 'Assign Permission', slug: 'permissions.assign', group: PERMISSION_GROUPS.PERMISSIONS },
  { name: 'Remove Permission', slug: 'permissions.remove', group: PERMISSION_GROUPS.PERMISSIONS },

  // Employees
  { name: 'Create Employee', slug: 'employees.create', group: PERMISSION_GROUPS.EMPLOYEES },
  { name: 'Read Employee', slug: 'employees.read', group: PERMISSION_GROUPS.EMPLOYEES },
  { name: 'Update Employee', slug: 'employees.update', group: PERMISSION_GROUPS.EMPLOYEES },
  { name: 'Delete Employee', slug: 'employees.delete', group: PERMISSION_GROUPS.EMPLOYEES },
  { name: 'Archive Employee', slug: 'employees.archive', group: PERMISSION_GROUPS.EMPLOYEES },
  { name: 'Restore Employee', slug: 'employees.restore', group: PERMISSION_GROUPS.EMPLOYEES },

  // Projects
  { name: 'Create Project', slug: 'projects.create', group: PERMISSION_GROUPS.PROJECTS },
  { name: 'Read Project', slug: 'projects.read', group: PERMISSION_GROUPS.PROJECTS },
  { name: 'Update Project', slug: 'projects.update', group: PERMISSION_GROUPS.PROJECTS },
  { name: 'Delete Project', slug: 'projects.delete', group: PERMISSION_GROUPS.PROJECTS },

  // Internal Projects
  { name: 'Create Internal Project', slug: 'internal_projects.create', group: PERMISSION_GROUPS.INTERNAL_PROJECTS },
  { name: 'Read Internal Project', slug: 'internal_projects.read', group: PERMISSION_GROUPS.INTERNAL_PROJECTS },
  { name: 'Update Internal Project', slug: 'internal_projects.update', group: PERMISSION_GROUPS.INTERNAL_PROJECTS },
  { name: 'Delete Internal Project', slug: 'internal_projects.delete', group: PERMISSION_GROUPS.INTERNAL_PROJECTS },

  // Finance
  { name: 'Read Finance', slug: 'finance.read', group: PERMISSION_GROUPS.FINANCE },
  { name: 'Create Transaction', slug: 'finance.create_transaction', group: PERMISSION_GROUPS.FINANCE },
  { name: 'Generate Report', slug: 'finance.generate_report', group: PERMISSION_GROUPS.FINANCE },

  // Treasury
  { name: 'Create Treasury', slug: 'treasury.create', group: PERMISSION_GROUPS.TREASURY },
  { name: 'Read Treasury', slug: 'treasury.read', group: PERMISSION_GROUPS.TREASURY },
  { name: 'Update Treasury', slug: 'treasury.update', group: PERMISSION_GROUPS.TREASURY },

  // Expenses
  { name: 'Create Expense', slug: 'expenses.create', group: PERMISSION_GROUPS.EXPENSES },
  { name: 'Read Expense', slug: 'expenses.read', group: PERMISSION_GROUPS.EXPENSES },
  { name: 'Update Expense', slug: 'expenses.update', group: PERMISSION_GROUPS.EXPENSES },
  { name: 'Delete Expense', slug: 'expenses.delete', group: PERMISSION_GROUPS.EXPENSES },

  // Audit Logs
  { name: 'Read Audit Logs', slug: 'audit_logs.read', group: PERMISSION_GROUPS.AUDIT_LOGS },

  // Salaries
  { name: 'Read Salary', slug: 'salaries.read', group: PERMISSION_GROUPS.SALARIES },
  { name: 'Create Salary', slug: 'salaries.create', group: PERMISSION_GROUPS.SALARIES },
  { name: 'Approve Salary', slug: 'salaries.approve', group: PERMISSION_GROUPS.SALARIES },
];

module.exports = { ROLES, PERMISSIONS, PERMISSION_GROUPS };
