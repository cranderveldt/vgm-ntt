import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NbDialogService } from '@nebular/theme';
import { AddRoomComponent } from 'src/app/common/add-room/add-room.component';
import { Router } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import { FakerService } from 'src/app/services/faker.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent {
  rooms$: any

  constructor(
    private db: AngularFirestore,
    private dialog: NbDialogService,
    private router: Router,
    private faker: FakerService,
  ) {
    this.rooms$ = this.db.collection('rooms').valueChanges({ idField: 'id' })
  }

  addRoom() {
    const ref = this.dialog.open(AddRoomComponent)

    ref.onClose.pipe(take(1), filter(x => x)).subscribe(async data => {
      this.db.collection('songs').get().subscribe(async snapshot => {
        data.songs = this.faker.shuffleArray(snapshot.docs).map(x => x.id).slice(0, 15)
        const roomData = await this.db.collection('rooms').add(data)
        this.router.navigate(['/room', roomData.id])
      })
    })
  }

}
