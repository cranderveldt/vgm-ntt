import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  rooms$: any

  constructor(
    private db: AngularFirestore,
  ) {
    this.rooms$ = this.db.collection('rooms').valueChanges()
  }

  ngOnInit() {
  }

}
