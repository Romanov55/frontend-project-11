import i18next from 'i18next';
import _ from 'lodash';
import axios from 'axios';
import * as yup from 'yup';
import resources from './locales';
import view from './view';
import parse from './parser';

const timeOut = 5000;
const defaultLanguage = 'ru';

const setIds = (data) => {
  const feedId = _.uniqueId();
  const { title, description } = data.feed;
  const feed = { feedId, title, description };
  const posts = data.posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
  return { feed, posts };
};

const generateURL = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.append('disableCache', 'true');
  url.searchParams.append('url', link);
  return url;
};

const getFeedsPosts = (link) => axios.get(generateURL(link))
  .then((response) => {
    const parsedData = parse(response.data.contents);
    return setIds(parsedData);
  });

const handleError = (error) => {
  if (error.isParsingError) {
    return 'rssError';
  }
  if (axios.isAxiosError(error)) {
    return 'networkError';
  }
  return error.message.key ?? 'unknown';
};

export default () => {
  const elements = {
    form: document.querySelector('form.rss-form'),
    postsContainer: document.querySelector('.posts'),
  };

  const initialState = {
    form: {
      status: 'intial',
      error: null,
    },
    data: {
      feeds: [],
      posts: [],
    },
    readPostsIds: new Set(),
    modalPost: {
      postId: '',
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: () => ({ key: 'duplicate' }),
          required: () => ({ key: 'required' }),
        },
        string: {
          url: () => ({ key: 'invalidUrl' }),
        },
      });
      const state = view(initialState, i18nextInstance);
      const makeSchema = (validatedLinks) => yup.string()
        .required()
        .url()
        .notOneOf(validatedLinks);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const links = state.data.feeds.map((feed) => feed.link);
        const schema = makeSchema(links);
        const formData = new FormData(e.target);
        const inputURL = formData.get('url').trim();
        schema.validate(inputURL)
          .then(() => {
            state.form.status = 'processing';
            state.form.error = null;
            return getFeedsPosts(inputURL);
          })
          .then((normalizedData) => {
            state.data.feeds.unshift(normalizedData.feed);
            state.data.feeds[0].link = inputURL;
            state.data.posts.unshift(...normalizedData.posts);
            state.form.status = 'finished';
          })
          .catch((error) => {
            state.form.error = handleError(error);
            state.form.status = 'failed';
          });
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        state.readPostsIds.add(id);
        state.modalPost.postId = id;
      });

      const checkForNewPosts = () => {
        const promises = state.data.feeds
          .map((feed, index) => getFeedsPosts(feed.link)
            .catch(() => null)
            .then((response) => {
              const { feedId } = state.data.feeds[index];
              const filteredPosts = state.data.posts.filter((post) => post.feedId === feedId);
              const currentNewPosts = _.differenceBy(response.posts, filteredPosts, 'title')
                .map((post) => ({ feedId, id: _.uniqueId, ...post }));
              if (currentNewPosts.length > 0) {
                state.data.posts.unshift(...currentNewPosts);
              }
            }));
        Promise.all(promises).finally(() => setTimeout(checkForNewPosts, timeOut));
      };
      checkForNewPosts();
    });
};
