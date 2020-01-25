import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { switchMap, take } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { NbDialogService } from '@nebular/theme';
import { JoinRoomComponent } from 'src/app/common/join-room/join-room.component';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  room$: Observable<any>
  roomRef: AngularFirestoreDocument
  userId: string
  roomId: string

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private cookie: CookieService,
    private dialog: NbDialogService,
    private router: Router,
  ) {
    this.room$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.roomId = params.get('id')
        this.userId = this.cookie.get(`${this.roomId}/playerId`)
        this.loadUser()
        this.roomRef = this.db.doc(`rooms/${this.roomId}`)
        return this.roomRef.valueChanges().pipe(switchMap(room => of({
            ...room,
            players$: this.roomRef.collection('players').valueChanges()
          })
        ))
      })
    )
  }

  loadUser() {
    if (!this.userId) {
      this.newUser()
    }
  }

  newUser() {
    const ref = this.dialog.open(JoinRoomComponent, { context: {
      roomId: this.roomId,
    }})

    ref.onClose.pipe(take(1)).subscribe(async data => {
      if (data) {
        const userData = await this.roomRef.collection('players').add(data)
        this.userId = userData.id
        this.cookie.set(`${this.roomId}/playerId`, this.userId)
      } else {
        this.router.navigate(['/rooms'])
      }
    })
  }

}
