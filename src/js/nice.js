// import axios from 'axios';
import Notiflix from 'notiflix';
import { ImagesApiService } from './fetch-images';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { refs } from './refs.js';
import throttle from 'lodash.throttle';

const imagesApiService = new ImagesApiService();
// ------------------ Listeners ---------------------------------
refs.inputEl.addEventListener('focus', onInputElFocus);
refs.inputEl.addEventListener('blur', onInputBlur);
refs.formEl.addEventListener('submit', onFormElSubmit);
refs.btnMoreEl.addEventListener('click', onBtnMoreElClick);
window.addEventListener('scroll', throttle(onScroll, 500));

let enableInfo = true;

Notiflix.Notify.init({
  fontFamily: 'Roboto',
  fontSize: '13px',
  info: {
    background: 'rgb(241, 212, 28)',
    textColor: 'rgb(64, 28, 210)',
    childClassName: 'notiflix-notify-info',
    notiflixIconColor: 'rgb(119, 92, 230)',
    fontAwesomeClassName: 'fas fa-info-circle',
    fontAwesomeIconColor: 'rgba(0,0,0,0.2)',
    backOverlayColor: 'rgba(38,192,211,0.2)',
  },
});

function onScroll(event) {
  if (
    window.innerHeight + window.pageYOffset >= document.body.offsetHeight &&
    refs.btnMoreEl.classList.contains('hide-btn') &&
    enableInfo
  ) {
    enableInfo = false;

    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

let galleryLightBox;

function onFormElSubmit(event) {
  event.preventDefault();
  refs.inputEl.blur();
  deleteMarkup();
  hideBtn();
  imagesApiService.resetPage();

  imagesApiService.query = event.currentTarget.searchQuery.value;

  updateUi();
  setTimeout(() => {
    enableInfo = true;
  }, 1000);
}

async function onBtnMoreElClick() {
  enableInfo = false;
  const images = await imagesApiService.fetchImages();

  renderMarkup(images);

  galleryLightBox.refresh();
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.9,
    behavior: 'smooth',
  });
  reachedEndOfImages(images);
}

function appendGalleryCards(data) {
  refs.galleryEl.insertAdjacentHTML('beforeend', makeGalleryCardsMarkup(data));
}

function makeGalleryCardsMarkup(data) {
  return data
    .map(data => {
      return `<a href="${data.largeImageURL}">
          <div class="photo-card">
            <div class="img-wrapper">
            <img src="${data.webformatURL}" alt="${data.tags}" loading="lazy" />
            </div>
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                <b>${data.likes}</b>
              </p>
              <p class="info-item">
                <b>Views</b>
                <b>${data.views}</b>
              </p>
              <p class="info-item">
                <b>Comments</b>
                <b>${data.comments}</b>
              </p>
              <p class="info-item">
                <b>Downloads</b>
                <b>${data.downloads}</b>
              </p>
            </div>
        </div>
      </a>`;
    })
    .join('');
}

function showBtn() {
  refs.btnMoreEl.classList.remove('hide-btn');
}

function hideBtn() {
  refs.btnMoreEl.classList.add('hide-btn');
}

function deleteMarkup() {
  refs.galleryEl.innerHTML = '';
}

function onError() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function hooray(totalHits) {
  if (totalHits > 5) {
    Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
  }
}

async function updateUi() {
  try {
    const images = await imagesApiService.fetchImages();

    if (images.hits.length === 0) {
      imagesApiService.searchColorTrue();
      return images.reject();
    }

    if (images.hits.length < 5) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    renderMarkup(images);
    hooray(images.totalHits);

    imagesApiService.searchColorFalse();

    galleryLightBox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
      showCounter: false,
    });

    reachedEndOfImages(images);
  } catch (error) {
    refs.inputEl.style.color = 'red';
    onError();
  }
}

function renderMarkup(images) {
  appendGalleryCards(images.hits);
  showBtn();
  imagesApiService.incPage();
}

function reachedEndOfImages(images) {
  if (images.hits.length < imagesApiService.perPage) {
    hideBtn();
  }
}
function onInputElFocus(event) {
  refs.wrapperEl.classList.add('search-form__input-wrapper--focus');
  refs.svgEl.classList.add('search-form__icon--focus');
  refs.btnEl.style.backgroundColor = 'rgb(64, 28, 210)';
  if (imagesApiService.searchColor) {
    refs.inputEl.style.backgroundColor = 'rgb(241, 212, 28)';
  }
  refs.inputEl.style.color = 'rgb(64, 28, 210)';
}

function onInputBlur() {
  refs.wrapperEl.classList.remove('search-form__input-wrapper--focus');
  refs.svgEl.classList.remove('search-form__icon--focus');
  refs.btnEl.style.backgroundColor = 'rgb(241, 212, 28)';
  refs.inputEl.style.backgroundColor = 'white';
}
