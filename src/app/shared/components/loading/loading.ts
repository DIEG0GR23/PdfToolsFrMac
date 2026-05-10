import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common'; 
import { ProgressSpinner } from 'primeng/progressspinner';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-loading',
  imports: [ProgressSpinner, AsyncPipe], 
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
  constructor(public loadingService: LoadingService) { }
}
