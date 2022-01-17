import { Component, OnInit } from '@angular/core';
//service
import { AuthService } from 'src/app/services/auth.service';
//forms
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
//firebase
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
//browser image resizer
import { readAndCompressImage } from 'browser-image-resizer';
//getting configurations
import { imageConfig } from './../../../utils/config';
//generating random uuid
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css']
})
export class AddpostComponent implements OnInit {

  locationName: string;
  description: string;
  picture: string = null;
  user = null;
  uploadPercent: number = null;
  constructor(
    private auth: AuthService,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private router: Router
  ) {
    auth.getUser().subscribe((user) => {
      this.db.object(`/users/${user.uid}`)
        .valueChanges()
        .subscribe((user) => {
          this.user = user;
          console.log(user);

        })
    })
  }

  onSubmit() {
    const uid = uuidv4();
    this.db.object(`/posts/${uid}`)
      .set({
        id: uid,
        locationName: this.locationName,
        description: this.description,
        picture: this.picture,
        by: this.user.name,
        instaId: this.user.instaUser,
        date: Date.now()
      })
      .then(() => {
        this.toastr.success("Post added Successfully")
        this.router.navigateByUrl("/");
      })
      .catch((err) => {
        this.toastr.error("Oops")
      })
  }

  async uploadFile(event) {
    const file = event.target.files[0];
    let resizedImg = await readAndCompressImage(file, imageConfig);
    const filePath = file.name;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, resizedImg);
    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage
    })
    task.snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success("Image Upload Success")
          })

        })
      )
      .subscribe()
  }
  ngOnInit(): void {
  }

}
