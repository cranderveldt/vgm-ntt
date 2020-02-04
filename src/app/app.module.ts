import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { HomeComponent } from './pages/home/home.component';
import { NbLayoutModule, NbThemeModule, NbButtonModule, NbListModule, NbCardModule, NbInputModule, NbActionsModule, NbDialogModule, NbIconModule } from '@nebular/theme';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { AddSongComponent } from './pages/add-song/add-song.component';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { ReactiveFormsModule } from '@angular/forms';
import { RoomComponent } from './pages/room/room.component';
import { CookieService } from 'ngx-cookie-service';
import { JoinRoomComponent } from './common/join-room/join-room.component';
import { AddRoomComponent } from './common/add-room/add-room.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomsComponent,
    AddSongComponent,
    RoomComponent,
    JoinRoomComponent,
    AddRoomComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    NbLayoutModule,
    NbButtonModule,
    NbListModule,
    NbCardModule,
    NbInputModule,
    NbActionsModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbDialogModule.forRoot(),
    NbEvaIconsModule,
    NbIconModule,
    NgxYoutubePlayerModule.forRoot(),
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ],
  entryComponents: [
    JoinRoomComponent,
    AddRoomComponent,
  ]
})
export class AppModule { }
