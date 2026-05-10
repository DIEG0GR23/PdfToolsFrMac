import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { PdfApiService } from '../../../api/services/PdfApi.service';
import { ITools } from '../../../api/services/models/tools';
import { Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-home-menu',
  imports: [CardModule, ButtonModule, CommonModule, Tooltip],
  templateUrl: './home-menu.html',
  styleUrl: './home-menu.css',
})
export class HomeMenu implements OnInit{
  isLoading: boolean = false;
  toolsInfo: ITools [] = [];
  errorMessage: string = '';
  visible: boolean = false;

  constructor(private pdfApiService: PdfApiService, private router: Router) {}

  ngOnInit(): void {
    this.onLoadTools();
  }

  onLoadTools(): void {
    this.isLoading = true;
    this.pdfApiService.getAllTools().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.toolsInfo = data;
        console.log('Tools loaded: ', this.toolsInfo);
        console.log(typeof(this.toolsInfo));
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = "Error loading tools: " + error;
        alert(this.errorMessage);
      }
    })
  }

  navigateToFileSection(toolId: number, toolName: string): void{
    this.router.navigate(['/file-section', toolName, toolId]);
  }
}
