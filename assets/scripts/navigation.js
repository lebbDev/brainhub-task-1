var global =
  typeof global !== "undefined"
    ? global
    : typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : {};

const loadPage = async (path) => {
  showLoadingOverlay();
  
  const response = await fetch(path);
  const responseText = await response.text();

  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(responseText, "text/html");

  document.head.innerHTML = parsedHtml.head.innerHTML;
  document.body.querySelector("#app").innerHTML =
    parsedHtml.querySelector("#app").innerHTML;

  history.pushState({}, "", path);

  const parsedPath = new URL(path, window.location.href);
  if (
    parsedPath.pathname == "/" ||
    parsedPath.pathname == "/index.html" ||
    parsedPath.pathname == ""
  ) {
    loadMainPageContent();
  } else loadSecondaryPageContent(path);

  setTimeout(() => hideLoadingOverlay(), 200);
};

const loadMainPageContent = () => {
  const factionsList = document.querySelector("ul");

  for (const faction of global.inputArray) {
    if (!faction.parent) {
      const elemLi = document.createElement("li");
      elemLi.classList.toggle("main-container__factions-item");

      elemLi.innerHTML = `
        <a href="description.html?id=${faction.id}">
          <div>
            <img
              src="/assets/images/heroes/${faction.image}"
              alt="faction-img"
              class="main-container__faction-img"/>
            <h3 class="main-container__faction-h3">${faction.name}</h3>
          </div>
        </a>
      `;

      factionsList.appendChild(elemLi);
    }
  }

  addListenersForA();
};

const loadSecondaryPageContent = (path) => {
  const url = new URL(path, window.location.href);
  let urlID = Number(url.searchParams.get("id"));

  let obj = global.inputArray.find((e) => e.id === urlID);

  if (!obj) {
    return loadPage("/index.html");
  }

  let h1El = document.body.querySelector("h1");
  obj.name ? (h1El.innerHTML = obj.name) : (h1El.innerHTML = "name undefined");

  if (obj.parent) {
    let vassalsCount = global.inputArray.filter(
      (v) => v.parent === urlID
    ).length;

    let divEl = document.createElement("div");
    divEl.classList.toggle("navigation__hero-avatar");

    divEl.innerHTML = `
            <div class="navigation__hero-img-block">
              <img src="" alt="main-hero-img" class="navigation__hero-img" id="main-img" />
            </div>
                ${
                  vassalsCount
                    ? `<div class="navigation__hero-badge">
                        <img src="/assets/images/icons/badge.png" alt="badge-icon"/>
                        <span class="navigation__hero-count">${vassalsCount}</span>
                      </div>`
                    : ""
                }
    `;

    document.getElementById("main-img").replaceWith(divEl);

    let pEl = document.createElement("p");
    pEl.classList.toggle("navigation__p");
    obj.post ? (pEl.innerHTML = obj.post) : (pEl.innerHTML = "");
    h1El.after(pEl);
  }

  let parentID = obj.parent;

  document.getElementById("main-img").src =
    "/assets/images/heroes/" + obj.image;

  addCards(urlID);
  addListenersForA();

  initMainRef();
  initArrows(url, obj, parentID);
  initBackRef(parentID);
};

const showLoadingOverlay = () => {
  let loadEl = document.getElementById("loading");

  loadEl.style.top = "0";
  loadEl.style.left = "0";
  loadEl.style.right = "0";
  loadEl.style.display = "flex";
  loadEl.style.position = "fixed";
  loadEl.style.height = "100vh";
  loadEl.style.backgroundImage = "url(/assets/images/background.png)";
  loadEl.style.backgroundSize = "cover";
  loadEl.style.transition = "0.2s";
  loadEl.style.zIndex = "999";
};

const hideLoadingOverlay = () => {
  let loadEl = document.getElementById("loading");

  loadEl.style.display = "none";
};

// Добавление карт (ячеек) с персонажами
const addCards = (parentID) => {
  const heroesList = document.querySelector("ul");

  for (const hero of global.inputArray) {
    if (hero.parent === parentID) {
      const elemLi = document.createElement("li");
      elemLi.classList.toggle("heroes__menu-item");

      let vassalsCount = global.inputArray.filter(
        (el) => el.parent === hero.id
      ).length;

      elemLi.innerHTML = `
        <a href="description.html?id=${hero.id}" class="hero-link">
            <div class="hero-link__avatar">
              <img src="/assets/images/heroes/${
                hero.image
              }" alt="hero-image" id="avatar-img">
              <div class="hero-link__avatar-badge">
                <img src="/assets/images/icons/badge.png" class="hero-link__avatar-badge-img">
                <span class="hero-link__avatar-counter">${vassalsCount}</span>
              </div>
            </div>

            ${hero.name ? `<h3 class="hero-link__h3">${hero.name}</h3>` : `<h3 class="hero-link__h3">name is unknown</h3>`}
            ${hero.post ? `<p class="hero-link__p">${hero.post}</p>` : `<p class="hero-link__p">post is unknown</p>`}
        </a>
      `;

      if (!vassalsCount)
        elemLi.querySelector(".hero-link__avatar-badge").style.display = "none";

      heroesList.appendChild(elemLi);
    }
  }
};

const addListenersForA = () => {
  const elements = document.querySelectorAll("ul > li > a");

  for (const element of elements) {
    element.addEventListener("click", async (e) => {
      e.preventDefault();

      loadPage(element.href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
};

const initMainRef = () => {
  const element = document.getElementById("main-ref");

  if (element) {
    element.addEventListener("click", async (e) => {
      e.preventDefault();

      loadPage("/index.html");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
};

const initArrows = (url, obj, parentID) => {
  let children = global.inputArray.filter((v) => v.parent === parentID);
  let lenChildren = children.length;
  let indexCurObj = children.indexOf(obj);

  if (lenChildren !== 1) {
    document
      .getElementById("left-arrow")
      .addEventListener("click", async (e) => {
        e.preventDefault();

        if (indexCurObj - 1 < 0)
          url.searchParams.set("id", children[lenChildren - 1].id);
        else url.searchParams.set("id", children[indexCurObj - 1].id);

        loadPage(url.toString());
      });

    document
      .getElementById("right-arrow")
      .addEventListener("click", async (e) => {
        e.preventDefault();

        if (indexCurObj + 1 >= lenChildren)
          url.searchParams.set("id", children[0].id);
        else url.searchParams.set("id", children[indexCurObj + 1].id);

        loadPage(url.toString());
      });
  } else {
    document.getElementById("left-arrow").style.display = "none";
    document.getElementById("right-arrow").style.display = "none";
  }
};

const initBackRef = (parentID) => {
  document.getElementById("back-ref").addEventListener("click", async (e) => {
    e.preventDefault();

    if (!parentID) return loadPage("/index.html");
    else return loadPage("/description.html?id=" + parentID);
  });
};

// Событие загружающее страницу
document.addEventListener("DOMContentLoaded", () => {
  loadPage(window.location.href);
  
  window.addEventListener("popstate", () => {
    loadPage(window.location.href);
  });
});
