import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist'
import { GlobalWorkerOptions } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

@Injectable({
    providedIn: "root"
})

export class PdfService {
    pdfjs = pdfjsLib;

    async loadPdf(
        src: string | ArrayBuffer | Uint8Array) : Promise<pdfjsLib.PDFDocumentProxy> {
            return await pdfjsLib.getDocument(src).promise;
        }
}