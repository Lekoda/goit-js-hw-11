import axios from "axios";
import Notiflix, { Block } from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let searchQuery = '';
let currentPage = 1;

searchForm.addEventListener('submit', onSubmitSearch);
loadMoreBtn.addEventListener('click', onClickLoadMore);


async function fetchImages(value,page) {
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '6272575-a6aecd500098fe7c64ad99f92'; 
    const filter = `?key=${API_KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;

    try {
        const response = await axios.get(`${BASE_URL}${filter}`);
        console.log(response);
        return response.data;
    }
    catch (error) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    }
}

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

async function onSubmitSearch(e) {
    e.preventDefault();
    searchQuery = e.target.elements.searchQuery.value;
    currentPage = 1;

    if (!searchQuery) {
        return Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    }
    const response = await fetchImages(searchQuery, currentPage);
    if (response && response.hits.length) {
        gallery.innerHTML = '';
        markupImageCard(response.hits);
        lightbox.refresh();
        loadMoreBtn.classList.remove('is-hidden');
    } else if (response && response.total === 0) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        loadMoreBtn.classList.add('is-hidden');
    } else {
        loadMoreBtn.classList.add('is-hidden');
    }
}


async function onClickLoadMore() {
currentPage += 1;
  try {
    const response = await fetchImages(searchQuery, currentPage);

    if (!response.hits.length) {
     loadMoreBtn.classList.add('is-hidden')
      throw new Error();
    }
    markupImageCard(response.hits);
  } catch (err) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}


function markupImageCard(arr) {
    const markup = arr.map(({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
    }) => {
        return `<div class='photo-card'>
        <div class="img-wrap">
  <a href='${largeImageURL}'>
    <img src='${webformatURL}' alt='${tags}' loading='lazy' />
  </a>
   </div>
  <div class='info'>
    <p class='info-item'>
      <b>Likes</b>
      ${likes}
    </p>
    <p class='info-item'>
      <b>Views</b>
      ${views}
    </p>
    <p class='info-item'>
      <b>Comments</b>
      ${comments}
    </p>
    <p class='info-item'>
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>`;
    })
.join('');
    gallery.insertAdjacentHTML('beforeend', markup);
}


