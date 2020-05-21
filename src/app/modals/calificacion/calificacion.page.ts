import { Component, OnInit } from '@angular/core';
import { Platform, NavController, LoadingController, ModalController } from '@ionic/angular';
@Component({
  selector: 'app-calificacion',
  templateUrl: './calificacion.page.html',
  styleUrls: ['./calificacion.page.scss'],
})
export class CalificacionPage implements OnInit {

  c: number;
  comment: string = '';
  colors: any = {
    GREY: "#E0E0E0",
    GREEN: "#76ff03",
    YELLOW: "#FFCA28",
    RED: "#DD2C00"
  }

  constructor(public viewCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CalificacionPage');
  }

  closeModal () {
    this.viewCtrl.dismiss (null, 'close');
  }

  rate (index: number) {
    this.c = index;
  }

  getColor (index: number) {
    let rating;

    rating = this.c;
    
    if (this.isAboveRating (index, rating)) {
      return this.colors.GREY;
    }

    switch (rating) {
      case 1:
      case 2:
        return this.colors.RED;
      case 3:
        return this.colors.YELLOW;
      case 4:
      case 5:
        return this.colors.GREEN;        
      default:
        return this.colors.GREY;
    }
  }

  isAboveRating(index: number, rating: number): boolean {
    return index > rating;
  }

  onSubmit () {
    this.viewCtrl.dismiss ({
      stars: this.c,
      comment: this.comment
    }, 'ok');
  }

  ngOnInit() {
  }

}
