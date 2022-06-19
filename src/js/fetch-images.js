import axios from 'axios';
export class ImagesApiService {
  constructor() {
    this.searchQuerry = '';
    this.page = 1;
    this._perPage = 40;
    this.searchColor = true;
  }

  async fetchImages() {
    const URL = `https://pixabay.com/api/?key=27846082-466a06211f9d2392907268ab0&q=${this.searchQuerry}&image_type=photo&orientation=horizontal&safesearch=true&&page=${this.page}&per_page=${this._perPage}&min_height=3000`;
    const options = {};

    const response = await axios.get(URL);
    return response.data;
  }

  get query() {
    return this.searchQuerry;
  }

  set query(newQuery) {
    this.searchQuerry = newQuery;
  }

  get perPage() {
    return this._perPage;
  }

  incPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  searchColorTrue() {
    this.searchColor = true;
  }

  searchColorFalse() {
    this.searchColor = false;
  }
}
