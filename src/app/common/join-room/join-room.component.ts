import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FakerService } from 'src/app/services/faker.service';

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
    private faker: FakerService,
  ) {
    this.gameForm = this.formBuilder.group({
      name: this.faker.randomName(),
      score: 0,
      ready: false,
    })
  }

  rename() {
    this.gameForm.patchValue({ name: this.faker.randomName() })
  }

  close() {
    this.dialogRef.close()
  }

  joinRoom(data) {
    this.dialogRef.close(data)
  }

}
