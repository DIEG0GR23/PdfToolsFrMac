import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { IPdfItem } from '../../../api/services/models/pdfItem';
import { ProcessPdfFilesService } from '../../../services/processPdfFiles.service';
import { TooltipModule } from 'primeng/tooltip';
import { PdfApiService } from '../../../api/services/PdfApi.service';
import { LoadingService } from '../../../services/loading.service';
import { FormsModule } from '@angular/forms';
import { IPdf } from '../../../api/services/models/pdf';
import { IImageItem } from '../../../api/services/models/imageItem';
import { ProcessImageFilesService } from '../../../services/precessImagesFiles.service';
import { writeFile } from '@tauri-apps/plugin-fs';
import { openPath } from '@tauri-apps/plugin-opener';
import { downloadDir, join } from '@tauri-apps/api/path';

@Component({
  selector: 'app-modal-windows',
  imports: [DialogModule, Button, TooltipModule, FormsModule],
  templateUrl: './modal-windows.html',
  styleUrl: './modal-windows.css',
})
export class ModalWindows {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() header: string = "";
  @Input() toolId: number = 0;
  @Input() multipleFiles: boolean = false;
  @Input() canOrder: boolean = false;
  @Input() size: 'small' | 'large' | 'pdf' = 'large';
  @Input() pdfs: IPdfItem[] = [];
  @Input() isOrdering: boolean = false;
  @Output() isOrderingChange = new EventEmitter<boolean>();
  @Input() startPage: number = 0;
  @Output() startPageChange = new EventEmitter<number>();
  @Input() endPage: number = 0;
  @Output() endPageChange = new EventEmitter<number>();
  @Input() pagesToDelete: number[] = [];
  @Input() pdf: IPdf | undefined;
  @Output() pdfChange = new EventEmitter<IPdf | undefined>();
  @Input() images: IImageItem[] = [];
  @Input() isExpandingPdfWindow: boolean = false;
  @Input() fixedImages: boolean = false;
  @Output() fixedImagesChange = new EventEmitter<boolean>();

  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private processPdfFilesService: ProcessPdfFilesService,
    private pdfApiService: PdfApiService,
    private loadingService: LoadingService,
    private processImageFilesService: ProcessImageFilesService) { }

  updateVisibleValue(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(this.visible);
  }

  updateIsOrderingValue(isOrdering: boolean): void {
    this.isOrdering = isOrdering;
    this.isOrderingChange.emit(this.isOrdering);
  }

  updateFixedImagesValue(fixedImages: boolean): void {
    this.fixedImages = fixedImages;
    this.fixedImagesChange.emit(this.fixedImages);
    console.log(this.fixedImages);
  }

  updateStartPageValue(startPage: number): void {
    this.startPage = startPage;
    this.startPageChange.emit(this.startPage);
  }

  updateEndPageValue(endPage: number): void {
    this.endPage = endPage;
    this.endPageChange.emit(this.endPage);
  }

  async onFileSelected(event: Event) {
    if (this.toolId !== 0) {
      this.pdfs.length = 0;
    }
    this.loadingService.show();
    if (this.toolId !== 2) {
      await this.processPdfFilesService.onFileSelected(event, this.pdfs);
    }
    else {
      this.pdf = await this.processPdfFilesService.onPdfSelected(event);
      this.pdfChange.emit(this.pdf);
    }
    this.loadingService.hide();
  }

  async onImageSelected(event: Event) {
    this.loadingService.show();
    await this.processImageFilesService.onImageSelected(event, this.images);
    this.loadingService.hide();
  }

  closeModalWindow(event: Event): void {
    if (this.pdfs.length !== 0 || this.pdf || this.images.length !== 0) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: 'Do you want to discard the files?',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancel',
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: {
          label: 'Delete',
          severity: 'danger',
        },

        accept: () => {
          this.messageService.add({
            severity: 'info', summary: 'Canceled', detail: 'Files deleted'
          });

          this.images.length = 0;
          this.pdfs.length = 0;
          this.pdf = undefined;
          this.pagesToDelete.length = 0;
          this.visible = false;
          this.isOrdering = false;
          this.fixedImages = false;
        },
        reject: () => {
          // this.messageService.add({ /*No hace nada.jpg */ });
        },
      });
    }
    else {
      this.visible = false;
    }
  }

  sendFiles(): void {
    this.loadingService.show();
    const option: number = this.toolId;

    const formData = new FormData();

    switch (option) {
      case 0:
        this.pdfs.forEach(pdf => {
          formData.append('files', pdf.file, pdf.file.name);
        });

        this.pdfApiService.mergePdfFiles(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, "merge", false);

            this.pdfs.length = 0;
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error procesing PDFs'
            });
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        });
        break;

      case 1:
        if (this.pdfs.length > 0) {
          formData.append('File', this.pdfs[0].file, this.pdfs[0].file.name);
        }
        formData.append('StartPage', this.startPage.toString());
        formData.append('EndPage', this.endPage.toString());

        this.pdfApiService.splitPdfFile(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, this.pdfs[0].file.name + " [split]", false);

            this.updateStartPageValue(1);
            this.updateEndPageValue(1);

            this.pdfs.length = 0;
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error procesing PDFs'
            });
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        });
        break;

      case 2:
        if (!this.pdf?.file) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No PDF file selected'
          });
          this.loadingService.hide();
          return;
        }

        formData.append('File', this.pdf.file, this.pdf.file.name);
        // ASP.NET Core expects multiple fields with the same name for List<int>
        this.pagesToDelete.forEach(page => {
          formData.append('PagesToDelete', page.toString());
        });

        this.pdfApiService.deletePdfPages(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, this.pdf!.file.name + " [deleted]", false);

            this.pdfs.length = 0;
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error procesing PDFs'
            });
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        });
        break;
      case 3:
        if (this.startPage > 0) this.startPage -= 1;
        if (this.pdfs.length > 0) {
          formData.append('File', this.pdfs[0].file, this.pdfs[0].file.name);
          console.log(this.startPage);
        }
        formData.append('StartPage', this.startPage.toString());
        this.pdfApiService.enumeratePdfPage(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, this.pdfs[0].file.name + " [enumeratedPages]", false);

            this.updateStartPageValue(1);
            this.pdfs.length = 0;
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error procesing PDFs'
            });
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        })
        break;
      case 4:
        if (this.images.length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No images selected'
          });
          this.loadingService.hide();
          return;
        }
        if (this.fixedImages) {
          this.images.forEach(image => {
            formData.append('images', image.file, image.file.name);
          });

          this.pdfApiService.imagesToPdfFixed(formData).subscribe({
            next: (blob: Blob) => {
              this.openPdf(blob, "[imagesToPdfFixed]", false);

              this.images.length = 0;
              this.visible = false;
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error processing images'
              });
              this.loadingService.hide();
            },
            complete: () => {
              this.loadingService.hide();
            }
          });
        }
        else {
          this.images.forEach(image => {
            formData.append('images', image.file, image.file.name);
          });

          this.pdfApiService.imagesToPdf(formData).subscribe({
            next: (blob: Blob) => {
              this.openPdf(blob, "[imagesToPdf]", false);

              this.images.length = 0;
              this.visible = false;
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error processing images'
              });
              this.loadingService.hide();
            },
            complete: () => {
              this.loadingService.hide();
            }
          });
        }
        break;
      case 5:
        if (this.pdfs.length > 0) {
          formData.append('file', this.pdfs[0].file, this.pdfs[0].file.name);
        }
        this.pdfApiService.pdfToImage(formData).subscribe({
          next: (blob: Blob) => {
            this.openPdf(blob, "[pdfToImages]", true);

            this.pdfs.length = 0;
            this.visible = false;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error proccesing the PDF'
            });
            this.loadingService.hide();
          },
          complete: () => {
            this.loadingService.hide();
          }
        });

        break;
    }
  }

  private async openPdf(blob: Blob, fileName: string, zip: boolean): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const downloadsPath = await downloadDir();
      let filePath;
      if (zip) {
        filePath = await join(downloadsPath, `${fileName}.zip`);
      } else {
        filePath = await join(downloadsPath, `${fileName}.pdf`);
      }

      await writeFile(filePath, uint8Array);

      await openPath(filePath);

      this.messageService.add({
        severity: 'success',
        summary: 'Ready',
        detail: 'File generated and opened successfully'
      });

    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Can not generated/open the file correctly'
      });
    }
  }

  messageActiveOrder(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Order active',
      detail: 'Drag and drop files to change order',
      life: 2000
    });
  }

  messageDesactiveOrder(): void {
    this.messageService.add({
      severity: 'secondary',
      summary: 'Order desactivated',
      detail: 'Drag and drop files to change order',
      life: 2000
    });
  }

  printStartPageAndEndPage(): void {
    console.log("StartPage: " + this.startPage + " EndPage: " + this.endPage);
  }
}
