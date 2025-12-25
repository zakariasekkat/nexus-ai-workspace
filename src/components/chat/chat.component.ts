import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto animate-enter">
      <header class="mb-6 shrink-0">
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Nexus Assistant</h2>
        <p class="text-slate-500 mt-1">Intelligent strategic advisory system.</p>
      </header>

      <div class="flex-1 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
        <!-- Messages Area -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          @if (messages().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-slate-400 opacity-80">
               <div class="w-24 h-24 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                 <svg class="w-10 h-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
               </div>
               <p class="font-medium text-slate-600">Nexus Online</p>
               <p class="text-sm">Awaiting your queries.</p>
            </div>
          }

          @for (msg of messages(); track msg.id) {
            <div class="flex gap-4 animate-enter" [class.flex-row-reverse]="msg.role === 'user'">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border"
                   [class.bg-white]="msg.role === 'user'"
                   [class.border-indigo-100]="msg.role === 'user'"
                   [class.bg-white]="msg.role === 'model'"
                   [class.border-slate-100]="msg.role === 'model'">
                 @if (msg.role === 'user') {
                   <svg class="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 } @else {
                   <svg class="w-5 h-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
                 }
              </div>
              
              <div class="max-w-[80%] rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm"
                   [class.bg-indigo-600]="msg.role === 'user'"
                   [class.text-white]="msg.role === 'user'"
                   [class.bg-white]="msg.role === 'model'"
                   [class.text-slate-700]="msg.role === 'model'"
                   [class.border]="msg.role === 'model'"
                   [class.border-slate-100]="msg.role === 'model'"
                   [class.rounded-tr-none]="msg.role === 'user'"
                   [class.rounded-tl-none]="msg.role === 'model'">
                {{ msg.text }}
              </div>
            </div>
          }

          @if (loading) {
            <div class="flex gap-4 animate-enter">
              <div class="w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                 <svg class="w-5 h-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
              </div>
              <div class="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-5 text-slate-400 shadow-sm">
                <div class="flex gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                  <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 0.1s"></span>
                  <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 0.2s"></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Input Area -->
        <div class="p-6 bg-white border-t border-slate-100">
          <form (submit)="sendMessage($event)" class="relative">
            <input [(ngModel)]="inputMessage" name="msg" 
                   [disabled]="loading"
                   type="text" 
                   class="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all"
                   placeholder="Enter your command...">
            <button type="submit" [disabled]="!inputMessage.trim() || loading" 
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200">
               <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements AfterViewChecked {
  private gemini = inject(GeminiService);
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  messages = signal<Message[]>([]);
  inputMessage = '';
  loading = false;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.inputMessage.trim()) return;

    const userText = this.inputMessage;
    this.inputMessage = ''; // Clear input immediately
    
    // Add User Message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    this.messages.update(msgs => [...msgs, userMsg]);
    this.loading = true;

    try {
      const response = await this.gemini.chatWithAgent(userText, this.messages());
      
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "Connection to Nexus Core disrupted. Please check credentials.",
        timestamp: new Date()
      };
      this.messages.update(msgs => [...msgs, errorMsg]);
    } finally {
      this.loading = false;
    }
  }
}