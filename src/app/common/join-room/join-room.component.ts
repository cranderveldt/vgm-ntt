import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RandomNameService } from 'src/app/services/random-name.service';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.scss']
})
export class JoinRoomComponent {
  @Input() roomId: string
  gameForm: FormGroup
  userId: string

  constructor(
    protected dialogRef: NbDialogRef<any>,
    private formBuilder: FormBuilder,
    private randomName: RandomNameService,
  ) {
    this.gameForm = this.formBuilder.group({
      name: this.randomName.randomName(),
      score: 0,
    })
  }

  rename() {
    this.gameForm.patchValue({ name: this.randomName.randomName() })
  }

  close() {
    this.dialogRef.close()
  }

  joinRoom(data) {
    this.dialogRef.close(data)
  }

}
