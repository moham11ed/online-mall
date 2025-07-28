import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from "./nav-bar/nav-bar";
import { Footer } from "./footer/footer";
import { Stores } from "./stores/stores";
import { About } from "./about/about";
import { Contact } from "./contact/contact";
import { ChatbotComponent } from "./chatbot/chatbot";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Footer, Stores, About, Contact, ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Online-Mall';
}
