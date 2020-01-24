import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { RoomComponent } from './pages/room/room.component';
import { AddSongComponent } from './pages/add-song/add-song.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'room/:id', component: RoomComponent },
  { path: 'add-song', component: AddSongComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
