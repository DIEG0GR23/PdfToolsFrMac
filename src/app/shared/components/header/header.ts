import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from "primeng/button";

@Component({
  selector: 'app-header',
  imports: [Button, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  darkMode: boolean = false;

  private readonly storageKey = 'pdftools-dark-mode';

  ngOnInit(): void {
    const saved = localStorage.getItem(this.storageKey);
    const enabled = saved === 'true';
    this.darkMode = enabled;
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('my-app-dark');
    } else {
      root.classList.remove('my-app-dark');
    }
  }

  toogleDarkMode(): void {
    const root = document.documentElement;
    const now = root.classList.toggle('my-app-dark');
    this.darkMode = now;
    try {
      localStorage.setItem(this.storageKey, now ? 'true' : 'false');
    } catch {
      // ignore storage errors
    }
  }

  darkModeEnables(): boolean {
    return this.darkMode;
  }
}
