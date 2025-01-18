import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["title", "text"]

  show(title, content) {
    this.titleTarget.innerText = title;
    this.textTarget.innerText = content;
    this.element.classList.remove("hidden");
  }

  hide() {
    this.element.classList.add("hidden");
  }
}
