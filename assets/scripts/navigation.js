var global =
  typeof global !== "undefined"
    ? global
    : typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : {};

const loadPage = async (path) => {
  //console.log(`html из: ${path}`);
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
  if (parsedPath.pathname != "/" && parsedPath.pathname != "/index.html") {
    loadPageContent(path);
  } else addListenersForA();

  setTimeout(() => hideLoadingOverlay(), 200);
};

const loadPageContent = (path) => {
  const url = new URL(path, window.location.href);
  let urlID = Number(url.searchParams.get("id"));

  console.log(urlID);

  let obj = global.inputArray.find((e) => e.id === urlID);
  if (!obj) {
    return window.location.replace(
      "https://steamuserimages-a.akamaihd.net/ugc/1645466045539701655/1C2A8F0DB742DDC82FFD7F35346006AE7B3AAA59/?imw=512&amp;&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=false"
    );
  }

  let parentID = obj.parent;

  document.getElementById("main-img").src =
    "/assets/images/heroes/" + obj.image;

  document.body.querySelector("h1").innerHTML = obj.name;

  if (path.includes("hero")) {
    let pEl = document.body.querySelector("p");
    obj.post ? (pEl.innerHTML = obj.post) : (pEl.innerHTML = "");

    let vassalsCount = global.inputArray.filter(
      (v) => v.parent === urlID
    ).length;

    if (vassalsCount)
      document.body.querySelector("span").innerHTML = vassalsCount;
    else document.body.querySelector(".badge-main").style.display = "none";
  }

  addCards(urlID);

  addListenersForA();
  initArrows(url, obj, parentID);
  initBackRef(parentID);
};

const showLoadingOverlay = () => {
  let loadEl = document.getElementById("loading");

  loadEl.style.top = "0";
  loadEl.style.left = "0";
  loadEl.style.display = "flex";
  loadEl.style.position = "fixed";
  loadEl.style.height = "100vh";
  loadEl.style.width = "100vw";
  loadEl.style.backgroundImage = "url(/assets/images/background.png)";
  loadEl.style.backgroundSize = "cover";
  loadEl.style.transition = "0.2s";
  loadEl.style.zIndex = "999";
};

const hideLoadingOverlay = () => {
  let loadEl = document.getElementById("loading");

  loadEl.style.display = "none";
};

const addCards = (parentID) => {
  const facList = document.querySelector("ul");

  for (const hero of global.inputArray) {
    if (hero.parent === parentID) {
      const elemLi = document.createElement("li");

      let vassalsCount = global.inputArray.filter(
        (el) => el.parent === hero.id
      ).length;

      elemLi.innerHTML = `
        <a href="hero.html?id=${hero.id}">
            <div class="hero-avatar">
              <img src="/assets/images/heroes/${hero.image}" id="hero-card-img">
              <div class="badge">
                <img src="/assets/images/icons/badge.png">
                <span>${vassalsCount}</span>
              </div>
            </div>

            <h3>${hero.name}</h3>
            ${hero.post ? `<p>${hero.post}</p>` : ""}
        </a>
      `;

      if (!vassalsCount) elemLi.querySelector(".badge").style.display = "none";

      facList.appendChild(elemLi);
    }
  }
};

const addListenersForA = () => {
  const elements = document.querySelectorAll("a");
  for (const element of elements) {
    element.addEventListener("click", async (e) => {
      e.preventDefault();

      loadPage(element.href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
};

const initArrows = (url, obj, parentID) => {
  let children = global.inputArray.filter((v) => v.parent === parentID);
  let lenChildren = children.length;
  let indexCurObj = children.indexOf(obj);

  if (lenChildren !== 1) {
    document.getElementById("left-arrow").addEventListener("click", () => {
      if (indexCurObj - 1 < 0)
        url.searchParams.set("id", children[lenChildren - 1].id);
      else url.searchParams.set("id", children[indexCurObj - 1].id);

      loadPage(url.toString());
    });

    document.getElementById("right-arrow").addEventListener("click", () => {
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
    let parentObj = global.inputArray.find((v) => v.id === parentID);
    let grandParentObj = global.inputArray.find(
      (v) => v.id === parentObj.parent
    );
    console.log(grandParentObj, parentObj);
    grandParentObj
      ? loadPage("/hero.html?id=" + parentID)
      : loadPage("/faction.html?id=" + parentID);
  });
};

// let loadEl = document.getElementById("loading");
// console.log(loadEl);
// document.addEventListener("DOMContentLoaded", () => {
//   //showLoadingOveray();
//   loadEl.classList.add("hide");
//   console.log(loadEl);
//   setTimeout(() => {
//     loadEl.remove();
//   }, 1000);
// });

document.addEventListener("DOMContentLoaded", () => {
  // const loadScripts = () => {
  // };
  loadPage(window.location.href);

  window.addEventListener("popstate", () => {
    loadPage(window.location.href);
  });
});
