import { Injectable } from "@angular/core";
import { IImageItem } from "../api/services/models/imageItem";

@Injectable({
    providedIn: 'root'
})

export class ProcessImageFilesService {
    constructor() { }

    async onImageSelected(event: Event, images: IImageItem[]) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const files = Array.from(input.files);

        const validImages = files.filter(f => f.type.startsWith('image/'));
        if (validImages.length !== files.length) {
            alert('Only images files are permited');
        }

        const imageItems = validImages.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        images.push(...imageItems);

        // Clear value to allow selecting the same images again
        try {
            input.value = '';
        } catch (e) {
            // confiamos en que nunca va a fallar xd.
        }
    }

    removeSelectedImage(index: number, isOrdering: boolean, images: IImageItem[]) {
        if (!isOrdering) {
            URL.revokeObjectURL(images[index].previewUrl);
            images.splice(index, 1);
        }
    }

}