const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CLIENT: 'Client'
};

const ROLE_PERMISSIONS = {
  Admin: {
    name: 'Admin',
    title: 'Agency owner / system administrator',
    description: 'Create and manage managers; manage organisation settings, users, services, clients, proposals, projects, tasks, invoices, reports and all agency data.'
  },
  Manager: {
    name: 'Manager',
    title: 'Runs day-to-day client servicing and delivery',
    description: 'Create/manage clients; prepare proposals; assign services; create projects; assign and review tasks; manage campaigns and leads; prepare reports and invoices if permitted. Cannot create or promote an Admin.'
  },
  Employee: {
    name: 'Employee',
    title: 'Executes assigned agency work',
    description: 'View assigned projects and tasks; update task status; add work notes, links and files; submit work for review; view only the client/project information needed for assigned work.'
  },
  Client: {
    name: 'Client',
    title: 'Agency customer and approver',
    description: 'View own profile, active services, project progress, submitted deliverables, reports and own invoices; approve or request changes on designated deliverables and proposals.'
  }
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  ROLE_VALUES: Object.values(ROLES)
};
