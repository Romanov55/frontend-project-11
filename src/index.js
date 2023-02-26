import './styles.scss';
import 'bootstrap';
import * as Yup from 'yup';

const form = document.querySelector('.rss-form')
const inputUrl = document.querySelector('#url-input')
const feedback = document.querySelector('.feedback')

form.addEventListener('submit', (e) => {
    e.preventDefault()

const schema = Yup.object().shape({
  url: Yup.string().url().required(),
});

const data = {
  url: inputUrl.value,
};

// Async validation
schema.validate(data)
  .then(() => {
    feedback.innerHTML = ('RSS успешно загружен');
    feedback.classList.remove('text-danger')
    feedback.classList.add('text-success')
    inputUrl.value = ""
    inputUrl.focus()
  })
  .catch((error) => {
    feedback.innerHTML = ('Ссылка должна быть валидным URL');
    feedback.classList.remove('text-success')
    feedback.classList.add('text-danger')
    inputUrl.classList.add('is-invalid')
  });
})