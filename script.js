window.addEventListener('load', function () {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  document.getElementById('date1').value = yesterdayStr;
  document.getElementById('date2').value = today;


  createStars();
});

function createStars() {
  const starsContainer = document.getElementById('stars');
  const numStars = window.innerWidth < 768 ? 25 : 40;

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 40 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    starsContainer.appendChild(star);
  }
}


const apiKey = 'MLWxXqFZJ4KRxXMxmB7v5cYTMlM9GHvdfitvOogg';
const url = 'https://api.nasa.gov/planetary/apod';

async function getApod(date) {
  try {
    const response = await fetch(`${url}?api_key=${apiKey}&date=${date}`);
    if (!response.ok) {
      throw new Error(`failed to fetch data for ${date}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching APOD:', error);
    return {
      error: true,
      message: error.message
    };
  }
}

function generateNasaPageLink(date) {
  const [year, month, day] = date.split("-");
  const yy = year.slice(2);
  return `https://apod.nasa.gov/apod/ap${yy}${month}${day}.html`;
}

function renderApodData(containerId, data, date, colorClass) {
  const container = document.getElementById(containerId);

  if (data.error) {
    container.innerHTML = `
        <div class="apod-content">
          <p class="error-message">${data.message || 'Failed to load data'}</p>
        </div>
      `;
    return;
  }

  let mediaElement = '';
  const textColorClass = `text-${colorClass}`;

  if (data.media_type === 'image' && data.url.endsWith('.mp4')) {
    mediaElement = `
        <div class="media-container">
          <video class="apod-video" controls>
            <source src="${data.url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
  } else if (data.media_type === 'image') {
    mediaElement = `
        <div class="media-container">
          <img src="${data.url}" alt="${data.title}" class="apod-image" 
               loading="lazy" onclick="openModal('${data.hdurl || data.url}')">
        </div>
      `;
  } else if (data.media_type === 'video') {
    mediaElement = `
        <div class="media-container">
          <iframe src="${data.url}" class="apod-video" frameborder="0" allowfullscreen></iframe>
        </div>
      `;
  } else if (data.media_type === 'other') {
    const nasaArchiveLink = generateNasaPageLink(date);
    mediaElement = `
        <div class="media-container">
          <div class="other-content-placeholder">
            <i class="fas fa-external-link-alt"></i>
            <p>Interactive content available on NASA's archive</p>
            <a href="${nasaArchiveLink}" target="_blank" rel="noopener noreferrer" class="nasa-archive-btn">
              <i class="fas fa-archive"></i> Open directly
            </a>
          </div>
        </div>
      `;
  } else {
    mediaElement = `<p class="error-message">Unsupported media type: ${data.media_type}</p>`;
  }

  container.innerHTML = `
      <div class="apod-content">
        <h3 class="apod-title ${textColorClass}">${data.title}</h3>
        ${mediaElement}
        <p class="apod-explanation">${data.explanation.slice(0, 500)}...<a href="${generateNasaPageLink(date)}" target="_blank" rel="noopener noreferrer" class="more-link">View More on NASA</a></p>
        <div class="action-buttons">
          ${data.media_type === 'image' ? `
          <button class="download-btn" onclick="downloadImage('${data.hdurl || data.url}', '${data.title}')">
            <i class="fas fa-download"></i> Download HD
          </button>
          ` : ''}
        </div>
        <div class="date-tag ${textColorClass}">${date}</div>
      </div>
    `;

  setTimeout(() => {
    container.classList.add('visible');
    setTimeout(equalizeHeights, 300);
  }, 100);
}

async function compareApod() {
  const date1 = document.getElementById('date1').value;
  const date2 = document.getElementById('date2').value;

  if (!date1 || !date2) {
    alert("Please select both dates.");
    return;
  }
  if (date1 < "1995-06-16" || date2 < "1995-06-16") {
    alert("The earliest available date is 1995-06-16");
    return;
  }

  if (date1 > new Date().toISOString().split('T')[0] || date2 > new Date().toISOString().split('T')[0]) {
    alert("Please select a date that is not in the future.");
    return;
  }

  if (date1 === date2) {
    alert("Please select two different dates.");
    return;
  }

  try {
    document.getElementById('image1').innerHTML = '<div class="loading">Loading data...</div>';
    document.getElementById('image2').innerHTML = '<div class="loading">Loading data...</div>';

    const [data1, data2] = await Promise.all([
      getApod(date1),
      getApod(date2)
    ]);

    renderApodData('image1', data1, date1, 'blue');
    renderApodData('image2', data2, date2, 'blue');
  } catch (error) {
    console.error('Error in compareApod:', error);
    alert('An error occurred while fetching the data. Please try again.');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomDates() {
  const startDate = new Date(1995, 5, 16);
  const today = new Date();


  let date1, date2;
  do {
    const randomTime1 = startDate.getTime() + Math.random() * (today.getTime() - startDate.getTime());
    const randomTime2 = startDate.getTime() + Math.random() * (today.getTime() - startDate.getTime());

    date1 = new Date(randomTime1).toISOString().split('T')[0];
    date2 = new Date(randomTime2).toISOString().split('T')[0];
  } while (date1 === date2);

  document.getElementById('date1').value = date1;
  document.getElementById('date2').value = date2;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  compareApod();
}

function downloadImage(url, title) {
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function equalizeHeights() {
  const frames = document.querySelectorAll('.image-frame');
  let maxHeight = 0;

  frames.forEach(frame => {
    frame.style.height = 'auto';
    if (frame.offsetHeight > maxHeight) {
      maxHeight = frame.offsetHeight;
    }
  });

  frames.forEach(frame => {
    frame.style.height = `${maxHeight}px`;
  });
}

function openModal(src) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  modal.style.display = "block";
  modalImg.src = src;


  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });


  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}