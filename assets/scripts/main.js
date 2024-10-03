const cum = document.querySelector(
  "body > div > ul > li:nth-child(2) > a > h3"
);

cum.innerText = `<script>alert('Body Semen')</script>`;

import { inputArray } from "./input.js";

const facList = document.querySelector(".factions-list");

for (const hero of inputArray) {
  const el = document.createElement("li");

  el.innerHTML = `
    <a href="ajiasnasgpasng">
              <div class="hero-avatar">
                <img src="/assets/images/heroes/${hero.image}" alt="">
                <div class="badge">
                  <img src="/assets/images/icons/badge.png" alt="">
                  <span>134</span>
                </div>
              </div>

              <h3>${hero.name}</h3>
              ${hero.post ? `<p>${hero.post}</p>` : ""}
            </a>
  `;

  facList.appendChild(el);
}
