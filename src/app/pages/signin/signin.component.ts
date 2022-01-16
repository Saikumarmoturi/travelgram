import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  constructor(
    private router: Router,
    private auth: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }
  onSubmit(f: NgForm) {
    const { email, password } = f.form.value;
    console.log(f.form.value);

    this.auth.signIn(email, password)
      .then((res) => {
        this.toastr.success("Sign In Successs");
        this.router.navigateByUrl('/')
      })
      .catch((err) => {
        this.toastr.error(err.message, '', {
          closeButton: true
        })
      })
  }

}
