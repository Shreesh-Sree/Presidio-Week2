// In-memory Task list with pre-seeded data for sorting, filtering, and pagination tests
const tasks = [
  { id: 1, title: 'Study MVC Design Pattern', description: 'Read GeeksforGeeks article on MVC.', completed: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() }, // 5 days ago
  { id: 2, title: 'Learn Node.js Architecture', description: 'Review LogRocket blog post on project layout.', completed: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() }, // 4 days ago
  { id: 3, title: 'Write Express Middleware', description: 'Build global, router-level, and route-specific interceptors.', completed: false, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() }, // 3 days ago
  { id: 4, title: 'Implement JWT Tokens', description: 'Sign tokens for authenticated users with roles.', completed: false, createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
  { id: 5, title: 'Setup Winston Logger', description: 'Configure info and error files for audit streams.', completed: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 6, title: 'Dockerize Node App', description: 'Write optimized Dockerfile using alpine bases.', completed: false, createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString() },
  { id: 7, title: 'Orchestrate with Compose', description: 'Link services and inject secrets using docker-compose.', completed: false, createdAt: new Date(Date.now() - 3600000 * 10).toISOString() }, // 10 hours ago
  { id: 8, title: 'Design API Pagination', description: 'Implement page and limit queries to throttle output.', completed: true, createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 9, title: 'Design API Sorting', description: 'Support sorting by title and creation date.', completed: false, createdAt: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: 10, title: 'Design API Filtering', description: 'Support filtering based on task completed state.', completed: true, createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 11, title: 'Understand GraphQL vs REST', description: 'Implement sample GraphQL query endpoint.', completed: false, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 12, title: 'Create CI/CD Pipeline', description: 'Write GitHub workflows for ECS and Google Cloud Run.', completed: false, createdAt: new Date().toISOString() }
];

let nextId = 13;

export const TaskModel = {
  // Returns tasks after applying filtering, sorting, and pagination
  query: (options = {}) => {
    let result = [...tasks];

    // 1. FILTERING
    if (options.completed !== undefined) {
      const isCompleted = options.completed === 'true';
      result = result.filter(task => task.completed === isCompleted);
    }
    
    if (options.search) {
      const searchStr = options.search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchStr) || 
        task.description.toLowerCase().includes(searchStr)
      );
    }

    // 2. SORTING (format: sortBy=field:order, e.g. sortBy=createdAt:desc)
    if (options.sortBy) {
      const [field, order] = options.sortBy.split(':');
      const sortOrder = order === 'desc' ? -1 : 1;

      result.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        // Case insensitive sort for strings
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return -1 * sortOrder;
        if (valA > valB) return 1 * sortOrder;
        return 0;
      });
    } else {
      // Default sort by id ascending
      result.sort((a, b) => a.id - b.id);
    }

    // 3. PAGINATION (page and limit)
    const totalCount = result.length;
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedItems = result.slice(startIndex, endIndex);

    return {
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      items: paginatedItems
    };
  },

  getById: (id) => {
    return tasks.find(task => task.id === parseInt(id));
  },

  create: (taskData) => {
    const { title, description } = taskData;
    const newTask = {
      id: nextId++,
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    return newTask;
  },

  toggleComplete: (id) => {
    const task = tasks.find(task => task.id === parseInt(id));
    if (!task) return null;
    task.completed = !task.completed;
    return task;
  },

  delete: (id) => {
    const index = tasks.findIndex(task => task.id === parseInt(id));
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  },

  clearAll: () => {
    tasks.length = 0;
    return true;
  }
};
