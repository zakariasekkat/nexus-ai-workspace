import { Injectable, signal, computed } from '@angular/core';

export interface Task {
  id: string;
  title: string;
  estimatedHours: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Done';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  imageUrl?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  readonly projects = signal<Project[]>([
    {
      id: '1',
      name: 'Alpha Protocol',
      description: 'Initial system bootstrap and core module development.',
      createdAt: new Date(),
      tasks: [
        { id: 't1', title: 'Setup Repo', estimatedHours: 2, priority: 'High', status: 'Done' },
        { id: 't2', title: 'Design Database', estimatedHours: 5, priority: 'High', status: 'In Progress' },
        { id: 't3', title: 'API Gateway', estimatedHours: 8, priority: 'Medium', status: 'Todo' }
      ]
    }
  ]);

  readonly activeProjectId = signal<string | null>('1');

  readonly activeProject = computed(() => 
    this.projects().find(p => p.id === this.activeProjectId()) || null
  );

  readonly totalTasks = computed(() => 
    this.projects().reduce((acc, p) => acc + p.tasks.length, 0)
  );

  readonly completedTasks = computed(() => 
    this.projects().reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'Done').length, 0)
  );

  addProject(name: string, description: string) {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      tasks: [],
      createdAt: new Date()
    };
    this.projects.update(projects => [...projects, newProject]);
    this.activeProjectId.set(newProject.id);
  }

  addTasksToProject(projectId: string, tasks: any[]) {
    this.projects.update(projects => 
      projects.map(p => {
        if (p.id === projectId) {
          const newTasks = tasks.map(t => ({
            ...t,
            id: crypto.randomUUID(),
            status: 'Todo'
          }));
          return { ...p, tasks: [...p.tasks, ...newTasks] };
        }
        return p;
      })
    );
  }

  updateTaskStatus(projectId: string, taskId: string, status: 'Todo' | 'In Progress' | 'Done') {
    this.projects.update(projects =>
      projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t)
          };
        }
        return p;
      })
    );
  }

  setProjectImage(projectId: string, imageUrl: string) {
    this.projects.update(projects => 
      projects.map(p => p.id === projectId ? { ...p, imageUrl } : p)
    );
  }
}