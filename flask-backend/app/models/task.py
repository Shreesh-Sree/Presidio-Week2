from datetime import datetime, timezone

# In-memory storage simulating a database
tasks = [
    {
        "id": 1,
        "title": "Learn Flask blueprints",
        "description": "Understand how to organize large applications.",
        "completed": True,
        "createdAt": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": 2,
        "title": "Learn Flask async support",
        "description": "Utilize asyncio inside Flask endpoints.",
        "completed": False,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
]

next_id = 3

class TaskModel:
    @staticmethod
    def get_all():
        return tasks

    @staticmethod
    def get_by_id(task_id):
        return next((t for t in tasks if t["id"] == task_id), None)

    @staticmethod
    def create(data):
        global next_id
        title = data.get("title")
        description = data.get("description", "")
        
        if not title:
            raise ValueError("Task title is required")
            
        new_task = {
            "id": next_id,
            "title": title,
            "description": description,
            "completed": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        next_id += 1
        tasks.append(new_task)
        return new_task

    @staticmethod
    def delete(task_id):
        global tasks
        task = TaskModel.get_by_id(task_id)
        if not task:
            return False
        tasks.remove(task)
        return True

    @staticmethod
    def toggle_complete(task_id):
        task = TaskModel.get_by_id(task_id)
        if not task:
            return None
        task["completed"] = not task["completed"]
        return task
