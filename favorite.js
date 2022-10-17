const baseURL = 'https://movie-list.alphacamp.io'
const indexURL = baseURL + '/api/v1/movies/'
const posterURL = baseURL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
const dataPanel = document.querySelector('#data-panel')


function renderMoviesList(data){
  let rawHTML = ''
  //因為傳進來的data會是陣列，所以可以用forEach處理
  data.forEach(item => {
    // 需要item.title & item.image & item.id(下列id的方法為「dataset」)
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src= "${posterURL+item.image}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
              <button class="btn btn-primary btn-more-info" data-bs-toggle="modal" data-bs-target="#movie-modal"
              data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">
                <i class="fa-regular fa-trash-can"></i>
              </button>
          </div>
        </div>
      </div>
    </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(indexURL + id)
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
  renderMoviesList(movies)
}

dataPanel.addEventListener('click', function clickMoreInfo(event){
  if(event.target.matches('.btn-more-info')) {
    //showMovieModal(id) 需要id是數字，但dataset裡的id是字串，所以需要轉換
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }else if (event.target.matches('.fa-trash-can')) {
    const movieID = event.target.parentElement.dataset.id
    removeFavorite(Number(movieID))
  }
})

renderMoviesList(movies)

console.log(!!movies)