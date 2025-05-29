import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule   
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    history.pushState(null, '', window.location.href);
    window.onpopstate = () => history.pushState(null, '', window.location.href);
  }

  logout(): void {
    localStorage.clear();
    // You'll still use ToastrService in other components if needed
    this.router.navigate(['/login']);
  }
}
