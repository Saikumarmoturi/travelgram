import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
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
import * as uuid from 'uuid';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  picture: string = "https://learnyst.s3.amazonaws.com/assets/schools/2410/resources/images/logo_lco_i3oab.png";
  uploadPercent: number = null;
  constructor(
    private router: Router,
    private auth: AuthService,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  onSubmit(f: NgForm) {
    const { email, password, username, country, bio, name } = f.form.value;
    //further checks can be done here
    this.auth.signUp(email, password)
      .then((res) => {
        console.log(res);
        const { uid } = res.user;
        this.db.object(`/users/${uid}`)
          .set({
            id: uid,
            name: name,
            email: email,
            instaUser: username,
            country: country,
            bio: bio,
            picture: this.picture
          })
      })
      .then(() => {
        this.router.navigateByUrl('/')
        this.toastr.success("Sign Up Success")
      })
      .catch((err) => {
        this.toastr.error("Sign Up failed");
        console.log(err);

      })

  }

  async uploadFile(event) {
    const file = event.target.files[0];
    let resizedImg = await readAndCompressImage(file, imageConfig);
    // const filePath = file.name; //rename the image with uuid TODO:UUID
    const filePath = uuid.v4();
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, resizedImg);
    task.percentageChanges().subscribe((percentge) => {
      this.uploadPercent = percentge;
    })
    task.snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success("Picture Uploaded Succesfully")
          })
        })
      )
      .subscribe()
  }

}
