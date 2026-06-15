from flask import Blueprint, request, jsonify
from app.models.task import TaskModel
from app.utils.errors import ValidationError, NotFoundError

tasks_bp = Blueprint('tasks', __name__)

# Blue-print level request hooks acting as router-level middleware
@tasks_bp.before_request
def before_tasks_request():
    print(f"[FLASK-BLUEPRINT-MIDDLEWARE] Accessing Flask Task Management Service - Path: {request.path}")

@tasks_bp.route('', methods=['GET'])
def get_all_tasks():
    all_tasks = TaskModel.get_all()
    return jsonify({
        "status": "success",
        "results": len(all_tasks),
        "data": {
            "tasks": all_tasks
        }
    }), 200

@tasks_bp.route('', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    title = data.get('title')
    
    if not title or str(title).strip() == '':
        raise ValidationError('Task title is required and cannot be empty.')
        
    new_task = TaskModel.create(data)
    return jsonify({
        "status": "success",
        "message": "Task created successfully in Flask",
        "data": {
            "task": new_task
        }
    }), 201

@tasks_bp.route('/<int:task_id>', methods=['GET'])
def get_task_by_id(task_id):
    task = TaskModel.get_by_id(task_id)
    if not task:
        raise NotFoundError(f"Task with ID {task_id} not found in Flask database.")
        
    return jsonify({
        "status": "success",
        "data": {
            "task": task
        }
    }), 200

@tasks_bp.route('/<int:task_id>', methods=['PATCH'])
def toggle_task(task_id):
    task = TaskModel.toggle_complete(task_id)
    if not task:
        raise NotFoundError(f"Task with ID {task_id} not found in Flask database.")
        
    return jsonify({
        "status": "success",
        "message": f"Task completion status changed to {task['completed']}",
        "data": {
            "task": task
        }
    }), 200

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    deleted = TaskModel.delete(task_id)
    if not deleted:
        raise NotFoundError(f"Task with ID {task_id} not found in Flask database.")
        
    return jsonify({
        "status": "success",
        "message": f"Task {task_id} deleted successfully from Flask."
    }), 200
