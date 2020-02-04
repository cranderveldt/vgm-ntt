import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.component.html',
  styleUrls: ['./add-room.component.scss']
})

export class AddRoomComponent {
  gameForm: FormGroup

  constructor(
    protected dialogRef: NbDialogRef<any>,
    private formBuilder: FormBuilder,
  ) {
    this.gameForm = this.formBuilder.group({ name: '' })
  }

  close() {
    this.dialogRef.close()
  }

  addRoom(data) {
    this.dialogRef.close(data)
  }

}
