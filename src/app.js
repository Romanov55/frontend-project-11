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
  const intialState = {
    status: 'intial',
    error: null,
    feeds: [],
    posts: [],
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
      })
      const state = view(intialState, i18nextInstance);
      const makeSchema = (validatedLinks) => yup.string()
        .required()
        .url()
        .notOneOf(validatedLinks);

      const form = document.querySelector('form.rss-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const links = state.feeds.map((feed) => feed.link);
        const schema = makeSchema(links);
        const formData = new FormData(e.target);
        const inputURL = formData.get('url').trim();
        schema.validate(inputURL)
          .then(() => {
            state.status = 'processing';
            state.error = null;
            return getFeedsPosts(inputURL);
          })
          .then((normalizedData) => {
            state.feeds.unshift(normalizedData.feed);
            state.feeds[0].link = inputURL;
            state.posts.unshift(...normalizedData.posts);
            state.status = 'finished';
          })
          .catch((error) => {
            state.error = handleError(error);
            state.status = 'failed';
          });
      });

      const postsContainer = document.querySelector('.posts');
      postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        state.readPostsIds.add(id);
        state.modalPost.postId = id;
      });

      const checkForNewPosts = () => {
        const promises = state.feeds
          .map((feed, index) => getFeedsPosts(feed.link)
            .then((response) => {
              const { feedId } = state.feeds[index];
              const filteredPosts = state.posts.filter((post) => post.feedId === feedId);
              const currentNewPosts = _.differenceBy(response.posts, filteredPosts, 'title')
                .map((post) => ({ feedId, id: _.uniqueId, ...post }));
              if (currentNewPosts.length > 0) {
                state.posts.unshift(...currentNewPosts);
              }
            }));
        Promise.all(promises).finally(() => setTimeout(checkForNewPosts, timeOut));
      };
      checkForNewPosts();
    });
};
