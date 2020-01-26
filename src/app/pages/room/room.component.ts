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
import { firestore } from 'firebase';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  room$: Observable<any>
  player$: Observable<any>
  song: any
  songs: any[]
  allReady$: Observable<any>
  allDone$: Observable<any>
  winner$: Observable<any>
  playerScores$: Observable<any>
  playerRef: AngularFirestoreDocument
  roomRef: AngularFirestoreDocument
  userId: string
  roomId: string
  video: any
  status: string
  guess: string
  countdown = 0
  gameForm: FormGroup
  timestamps = {
    guessStartAt: null,
    guessEndAt: null,
    readyAt: null,
    allReadyAt: null,
  }
  correct: boolean
  winner: boolean

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
    this.loadSongs()
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
        this.allDone$ = this.roomRef.collection('players').valueChanges().pipe(
          filter(players => players.reduce((acc, x) => x.done && acc, true)),
          take(1)
        )
        this.playerScores$ = this.roomRef.collection('players').valueChanges({ idField: 'id' }).pipe(
          filter(players => players.reduce((acc, player) => acc && typeof player.correct === 'boolean', true)),
          take(1)
        )
        this.winner$ = this.roomRef.collection('players').valueChanges({ idField: 'id' }).pipe(
          map(players => players.filter((player) => player.winner && player.id !== this.userId)),
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
    this.song = null
    this.playerRef.update({ ready: true, done: false, correct: null })
    this.timestamps.readyAt = Date.now()
    this.allReady$.subscribe(() => this.allReady())
  }

  allReady() {
    this.timestamps.allReadyAt = Date.now()
    this.status = 'countdown'
    this.countdown = 5
    this.song = this.songs.pop()
    const interval = setInterval(() => {
      this.countdown--
      if (this.countdown <= 0) {
        clearInterval(interval)
        this.beginRound()
      }
    }, 1000)
  }

  loadSongs() {
    this.db.collection('songs').get().subscribe(snapshot => {
      this.songs = this.randomName.shuffleArray(snapshot.docs).map(x => x.data())
    })
  }

  saveVideo(video: any) {
    this.video = video
  }

  reset() {
    this.playerRef.update({ ready: false, done: false, winner: false, correct: null })
    this.status = 'waiting'
  }

  beginRound() {
    this.status = 'listening'
    this.video.playVideo()

    this.countdown = 30
    const interval = setInterval(() => {
      this.countdown--
      if (this.countdown <= 0) {
        this.roundComplete()
        clearInterval(interval)
      }
    }, 1000)

    this.allDone$.subscribe(() => {
      this.roundComplete()
      clearInterval(interval)
    })
  }

  enterGuess() {
    this.status = 'guessing'
    this.timestamps.guessStartAt = Date.now()
  }

  submitGuess(data) {
    this.status = 'guessed'
    this.guess = data.name
    this.timestamps.guessEndAt = Date.now()
    this.gameForm.reset()
    this.playerRef.update({ done: true })
  }

  roundComplete() {
    this.status = 'complete'
    this.countdown = 0
    this.video.stopVideo()
    this.correct = this.song.game === this.guess
    this.playerScores$.subscribe(players => this.showScores(players))
    setTimeout(() => {
      // TODO: Better comparative logic here so we can use regex or something
      if (this.correct) {
        this.playerRef.update({
          winner: false,
          correct: true,
          start: this.timestamps.guessStartAt - (this.timestamps.allReadyAt + 5000),
          end: this.timestamps.guessEndAt - (this.timestamps.allReadyAt + 5000),
        })
      } else {
        this.playerRef.update({ correct: false, winner: false })
      }
    }, 2000)
  }

  msToSeconds(ms: number) {
    const tenths = Math.floor(ms / 100)
    return `${Math.floor(tenths / 10)}.${tenths % 10} seconds`
  }

  differenceInSeconds(stamp) {
    const tenths = Math.floor((stamp - (this.timestamps.allReadyAt + 5000)) / 100)
    return `${Math.floor(tenths / 10)}.${tenths % 10} seconds`
  }

  showScores(players) {
    // this.status = 'complete'
    const winners = players.filter(x => x.correct).sort((a, b) => a.start - b.start)
    let winner = winners[0]
    if (winners.length > 1) {
      const fastWinners = winners.filter(x => Math.abs(x.start - winner.start) < 1000).sort((a, b) => a.end - b.end)
      winner = fastWinners[0]
    }

    this.winner = winner && winner.id === this.userId
    if (this.winner) {
      this.playerRef.update({ winner: true, score: firestore.FieldValue.increment(1), ready: false })
    }

  }

}
