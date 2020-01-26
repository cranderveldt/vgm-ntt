import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { switchMap, take, map, filter } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { NbDialogService } from '@nebular/theme';
import { JoinRoomComponent } from 'src/app/common/join-room/join-room.component';
import { RandomNameService } from 'src/app/services/random-name.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  room$: Observable<any>
  player$: Observable<any>
  song$: Observable<any>
  allReady$: Observable<any>
  playerRef: AngularFirestoreDocument
  roomRef: AngularFirestoreDocument
  userId: string
  roomId: string
  player: any
  status: string
  countdown = 0
  gameForm: FormGroup

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private cookie: CookieService,
    private dialog: NbDialogService,
    private router: Router,
    private randomName: RandomNameService,
    private formBuilder: FormBuilder,
  ) {
    this.gameForm = this.formBuilder.group({ name: '' })
    this.song$ = this.nextSong()
    this.room$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.roomId = params.get('id')
        this.userId = this.cookie.get(`${this.roomId}/playerId`)
        this.loadUser()
        this.roomRef = this.db.doc(`rooms/${this.roomId}`)
        this.playerRef = this.db.doc(`rooms/${this.roomId}/players/${this.userId}`)
        this.player$ = this.playerRef.valueChanges()
        this.allReady$ = this.roomRef.collection('players').valueChanges().pipe(
          filter(players => players.reduce((acc, x) => x.ready && acc, true)),
          take(1)
        )
        this.roomRef.collection('players').get().pipe(map(snapshot => {
          return snapshot.docs.reduce((acc, x) => x.data().ready && acc, true)
        })).subscribe(allReady => this.status = allReady ? 'busy' : 'waiting')
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

  readyUp() {
    this.playerRef.update({ ready: true, readyAt: Date.now() })
    this.allReady$.subscribe(() => this.allReady())
  }

  async allReady() {
    await this.playerRef.update({ allReadyAt: Date.now() })
    this.status = 'countdown'
    this.countdown = 5
    const interval = setInterval(() => {
      this.countdown--
      if (this.countdown <= 0) {
        this.status = 'listening'
        this.player.playVideo()
        clearInterval(interval)
      }
    }, 1000)
  }

  // AVOID DUPLICATES
  nextSong() {
    const random = this.randomName.randomId(20)
    const lowQuery = this.db.collection('songs', ref => {
      return ref.where('__name__', '>=', '0').orderBy('__name__').limit(1)
    }).valueChanges()
    const highQuery = this.db.collection('songs', ref => {
      return ref.where('__name__', '>=', random).orderBy('__name__').limit(1)
    }).valueChanges()

    return highQuery.pipe(
      switchMap(songs => {
        if (songs.length === 0) {
          return lowQuery
        }
        return of(songs)
      }),
      map(songs => songs[0])
    )
  }

  savePlayer(player: any) {
    this.player = player
  }

  resong() {
    this.song$ = this.nextSong()
  }

  reset() {
    this.playerRef.update({ ready: false })
    this.status = 'waiting'
  }

  enterGuess() {
    this.status = 'guessing'
    this.playerRef.update({ guessStartAt: Date.now() })
  }

  submitGuess(data) {
    this.status = 'guessed'
    this.playerRef.update({ guessEndAt: Date.now(), guess: data.name })
  }

}
