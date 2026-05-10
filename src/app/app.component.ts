import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Loading } from "./shared/components/loading/loading";
import { enable, isEnabled } from "@tauri-apps/plugin-autostart";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Loading],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  async ngOnInit() {
    if (await isEnabled()) {
      console.log("Autostart allowed");
    } else {
      console.log("Autostart not allowed");
      await enable();
      console.log("Autostart enabled");
    }
  }
}
