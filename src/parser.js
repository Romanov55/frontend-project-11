const getFeed = (parsedData) => {
  const title = parsedData.querySelector('channel title').textContent;
  const description = parsedData.querySelector('channel description').textContent;
  return { title, description };
};

const getPosts = (parsedData) => {
  const items = parsedData.querySelectorAll('item');
  return [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    return { title, description, link };
  });
};

export default (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const parseError = parsedData.querySelector('parsererror');

  if (parseError) {
    const error = new Error(parseError.querySelector('div').textContent);
    error.isParsingError = true;
    throw error;
  }

  return {
    feed: getFeed(parsedData),
    posts: getPosts(parsedData),
  };
};