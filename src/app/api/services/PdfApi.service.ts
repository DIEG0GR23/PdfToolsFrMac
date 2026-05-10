import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap, toArray } from "rxjs";
import { environment } from "../../environments/environment";
import { ITools } from "./models/tools";

@Injectable({
    providedIn: "root"
})

export class PdfApiService {
    private apiUrl: string = `${environment.apiUrl}/api/PdfTools`;

    constructor(private http: HttpClient) { }

    getAllTools(): Observable<ITools[]> {
        return this.http.get<ITools[]>(`${this.apiUrl}/getalltools`);
    }

    mergePdfFiles(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/merge`,
            formData,
            {
                responseType: "blob"
            }
        );
    }

    splitPdfFile(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/split`,
            formData,
            {
                responseType: "blob"
            }
        );
    }

    deletePdfPages(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/delete`,
            formData,
            {
                responseType: "blob"
            }
        );
    }

    enumeratePdfPage(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/text`,
            formData,
            {
                responseType: "blob"
            }
        );
    }

    imagesToPdf(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/imagestopdf`,
            formData, {
                responseType: "blob"
            }
        );
    }

    imagesToPdfFixed(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/imagestopdffixed`,
            formData,
            {
                responseType: "blob"
            }
        );
    }

    pdfToImage(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/pdftoimage`,
            formData,
            {
                responseType: "blob"
            }
        );
    }
}