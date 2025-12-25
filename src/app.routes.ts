import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { VisionComponent } from './components/vision/vision.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'vision', component: VisionComponent },
  { path: 'chat', component: ChatComponent }
];