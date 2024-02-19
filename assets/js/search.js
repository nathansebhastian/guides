// ==========================================
// Hugo search with FuseJS
//

let fuse; // holds our search engine
let options = {
  // fuse.js options; check fuse.js website for details
  shouldSort: true,
  location: 0,
  distance: 100,
  threshold: 0.6,
  minMatchCharLength: 3,
  keys: [
    { name: "title", weight: 0.8 },
    { name: "description", weight: 0.5 },
    { name: "permalink", weight: 0.2 },
  ],
};

const searchTitle = document.getElementById("search-title");
const searchResult = document.getElementById("search-result");
const searchUI = document.getElementById("sidebar-search").cloneNode(true);

document.addEventListener("DOMContentLoaded", function () {
  if (searchTitle) {
    params = new URLSearchParams(window.location.search);
    searchQuery = params.get("s");
    if (searchQuery) {
      searchTitle.innerHTML = `Loading results...`;
      executeSearch(searchQuery);
    } else {
      searchTitle.innerHTML = "Type something in the search bar";
      searchResult.replaceWith(searchUI);
    }
  }
});

function fetchJSONFile(path, callback) {
  let httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        let data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

function executeSearch(term) {
  fetchJSONFile("/fuse.json", function (data) {
    fuse = new Fuse(data, options);
    let results = fuse.search(term);
    if (results.length === 0) {
      searchTitle.innerHTML = `Nothing found for "${searchQuery}"`;
      searchResult.replaceWith(searchUI);
    } else {
      searchTitle.innerHTML = `Results for "${searchQuery}"`;
      let cards = '';
      let hits = results.slice(0, 15);
      hits.forEach(hit => {
        let markup = `
          <div class="col">
            <div class="card-body">
              <h2 class="card-title">
                <a href="${hit.item.permalink}" class="stretched-link"> ${hit.item.title} </a>
              </h2>
              <small>
                <p class="mt-1 card-text text-muted">
                  Tag:
                  <strong class="tag ${hit.item.tags[0].toLowerCase()}" >
                    ${hit.item.tags[0]}
                  </strong>
                </p>
              </small>
              <p class="card-text">${hit.item.description}</p>
            </div>
          </div>
          `
        cards += `
        <div class="card border-0 mb-5">
          <div class="row g-0">
            ${markup}
          </div>
        </div>
        `;
      });
      searchResult.innerHTML = cards;
    }
  });
}
