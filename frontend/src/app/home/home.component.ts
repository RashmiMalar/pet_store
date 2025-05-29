import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  showBackToTop: boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private location: Location
  ) {
    const loggedIn = localStorage.getItem('isLoggedIn');
    this.isLoggedIn = loggedIn === 'true';
  }
  navbarOpen = false;

toggleNavbar() {
  this.navbarOpen = !this.navbarOpen;
}


  ngOnInit(): void {
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
  }

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
  }

  toggleLogin() {
    if (this.isLoggedIn) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      this.isLoggedIn = false;
      this.toastr.success('You have been signed out.', 'Success');
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}