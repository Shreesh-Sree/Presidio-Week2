// In-memory Task storage simulating a database
const tasks = [
  { id: 1, title: 'Learn MVC Pattern', description: 'Understand Model-View-Controller separation.', completed: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, title: 'Write Custom Middleware', description: 'Build global and route-specific express middleware.', completed: false, createdAt: new Date().toISOString() }
];

let nextId = 3;

export const TaskModel = {
  getAll: () => {
    return tasks;
  },

  getById: (id) => {
    return tasks.find(task => task.id === parseInt(id));
  },

  create: (taskData) => {
    const { title, description } = taskData;
    if (!title) {
      throw new Error('Task title is required');
    }
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

  delete: (id) => {
    const index = tasks.findIndex(task => task.id === parseInt(id));
    if (index === -1) {
      return false;
    }
    tasks.splice(index, 1);
    return true;
  },

  toggleComplete: (id) => {
    const task = tasks.find(task => task.id === parseInt(id));
    if (!task) return null;
    task.completed = !task.completed;
    return task;
  }
};
