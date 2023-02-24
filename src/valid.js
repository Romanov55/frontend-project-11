import * as Yup from 'yup';

const inputUrl = document.querySelector('url-input')
console.log(inputUrl)

const schema = Yup.object().shape({
  url: Yup.string().url().required(),
});

const data = {
  url: inputUrl.value,
};

// Sync validation
try {
  schema.validateSync(data);
  console.log('Data is valid');
} catch (error) {
  console.error('Data is invalid:', error.errors);
}

// Async validation
schema.validate(data)
  .then(() => {
    console.log('Data is valid');
  })
  .catch((error) => {
    console.error('Data is invalid:', error.errors);
  });

// Check validity of a value
const valueToCheck = '123';
console.log(schema.isValidSync(valueToCheck)); // false