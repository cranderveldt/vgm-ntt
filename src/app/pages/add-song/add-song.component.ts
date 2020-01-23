import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-song',
  templateUrl: './add-song.component.html',
  styleUrls: ['./add-song.component.scss']
})
export class AddSongComponent implements OnInit {
  songs$: any
  songForm

  constructor(
    private db: AngularFirestore,
    private formBuilder: FormBuilder,
  ) {
    this.songs$ = this.db.collection('songs').valueChanges()
    this.songForm = this.formBuilder.group({
      game: '',
      platform: '',
      src: '',
    })
  }

  ngOnInit() {
  }

  addSong(songData) {
    console.log(songData)
    this.db.collection('songs').add(songData)
    this.songForm.reset()
  }

}
