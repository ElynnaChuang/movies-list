const baseURL = 'https://movie-list.alphacamp.io'
const indexURL = baseURL + '/api/v1/movies/'
const posterURL = baseURL + '/posters/'
const moviePerPage = 12
const movies = []
let searchResults = [] //存放搜尋出的結果
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#pagenation')


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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount){
  // amount = total movies = 80  // 80 /12 = 6 ... 8 (6 + 1 = 7)
  const numOFPage = Math.ceil(amount / moviePerPage)
  let rawHTML = ''
  for (i = 1 ; i <= numOFPage ; i++){
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page = "${i}">${i}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
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

function addToFavorite(id){
  //當function被呼叫時list會等於左或右邊，左邊為有清單，右邊為沒有，回傳兩者其一為T的，若兩者皆T，則左邊優先
  //localStorage本身存的是字串，所以取出時要用JSON.parse()，將 JSON 格式的字串轉回 JavaScript 原生物件
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  //find()參數跟filter一樣為函式，為T，則執行，左邊movie是函式本身的參數，右邊id為addToFavorite(id)的id
  //find()回傳值為元素本身（例如：下面的movies.find，回傳值為movies裡符合條件的元素）
  //比對movies[]裡的，跟點擊到的id，若相同則放入favoriteMovies[]
  const favoriteMovies = movies.find(movie => movie.id === id)

  //some()回傳值為T or F
  //若list裡的陣列的id === 點擊項目的id，則return alert()
  if(list.some(movie => movie.id === id)) {
    return alert('此電影已經加入過收藏清單了！')
  }
  list.push(favoriteMovies)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


axios.get(indexURL)
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
  renderMoviesList(getMoviesByPage(1))
})
.catch( (error) => console.log(error));

dataPanel.addEventListener('click', function (event){
  if(event.target.matches('.btn-more-info')) {
    //showMovieModal(id) 需要id是數字，但dataset裡的id是字串，所以需要轉換
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked (event){
  const page = Number(event.target.dataset.page)
  if (event.target.tagName !== "A") {return}
  renderMoviesList(getMoviesByPage(page))
})

//submit 改 input 即可變成即時顯示結果
searchForm.addEventListener('submit', function searchSubmit(event){
  event.preventDefault() //請瀏覽器不要做預設的動作(因瀏覽器在感應到sumbit時，預設會重整，所以下方的console結果只會閃現一下)
  const keyWord = searchInput.value.trim().toLowerCase()

  //過濾空白關鍵字，但後續拿掉，這樣查詢一次後，把輸入結果拿掉後按搜尋才可以回到全部
  // if(!keyWord.length){ //()裡＝0、-0、null、NaN、undefined、空字串("")，值都會被初始化成false
  //   return alert('搜尋關鍵字不得為空白') //？？？跟直接alert有什麼不同
  // }

  //對比keyword 跟 movies[]裡的title，方法一是 forEach，方法二是 filter()，方法三是 for-of
  // ＝＝＝＝ 方法一 ＝＝＝＝ //
  // movies.forEach( movie => {
  //   const title = movie.title.toLowerCase()
  //   if(title.includes(keyWord)){
  //     searchResults.push(movie)
  //   }
  // })
  // renderMoviesList(searchResults)
  // ＝＝＝＝ 方法二 ＝＝＝＝//
  //filter作用在array，會將array裡的項目丟入括號中的條件式(函數，會回傳T or F)判斷，為T的項目才會被保存，回傳值為一個陣列，包含所有T的項目
  searchResults = movies.filter( movie => movie.title.toLowerCase().includes(keyWord))
  if (searchResults.length === 0 ){
    return alert(`找不到跟${keyWord}相符的電影！`)
  }
  renderPaginator(searchResults.length)
  renderMoviesList(getMoviesByPage(1))
})



