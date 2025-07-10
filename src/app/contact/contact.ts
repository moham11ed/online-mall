import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
   onSubmit() {
    // Handle form submission
    console.log('Form submitted');
  }
}
