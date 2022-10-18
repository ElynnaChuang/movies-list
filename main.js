const baseURL = "https://movie-list.alphacamp.io/";
const moviesURL = baseURL + "api/v1/movies/";
const posterURL = baseURL + "posters/";
const moviesPanel = document.querySelector("#movies-panel");
const searchInput = document.querySelector("#search-input");
const searchPanel = document.querySelector("#search-panel");
const modePanel = document.querySelector("#mode-panel");
const cardModeBtn = document.querySelector("#card-mode-btn");
const listModeBtn = document.querySelector("#list-mode-btn");
const paginator = document.querySelector("#paginator");
const movies = [];
let searchResults = [];
let searchHistory = [];
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
            <a href="#" class="d-flex btn card-btn add-to-favorite" data-id="${
              el.id
            }">
              <i class="${isInFavorite(el)}" data-id="${el.id}"></i>
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
                  <a href="#" data-id="${el.id}" class="btn list-btn add-to-favorite">
                    <i data-id="${el.id}" class="${isInFavorite(el)}"></i>
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

function isInFavorite(data) {
  const favoriteList = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const status = favoriteList.some((movie) => movie.id === data.id);
  if (status) return "fa-solid fa-heart add-to-favorite";
  return "fa-regular fa-heart add-to-favorite";
}

function getMoviesByPage(page){
  //movies = movies(80) or searchResults
  //若searchResults.length=0，則data=movies，反之則=searchResults
  const data = searchResults.length ? searchResults : movies
  // page = 1 (movies[0] ~ movies[11])
  // page = 2 (movies[12] ~ movies[23])
  // page = 3 (movies[24] ~ movies[35])
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

function addToFavorite(id, event){
  //當function被呼叫時list會等於左或右邊，左邊為有清單，右邊為沒有，回傳兩者其一為T的，若兩者皆T，則左邊優先
  //localStorage本身存的是字串，所以取出時要用JSON.parse()，將 JSON 格式的字串轉回 JavaScript 原生物件
  const favoriteList = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  event.preventDefault()//瀏覽器點到 <a href="#"...></a>預設行為想要找到「錨點」，但是因為沒有寫錨點（href="#"），所以就會跑到網頁的「最上方」

  //find()參數跟filter一樣為函式，為T，則執行，左邊movie是函式本身的參數，右邊id為addToFavorite(id)的id
  //find()回傳值為元素本身（例如：下面的movies.find，回傳值為movies裡符合條件的元素）
  //比對movies[]裡的，跟點擊到的id，若相同則放入favoriteMovies[]
  const favoriteMovies = movies.find(movie => movie.id === id)

  //some()回傳值為T or F
  const target = event.target;
  if (favoriteList.some((movie) => movie.id === id)) {
    const deleteMovie = favoriteList.find((movie) => movie.id === id);
    const index = favoriteList.indexOf(deleteMovie);
    favoriteList.splice(index, 1);
  } else {
    favoriteList.push(favoriteMovies);
  }
  favoriteIconStatus(target);
  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteList));
}

function favoriteIconStatus(target) {
  const tagName = target.tagName;
  if (tagName === "I") {
    const classList = target.classList;
    if (classList.contains("fa-regular")) {
      target.className = "fa-solid fa-heart add-to-favorite";
    } else {
      target.className = "fa-regular fa-heart add-to-favorite";
    }
  }
  if (tagName === "A") {
    const classList = target.firstElementChild.classList;
    if (classList.contains("fa-regular")) {
      target.firstElementChild.className = "fa-solid fa-heart add-to-favorite";
    } else {
      target.firstElementChild.className =
        "fa-regular fa-heart add-to-favorite";
    }
  }
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


axios.get(moviesURL)
.then(response =>{
  const data = response.data.results
  // --- 步驟一：將得到的電影資料塞進movies[]
  // ---方法一：for of---
  // for(const movie of data){
  //   movies.push(movie)
  // }
  // ---方法二：展開運算子---
  movies.push(...data)
  // --- 步驟二：將movies[]的資料用function render出來
  renderPaginator(movies.length)
  renderMovies(getMoviesByPage(1))
})
.catch( (error) => console.log(error));

moviesPanel.addEventListener('click', function (event){
  const classList = event.target.classList
  if(classList.contains('more-info') || classList.contains('img-more-info')){
    //showMovieModal(id) 需要id是數字，但dataset裡的id是字串，所以需要轉換
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.classList.contains("add-to-favorite")) {
    addToFavorite(Number(event.target.dataset.id), event)
  }
})

paginator.addEventListener('click', function onPaginatorClicked (event){
  const data = searchResults.length ? searchResults : movies;
  let target = event.target
  if (event.target.classList.contains('outside-scope')){
    target = event.target.firstElementChild.firstElementChild
  }
  desideNumOfPage(target, data)
  renderPageItemStatus(currPage);
  renderMovies(getMoviesByPage(currPage));
})

//submit 改 input 即可變成即時顯示結果
searchPanel.addEventListener('submit', function searchSubmit(event){
  event.preventDefault() //請瀏覽器不要做預設的動作(因瀏覽器在感應到sumbit時，預設會重整，所以下方的console結果只會閃現一下)
  const keyWord = searchInput.value.trim().toLowerCase()
  searchHistory = searchResults.slice(0);

  //對比keyword 跟 movies[]裡的title，方法一是 forEach，方法二是 filter()，方法三是 for-of
  // ＝＝＝＝ 方法一 ＝＝＝＝ //
  // movies.forEach( movie => {
  //   const title = movie.title.toLowerCase()
  //   if(title.includes(keyWord)){
  //     searchResults.push(movie)
  //   }
  // })
  // renderMovies(searchResults)
  // ＝＝＝＝ 方法二 ＝＝＝＝//
  //filter作用在array，會將array裡的項目丟入括號中的條件式(函數，會回傳T or F)判斷，為T的項目才會被保存，回傳值為一個陣列，包含所有T的項目
  searchResults = movies.filter((movie) =>movie.title.toLowerCase().trim().includes(keyWord));
  if (!searchResults.length){
    searchResults = searchHistory;
    return alert(`找不到跟${keyWord}相符的電影！`)
  }
  renderMovies(getMoviesByPage(1))
  renderPaginator(searchResults.length)
})

modePanel.addEventListener("click", function clickModeBtn(event) {
  const classList = event.target.classList;
  if (classList.contains("card-mode")) {
    mode = "card-mode";
    cardModeBtn.classList.add("mode-active");
    listModeBtn.classList.remove("mode-active");
  }
  if (classList.contains("list-mode")) {
    mode = "list-mode";
    listModeBtn.classList.add("mode-active");
    cardModeBtn.classList.remove("mode-active");
  }
  renderMovies(getMoviesByPage(currPage));
});