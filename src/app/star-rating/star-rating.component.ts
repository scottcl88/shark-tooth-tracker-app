import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent implements OnInit {

  selectedRating: number = 0;
  
  @Output() onRateChange = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {}

  setRating(rating: number): void {
    this.selectedRating = rating;
    let newRating = 5 - rating + 1;
    console.log("setRating: ", newRating);
    this.onRateChange.emit(newRating);
  }

}
