import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-vision',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col max-w-6xl mx-auto animate-enter">
      <header class="mb-10">
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Vision Studio</h2>
        <p class="text-slate-500 mt-1">Generate conceptual imagery for your projects.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Controls -->
        <div class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-enter" style="animation-delay: 100ms">
          <label class="block text-sm font-bold text-slate-700 mb-2">Target Project</label>
          <div class="relative mb-8">
            <select [(ngModel)]="selectedProjectId" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer">
              <option [ngValue]="null">Select a project...</option>
              @for (p of state.projects(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <label class="block text-sm font-bold text-slate-700 mb-2">Visual Prompt</label>
          <textarea [(ngModel)]="prompt" rows="6" 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 mb-8 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none transition-all placeholder:text-slate-400" 
            placeholder="Describe the image you want to generate... e.g. A futuristic city skyline with neon lights"></textarea>
          
          <button (click)="generate()" 
                  [disabled]="!prompt || generating || !selectedProjectId"
                  class="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
            @if (generating) {
              <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Rendering...
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 3 2.5 2.5 0 0 0 0 2 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0 3-1.98 2.5 2.5 0 0 0 .46-4.96 2.5 2.5 0 0 0-3-1.32A2.5 2.5 0 0 0 12 4.5z"/><path d="m12 12-3 3"/><path d="m15 15-3-3"/></svg>
              Generate Asset
            }
          </button>
        </div>

        <!-- Preview -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex items-center justify-center relative aspect-video group animate-enter" style="animation-delay: 200ms">
          @if (generatedImage) {
            <img [src]="generatedImage" class="w-full h-full object-cover animate-enter" alt="Generated Result">
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-24 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button (click)="saveToProject()" class="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors w-full shadow-lg">
                Set as Project Icon
              </button>
            </div>
          } @else {
            <div class="text-center text-slate-400 p-8">
              <div class="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 mx-auto mb-6 flex items-center justify-center">
                 <svg class="w-10 h-10 text-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p class="text-lg font-bold text-slate-700">No asset generated</p>
              <p class="text-sm mt-1 max-w-xs mx-auto">Enter a prompt to initialize the rendering sequence.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class VisionComponent {
  gemini = inject(GeminiService);
  state = inject(StateService);

  prompt = '';
  selectedProjectId: string | null = null;
  generating = false;
  generatedImage: string | null = null;

  async generate() {
    if (!this.prompt) return;
    this.generating = true;
    this.generatedImage = null;

    try {
      this.generatedImage = await this.gemini.generateConceptArt(this.prompt);
    } catch (e) {
      console.error(e);
      alert('Generation failed. Limit may be reached.');
    } finally {
      this.generating = false;
    }
  }

  saveToProject() {
    if (this.selectedProjectId && this.generatedImage) {
      this.state.setProjectImage(this.selectedProjectId, this.generatedImage);
      alert('Project icon updated successfully.');
    }
  }
}