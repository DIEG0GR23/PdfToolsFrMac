import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IPdfItem } from '../../../api/services/models/pdfItem';
import { TooltipModule } from 'primeng/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ModalWindows } from '../../../shared/components/modal-windows/modal-windows';
import { ProcessPdfFilesService } from '../../../services/processPdfFiles.service';
import { LoadingService } from '../../../services/loading.service';
import { InputNumber } from "primeng/inputnumber";
import { FormsModule } from '@angular/forms';
import { IPdf } from '../../../api/services/models/pdf';
import { PdfService } from '../../../services/pdf.service';
import { ProcessImageFilesService } from '../../../services/precessImagesFiles.service';
import { IImageItem } from '../../../api/services/models/imageItem';

@Component({
  selector: 'app-file-section',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ButtonModule,
    RouterLink,
    RouterLinkActive,
    DialogModule,
    CardModule,
    ConfirmDialogModule,
    TooltipModule,
    DragDropModule,
    ModalWindows,
    InputNumber,
    FormsModule
  ],
  templateUrl: './file-section.html',
  styleUrl: './file-section.css',
  providers: [MessageService, ConfirmationService]
})
export class FileSection implements OnInit {
  toolId: any;
  toolName: any;
  visible: boolean = false;
  pdfs: IPdfItem[] = [];
  pdf: IPdf | undefined;
  images: IImageItem[] = [];
  pagesToDelete: number[] = [];
  isOrdering: boolean = false;
  startPage: number = 1;
  endPage: number = 1;
  isExpandingPdf: boolean = false;
  pdfExpandedName: string = "";
  expandedPdfPages: string[] = [];
  fixedImages: boolean = false;


  constructor(
    private router: ActivatedRoute,
    private messageService: MessageService,
    private processPdfFilesService: ProcessPdfFilesService,
    private loadingService: LoadingService,
    private pdfService: PdfService,
    private processImagesFilesService: ProcessImageFilesService
  ) { }

  @ViewChild('pdfCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.router.paramMap.subscribe(params => {
      this.toolId = params.get('id');
      this.toolId = parseInt(this.toolId);
      this.toolName = params.get('name');
    });
  }

  async onFileSelected(event: Event) {
    this.loadingService.show();
    if (this.toolId !== 2) {
      await this.processPdfFilesService.onFileSelected(event, this.pdfs);
    }
    else {
      this.pdf = await this.processPdfFilesService.onPdfSelected(event);
    }

    this.openModalWindow();
    this.loadingService.hide();
  }

  addPageToDeleteList(index: number): void {
    if (this.pagesToDelete.includes(index)) {
      this.pagesToDelete.splice(this.pagesToDelete.indexOf(index), 1);
    }
    else {
      this.pagesToDelete.push(index);
    }
    console.log(this.pagesToDelete);
  }

  removeSelectedPdf(index: number): void {
    if (this.toolId === 1) {
      return;
    }
    if (!this.isOrdering) {
      this.processPdfFilesService.removeSelectedPdf(index, this.isOrdering, this.pdfs);
      this.messageService.add({
        severity: 'secondary',
        summary: 'Deleted',
        detail: 'PDF successfully deleted',
        life: 1000
      })
    }
  }

  async onImageSelected(event: Event) {
    this.loadingService.show();
    await this.processImagesFilesService.onImageSelected(event, this.images);
    this.loadingService.hide();
    this.openModalWindow();
  }

  removeSelectedImage(index: number) {
    if (!this.isOrdering) {
      this.processPdfFilesService.removeSelectedPdf(index, this.isOrdering, this.images);
      this.messageService.add({
        severity: 'secondary',
        summary: 'Deleted',
        detail: 'Image successfully deleted',
        life: 1000
      })
    }
  }

  drop(event: CdkDragDrop<IPdfItem[]>) {
    moveItemInArray(this.pdfs, event.previousIndex, event.currentIndex);
  }

  dropImage(event: CdkDragDrop<IImageItem[]>) {
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
  }

  openModalWindow(): void {
    this.visible = true;
  }

  openModalWindowExpandPdf(): void {
    this.isExpandingPdf = true;
  }

  // View PDF pages as thumbnails
  async expandPdf(file: File, name: string) {
    this.loadingService.show();
    this.pdfExpandedName = name;
    this.expandedPdfPages = [];

    setTimeout(async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await this.pdfService.loadPdf(arrayBuffer);

        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }).map(async (_, i) => {
            const page = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
              canvasContext: ctx,
              viewport,
              canvas
            }).promise;

            return canvas.toDataURL('image/png');
          })
        );

        this.expandedPdfPages = pages;
        this.isExpandingPdf = true;
        this.loadingService.hide();
      } catch (error) {
        console.error('Error rendering PDF:', error);
        this.loadingService.hide();
      }
    }, 100);
  }

  // Validations
  showModalPdfToImage(): boolean {
    return this.toolId === 5;
  }

}
