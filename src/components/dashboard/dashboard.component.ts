import { Component, ElementRef, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

declare const d3: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-enter">
      <header class="mb-10">
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Overview</h2>
        <p class="text-slate-500 mt-1">Welcome back. Here's what's happening today.</p>
      </header>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 animate-enter" style="animation-delay: 50ms">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative">
            <p class="text-slate-500 font-medium text-sm">Active Projects</p>
            <h3 class="text-4xl font-bold text-slate-900 mt-2 tracking-tight">{{ state.projects().length }}</h3>
            <div class="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              <span>+12% vs last week</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 animate-enter" style="animation-delay: 100ms">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative">
            <p class="text-slate-500 font-medium text-sm">Tasks Completed</p>
            <h3 class="text-4xl font-bold text-slate-900 mt-2 tracking-tight">{{ state.completedTasks() }} <span class="text-xl text-slate-400 font-normal">/ {{ state.totalTasks() }}</span></h3>
            <div class="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
               <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="(state.totalTasks() > 0 ? (state.completedTasks() / state.totalTasks() * 100) : 0)"></div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 animate-enter" style="animation-delay: 150ms">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-sky-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative">
            <p class="text-slate-500 font-medium text-sm">Efficiency Rate</p>
            <h3 class="text-4xl font-bold text-slate-900 mt-2 tracking-tight">
              {{ (state.totalTasks() > 0 ? (state.completedTasks() / state.totalTasks() * 100) : 0) | number:'1.0-0' }}%
            </h3>
            <p class="text-xs text-slate-400 mt-4">Based on task completion velocity</p>
          </div>
        </div>
      </div>

      <!-- Analytics Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-enter" style="animation-delay: 200ms">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Task Priority Distribution</h3>
          <div #chartContainer class="w-full h-64 flex items-center justify-center"></div>
        </div>

        <div class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col animate-enter" style="animation-delay: 250ms">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div class="flex-1 overflow-y-auto pr-2 space-y-4">
             @for (project of state.projects(); track project.id) {
               <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group">
                 <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 text-indigo-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                 </div>
                 <div>
                   <p class="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{{ project.name }}</p>
                   <p class="text-xs text-slate-500 mt-0.5">Updated {{ project.createdAt | date:'shortDate' }} • {{ project.tasks.length }} tasks pending</p>
                 </div>
               </div>
             }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  state = inject(StateService);
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  constructor() {
    effect(() => {
      // Re-render chart when projects change
      const projects = this.state.projects(); // Dependency
      this.renderChart();
    });
  }

  renderChart() {
    if (!this.chartContainer) return;
    
    // Clear previous
    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    const tasks = this.state.projects().flatMap(p => p.tasks);
    const data = [
      { label: 'High', value: tasks.filter(t => t.priority === 'High').length, color: '#f43f5e' }, // Rose 500
      { label: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: '#fbbf24' }, // Amber 400
      { label: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: '#34d399' } // Emerald 400
    ].filter(d => d.value > 0);

    if (data.length === 0) {
      d3.select(this.chartContainer.nativeElement)
        .append('div')
        .attr('class', 'flex flex-col items-center justify-center h-full text-slate-400')
        .html(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span class="text-sm">No data available</span>
        `);
      return;
    }

    const width = 300;
    const height = 250;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d: any) => d.value).sort(null);
    const arc = d3.arc().innerRadius(80).outerRadius(radius).cornerRadius(6);

    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => d.data.color)
      .attr('stroke', '#ffffff')
      .style('stroke-width', '3px')
      .style('cursor', 'pointer')
      .on('mouseover', function(this: any) {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1.05)');
      })
      .on('mouseout', function(this: any) {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
      });
      
    // Center Text
    svg.append('text')
       .attr('text-anchor', 'middle')
       .attr('dy', '-0.5em')
       .style('font-size', '24px')
       .style('font-weight', 'bold')
       .style('fill', '#1e293b')
       .text(tasks.length);

    svg.append('text')
       .attr('text-anchor', 'middle')
       .attr('dy', '1em')
       .style('font-size', '12px')
       .style('fill', '#64748b')
       .text('Total Tasks');
  }
}