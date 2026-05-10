import { Injectable } from "@angular/core";
import { IPdfItem } from "../api/services/models/pdfItem";
import { PdfService } from "./pdf.service";
import { IPdf } from "../api/services/models/pdf";

@Injectable({
    providedIn: 'root'
})
export class ProcessPdfFilesService {

    constructor(private pdfService: PdfService) { }

    async onFileSelected(event: Event, pdfs: IPdfItem[]) {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) return;

        const files = Array.from(input.files);

        try {
            const pdfItems = await Promise.all(
                files.map(async file => {
                    const thumbnail = await this.generateThumbnail(file);
                    return { file, thumbnail } as IPdfItem;
                })
            );

            pdfs.push(...pdfItems);
            this.processFiles(files);


        } finally {

        }

        try {
            input.value = '';
        } catch { }
    }

    processFiles(files: File[]) {
        const pdfFiles = files.filter(file =>
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );

        if (pdfFiles.length !== files.length) {
            alert("Solo se permiten archivos PDF");
        }
    }

    async generateThumbnail(file: File): Promise<string> {

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await this.pdfService.loadPdf(arrayBuffer);
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvas,
            canvasContext: ctx,
            viewport
        }).promise;

        return canvas.toDataURL('image/png');
    }

    async onPdfSelected(event: Event): Promise<IPdf | undefined> {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const thumbnails = await this.generateThumbnailSinglePdf(file);

        const pdf: IPdf = { file, thumbnails };

        this.processFiles([file]);

        try {
            input.value = '';
        } catch { }
        console.log(pdf);
        return pdf;
    }

    async generateThumbnailSinglePdf(file: File): Promise<string[]> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await this.pdfService.loadPdf(arrayBuffer);
        const pages = await Promise.all(
            Array.from({ length: pdf.numPages }).map(async (_, i) => {
                const page = await pdf.getPage(i + 1);
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvas,
                    canvasContext: ctx,
                    viewport
                }).promise;

                return canvas.toDataURL('image/png');
            })
        );

        return pages;
    }

    removeSelectedPdf(index: number, isOrdering: boolean, pdfs: IPdfItem[]): void {
        if (!isOrdering) {
            pdfs.splice(index, 1);
        }
    }

    async enumPdfPages(file: File): Promise<void> {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = this.pdfService.loadPdf(arrayBuffer);
    }

}