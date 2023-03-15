import * as yup from 'yup';
import onChange from 'on-change';
import view from './view';
import axios from 'axios';
import parser from './parser'
import i18next from 'i18next';
import ru from './local/ru';

// валидация введённых значений
// const validate = (url, state) => {
//   const schema = yup.object().shape({
//     url: yup.string().url('invalidURL').notOneOf(state.data.feeds
//       .map((feed) => feed.url), 'alreadyExists').required('emptyField'),
//   });
//   return schema.validate({ url });
// };

// const proxify = (url) => {
//   const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
//   urlWithProxy.searchParams.set('url', url);
//   urlWithProxy.searchParams.set('disableCache', 'true');
//   return urlWithProxy.toString();
// };

// const handleSubmitButtonEvent = (state, elements) => {
//   const { data, formState } = state;
//   const formData = new FormData(elements.form);
//   const inputPath = formData.get('url');
//   formState.status = 'valid';
//   formState.processState = 'processing';
//   validate(inputPath, state)
//     .then(({ url }) => axios.get(proxify(url)))
//     .then((response) => {
//       const { contents } = response.data;
//       const parsedData = parse(contents);
//       formState.status = 'success';
//       formState.processState = 'finished';
//       parsedData.feed.url = inputPath;
//       const { feed, posts } = normalizeData(parsedData);
//       data.feeds = [...data.feeds, feed];
//       data.posts = [...data.posts, ...posts];
//     })
//     .catch((err) => {
//       formState.status = 'invalid';
//       const currentError = (err.name === 'AxiosError') ? 'badNetwork' : err.message;
//       formState.processError = currentError;
//       formState.processState = 'failed';
//     })
//     .finally(() => {
//       formState.processState = 'filling';
//     });
// };

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    inputUrl: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const initialState = {
    data: {
      feeds: [],
      posts: [],
    },
    form: {
      status: 'valid',
      processState: 'filling',
      processError: '',
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: ru,
    debug: false,
    resources: {
      ru,
    },
  })

  const state = onChange(initialState, view(elements, initialState, i18n))

  console.log(state)


  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    // handleSubmitButtonEvent(state, elements);
  });
};