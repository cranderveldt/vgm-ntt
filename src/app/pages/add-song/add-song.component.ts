import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-add-song',
  templateUrl: './add-song.component.html',
  styleUrls: ['./add-song.component.scss']
})
export class AddSongComponent implements OnInit {
  songs$: any
  songForm
  games$: any

  constructor(
    private db: AngularFirestore,
    private formBuilder: FormBuilder,
    private http: HttpService,
  ) {
    this.songs$ = this.db.collection('songs').valueChanges()
    this.songForm = this.formBuilder.group({
      game: '',
      platform: '',
      src: '',
    })
    // this.games$ = this.http.post('https://api-v3.igdb.com/headers', {
    //   api_header: {
    //     header: 'Access-Control-Allow-Origin',
    //     value: '*'
    //   }
    // }).pipe(switchMap((data): any => {
    //   console.log(data)
    //   this.http.post('https://api-v3.igdb.com/games', 'fields name;')
    // }))
  }

  ngOnInit() {
  }

  addSong(songData) {
    console.log(songData)
    this.db.collection('songs').add(songData)
    this.songForm.reset()
  }

  platform(song) {
    return song.platform.split(',').join(', ')
  }

}
