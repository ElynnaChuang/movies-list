const baseURL = 'https://movie-list.alphacamp.io'
const moviesURL = baseURL + '/api/v1/movies/'
const posterURL = baseURL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
const moviesPanel = document.querySelector('#data-panel')
const modePanel = document.querySelector("#mode-panel");
const cardModeBtn = document.querySelector("#card-mode-btn");
const listModeBtn = document.querySelector("#list-mode-btn");
const paginator = document.querySelector("#paginator");
const moviePerPage = 12;
let currPage = 1;
let mode = "card-mode";

function renderMovies(data) {
  if (!data) return;
  let rawHTML = "";
  if (mode === "card-mode") {
    data.forEach((el) => {
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-5">
          <div class="card">
            <a href="#" class="d-flex btn card-btn remove-favorite" data-id="${
              el.id
            }">
              <i class="fa-regular fa-trash-can" data-id="${el.id}"></i>
            </a>
            <img src=${posterURL}${el.image} class="card-img-top img-more-info" alt="..." data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${el.id}">
            <div class="card-body" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${el.id}">
              <h5 class="card-title">${el.title}</h5>
            </div>
          </div>
        </div>
      </div>
      `;
    });
  }
  if (mode === "list-mode") {
    rawHTML += `
    <ul class="list-group list-group-flush">
    `;
    data.forEach((el) => {
      rawHTML += `
        <li class="list-group-item">
          <div class="container">
            <div class="row align-items-center">
              <div class="col">${el.title}</div>
                <div class="col all-list-btn">
                  <a href="#" class=" btn list-btn more-info" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${el.id}">
                    <i class="fa-solid fa-info more-info" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${el.id}"></i>
                  </a>
                  <a href="#" data-id="${el.id}" class="btn list-btn remove-favorite">
                    <i data-id="${el.id}" class="fa-regular fa-trash-can"></i>
                  </a>
                </div>
              </div>
            </div>
          </li>
      `;
    });
    rawHTML += `
    </ul>
    `;
  }
  moviesPanel.innerHTML = rawHTML;
}


function getMoviesByPage(page){
  const data = movies//movies = favorite movies
  const startIndex = (page - 1) * moviePerPage
  return data.slice(startIndex, startIndex + moviePerPage) //!最後一個不會包含
}

function renderPaginator(amount){
  // amount = total movies = 80  // 80 /12 = 6 ... 8 (6 + 1 = 7)
  const pageAmmt = Math.ceil(amount / moviePerPage)
  let rawHTML = `
    <li class="page-control">
      <a class="page-link outside-scope" href="#" aria-label="Previous">
        <span aria-hidden="true" class="outside-scope">
          <i class="fa-solid fa-chevron-left previous"></i>
        </span>
      </a>
    </li>
    <li class="page-item active" data-page="1">
      <a class="page-link" href="#" data-page="1">1</a>
    </li>
  `;
  for (let page = 2; page <= pageAmmt; page++) {
    rawHTML += `
    <li class="page-item" data-page="${page}">
      <a class="page-link" href="#" data-page="${page}">${page}</a>
    </li>
      `;
  }
  rawHTML += `
    <li class="page-control">
      <a class="page-link outside-scope" href="#" aria-label="Next">
        <span aria-hidden="true" class="outside-scope">
          <i class="fa-solid fa-chevron-right next"></i>
        </span>
      </a>
    </li>
  `;
  paginator.innerHTML = rawHTML;
}

function renderPageItemStatus(page) {
  const allPageItems = [...document.querySelectorAll(".page-item")];
  allPageItems.forEach((item) => {
    if (item.classList.contains("active")) {
      item.classList.remove("active");
    }
  });
  const activePage = allPageItems.find(
    (item) => Number(item.dataset.page) === page
  );
  activePage.classList.add("active");
}

function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  modalTitle.innerText = ''
  modalDate.innerText = ''
  modalDescription.innerText = ''
  modalImage.innerHTML = ''
  axios.get(moviesURL + id)
  .then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = `Release Date : `+ data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src=${posterURL + data.image} alt="movie-poster" class="image-fuid">`
  })
}

function removeFavorite (id){
  if (!movies || !movies.length) return

  //因為移除需要用splice，需要知道資料在陣列中的位置，可以用findIndex()
  const favoriteMoviesIndex = movies.findIndex(movie => movie.id === id)
  if(favoriteMoviesIndex === -1) return

  movies.splice(favoriteMoviesIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovies(getMoviesByPage(currPage))
  renderPaginator(movies.length)
}

function desideNumOfPage (target, data) {
  if (target.tagName === "A") {
    currPage = Number(target.dataset.page);
  }
  if (target.classList.contains("next")) {
    if (currPage >= Math.ceil(data.length / moviePerPage)) return;
    currPage += 1;
  }
  if (target.classList.contains("previous")) {
    if (currPage <= 1) return;
    currPage -= 1;
  }
}

moviesPanel.addEventListener('click', function clickMoreInfo(event){
  event.preventDefault()
  let movieID = Number(event.target.dataset.id)
  const classList = event.target.classList
  if(classList.contains('more-info') || classList.contains('img-more-info')) {
    showMovieModal(movieID)
  }else if(classList.contains('btn-remove-favorite') || classList.contains('fa-trash-can')) {
    removeFavorite(movieID)
  }
})

renderMovies(getMoviesByPage(currPage))
renderPaginator(movies.length)