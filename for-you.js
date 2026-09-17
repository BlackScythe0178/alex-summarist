const API = 'https://us-central1-summaristt.cloudfunctions.net/getBooks?status=recommended';
const SELECTED_API = 'https://us-central1-summaristt.cloudfunctions.net/getBooks?status=selected';
const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function bookCard(book) {
  return `<article class="book-card"><img src="${esc(book.imageLink)}" alt="Cover of ${esc(book.title)}" loading="lazy"><h2>${esc(book.title)}</h2><p>${esc(book.author)}</p><p class="desc">${esc(book.subTitle || 'Discover the key ideas from this book.')}</p><p class="meta">◷ 03:24　☆ ${esc(book.averageRating || '4.3')}</p></article>`;
}

async function loadBooks() {
  try {
    const [response, selectedResponse] = await Promise.all([fetch(API), fetch(SELECTED_API)]);
    if (!response.ok || !selectedResponse.ok) throw new Error('Books unavailable');
    const books = await response.json();
    const selectedBooks = await selectedResponse.json();
    document.querySelector('#recommended').innerHTML = books.slice(0, 5).map(bookCard).join('');
    document.querySelector('#suggested').innerHTML = books.slice(5, 10).map(bookCard).join('');
    const featured = selectedBooks[0] || books.find((book) => book.title.toLowerCase().includes('lean startup'));
    if (featured) {
      document.querySelector('#featured-image').src = featured.imageLink;
      document.querySelector('#featured-title').textContent = featured.title;
      document.querySelector('#featured-author').textContent = featured.author;
    }
  } catch {
    document.querySelectorAll('.book-grid').forEach((grid) => {
      grid.innerHTML = '<div class="loading">Books are temporarily unavailable.</div>';
    });
  }
}

document.querySelector('#logout').addEventListener('click', () => localStorage.removeItem('summaristGuest'));
document.querySelector('#search-button').addEventListener('click', () => {
  const query = document.querySelector('#search').value.toLowerCase();
  document.querySelectorAll('.book-card').forEach((card) => {
    card.hidden = !card.innerText.toLowerCase().includes(query);
  });
});
loadBooks();
