const router = require('express').Router();
const config = require('../config');

const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const rolesRoutes = require('../modules/roles/roles.routes');
const permissionsRoutes = require('../modules/permissions/permissions.routes');
const employeesRoutes = require('../modules/employees/employees.routes');
const projectsRoutes = require('../modules/projects/projects.routes');
const internalProjectsRoutes = require('../modules/internal-projects/internalProjects.routes');
const financeRoutes = require('../modules/finance/finance.routes');
const expensesRoutes = require('../modules/expenses/expenses.routes');
const auditLogsRoutes = require('../modules/audit-logs/auditLogs.routes');
const salariesRoutes = require('../modules/salaries/salaries.routes');
const settingsRoutes = require('../modules/settings/settings.routes');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/employees', employeesRoutes);
router.use('/projects', projectsRoutes);
router.use('/internal-projects', internalProjectsRoutes);
router.use('/finance', financeRoutes);
router.use('/expenses', expensesRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/salaries', salariesRoutes);
router.use('/settings', settingsRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
  });
});

module.exports = router;
