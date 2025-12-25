import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Project, Task } from '../../services/state.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-140px)] flex flex-col animate-enter">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Project Protocol</h2>
          <p class="text-slate-500 mt-1">Manage missions and tactical objectives.</p>
        </div>
        <button (click)="showNewProjectModal = true" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Initialize Project
        </button>
      </header>

      <div class="flex-1 flex gap-8 overflow-hidden">
        <!-- Project List -->
        <div class="w-full md:w-80 lg:w-96 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
          @for (project of state.projects(); track project.id; let i = $index) {
            <div (click)="selectProject(project.id)" 
                 class="p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden animate-enter"
                 [style.animation-delay]="i * 50 + 'ms'"
                 [class.bg-white]="state.activeProjectId() !== project.id"
                 [class.border-slate-100]="state.activeProjectId() !== project.id"
                 [class.shadow-sm]="state.activeProjectId() !== project.id"
                 [class.hover:shadow-md]="state.activeProjectId() !== project.id"
                 [class.bg-indigo-600]="state.activeProjectId() === project.id"
                 [class.border-indigo-600]="state.activeProjectId() === project.id"
                 [class.shadow-xl]="state.activeProjectId() === project.id"
                 [class.shadow-indigo-500/25]="state.activeProjectId() === project.id">
              
              <!-- Background decoration for active -->
              @if (state.activeProjectId() === project.id) {
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              }

              <div class="flex justify-between items-start relative z-10">
                <h3 class="font-bold text-lg truncate"
                   [class.text-slate-900]="state.activeProjectId() !== project.id"
                   [class.text-white]="state.activeProjectId() === project.id">
                   {{ project.name }}
                </h3>
                @if (project.imageUrl) {
                  <img [src]="project.imageUrl" class="w-10 h-10 rounded-full object-cover border-2 shadow-sm" [class.border-white]="state.activeProjectId() !== project.id" [class.border-indigo-400]="state.activeProjectId() === project.id" alt="icon">
                }
              </div>
              <p class="text-sm mt-2 line-clamp-2 leading-relaxed" 
                 [class.text-indigo-100]="state.activeProjectId() === project.id"
                 [class.text-slate-500]="state.activeProjectId() !== project.id">
                 {{ project.description }}
              </p>
              <div class="mt-4 flex items-center gap-2 text-xs font-medium relative z-10">
                <span class="px-2.5 py-1 rounded-full"
                      [class.bg-slate-100]="state.activeProjectId() !== project.id"
                      [class.text-slate-600]="state.activeProjectId() !== project.id"
                      [class.bg-indigo-500]="state.activeProjectId() === project.id"
                      [class.text-white]="state.activeProjectId() === project.id">
                  {{ project.tasks.length }} Tasks
                </span>
                <span [class.text-slate-400]="state.activeProjectId() !== project.id"
                      [class.text-indigo-200]="state.activeProjectId() === project.id">
                  {{ project.createdAt | date:'MMM d' }}
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Detail View -->
        <div class="hidden md:flex flex-1 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex-col h-full animate-enter" style="animation-delay: 150ms">
          @if (state.activeProject(); as active) {
            <div class="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 backdrop-blur-xl">
              <div class="max-w-2xl">
                 <div class="flex items-center gap-4 mb-2">
                   <h2 class="text-3xl font-bold text-slate-900">{{ active.name }}</h2>
                   @if (generating) {
                     <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold animate-pulse border border-indigo-100">
                       <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                       AI Processing
                     </span>
                   }
                 </div>
                 <p class="text-slate-500 leading-relaxed">{{ active.description }}</p>
              </div>
              <div class="flex gap-2">
                <button (click)="generateTasks()" [disabled]="generating" class="px-4 py-2 text-sm font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                   <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                   AI Generate Tasks
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-8 bg-slate-50/30">
               @if (active.tasks.length === 0) {
                 <div class="flex flex-col items-center justify-center h-full text-slate-400">
                   <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <svg class="w-8 h-8 text-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
                   </div>
                   <p class="font-medium text-slate-600">No objectives established</p>
                   <p class="text-sm mt-1">Use AI Generate to populate mission parameters.</p>
                 </div>
               }

               <div class="space-y-3">
                 @for (task of active.tasks; track task.id) {
                   <div class="flex items-center gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/40 transition-all group duration-300 transform hover:-translate-y-0.5 animate-enter">
                      <button (click)="toggleTaskStatus(task)" 
                              class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
                              [class.border-emerald-500]="task.status === 'Done'"
                              [class.bg-emerald-500]="task.status === 'Done'"
                              [class.border-slate-300]="task.status !== 'Done'"
                              [class.group-hover:border-indigo-400]="task.status !== 'Done'">
                        @if (task.status === 'Done') {
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        }
                      </button>
                      
                      <div class="flex-1">
                        <h4 class="font-medium text-slate-800 text-lg" [class.line-through]="task.status === 'Done'" [class.text-slate-400]="task.status === 'Done'">
                          {{ task.title }}
                        </h4>
                        <div class="flex items-center gap-3 mt-2">
                           <span class="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">{{ task.estimatedHours }}h est.</span>
                           <span class="text-xs px-2.5 py-1 rounded-md font-medium"
                                 [class.bg-rose-50]="task.priority === 'High'"
                                 [class.text-rose-600]="task.priority === 'High'"
                                 [class.bg-amber-50]="task.priority === 'Medium'"
                                 [class.text-amber-600]="task.priority === 'Medium'"
                                 [class.bg-emerald-50]="task.priority === 'Low'"
                                 [class.text-emerald-600]="task.priority === 'Low'">
                             {{ task.priority }} Priority
                           </span>
                        </div>
                      </div>
                   </div>
                 }
               </div>
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/50">
              <div class="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                 <svg class="w-10 h-10 text-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
              </div>
              <h3 class="text-xl font-bold text-slate-700">No Mission Selected</h3>
              <p class="mt-2 text-slate-500 max-w-xs mx-auto">Select a project from the sidebar to view its tactical objectives and details.</p>
            </div>
          }
        </div>
      </div>

      <!-- New Project Modal -->
      @if (showNewProjectModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-enter">
            <h3 class="text-2xl font-bold text-slate-900 mb-2">Initialize New Project</h3>
            <p class="text-slate-500 mb-6">Define the parameters for your new mission.</p>
            
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Project Codename</label>
                <input [(ngModel)]="newProjectName" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. Operation Skyfall">
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Mission Brief</label>
                <textarea [(ngModel)]="newProjectDesc" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" placeholder="Describe the objective..."></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-8">
              <button (click)="showNewProjectModal = false" class="px-5 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors font-medium">Cancel</button>
              <button (click)="createProject()" [disabled]="!newProjectName" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all">Initialize</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProjectsComponent {
  state = inject(StateService);
  gemini = inject(GeminiService);

  showNewProjectModal = false;
  newProjectName = '';
  newProjectDesc = '';
  generating = false;

  selectProject(id: string) {
    this.state.activeProjectId.set(id);
  }

  createProject() {
    if (!this.newProjectName) return;
    this.state.addProject(this.newProjectName, this.newProjectDesc);
    this.showNewProjectModal = false;
    this.newProjectName = '';
    this.newProjectDesc = '';
  }

  async generateTasks() {
    const project = this.state.activeProject();
    if (!project || this.generating) return;

    this.generating = true;
    try {
      const result = await this.gemini.generateTasks(project.description || project.name);
      if (result && result.tasks) {
        this.state.addTasksToProject(project.id, result.tasks);
      }
    } catch (e) {
      console.error(e);
      alert('AI Generation failed. Check API Key.');
    } finally {
      this.generating = false;
    }
  }

  toggleTaskStatus(task: Task) {
    const project = this.state.activeProject();
    if (!project) return;
    
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    this.state.updateTaskStatus(project.id, task.id, newStatus);
  }
}