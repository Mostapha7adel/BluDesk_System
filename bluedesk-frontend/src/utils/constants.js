export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Employees', path: '/employees', icon: 'Users' },
  { label: 'Projects', path: '/projects', icon: 'Briefcase' },
  { label: 'Internal Projects', path: '/internal-projects', icon: 'FolderGit2' },
  { label: 'Finance', path: '/finance', icon: 'Wallet' },
  { label: 'Roles & Permissions', path: '/permissions', icon: 'Shield' },
  { label: 'Audit Logs', path: '/audit-logs', icon: 'History' },
];

export const PROJECT_STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'ANALYSIS', label: 'Analysis' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const INTERNAL_PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'SALARIES', label: 'Salaries' },
  { value: 'HOSTING', label: 'Hosting' },
  { value: 'RENT', label: 'Rent' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

export const EMPLOYEE_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'TERMINATED', label: 'Terminated' },
];
