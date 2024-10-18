const apiBaseUrl = "https://flipkart-email-mock.now.sh";
let currentPage = 1;
let totalPages = 2; // Assuming there are 2 pages
let emailsData = []; // Store all emails fetched
let favoriteEmails = new Set(); // Store favorite email IDs
let readEmails = new Set(); // Store read email IDs
let filter = "all"; // Current filter (all, favorites, read, unread)

document.addEventListener("DOMContentLoaded", () => {
  loadEmails(currentPage);

  // Pagination controls
  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadEmails(currentPage);
    }
  });

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadEmails(currentPage);
    }
  });

  // Filter change
  document.getElementById("filterEmails").addEventListener("change", (e) => {
    filter = e.target.value;
    renderEmailList();
  });
});

async function loadEmails(page) {
  try {
    const response = await fetch(`${apiBaseUrl}/?page=${page}`);
    const data = await response.json();
    emailsData = data.list; // Store the emails data
    renderEmailList();
    updatePaginationControls();
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
}

function renderEmailList() {
  const emailList = document.getElementById("emailList");
  emailList.innerHTML = "";

  const filteredEmails = filterEmails(emailsData);

  filteredEmails.forEach((email) => {
    const li = document.createElement("li");
    li.classList.add("email-item");
    li.classList.add(readEmails.has(email.id) ? "read" : "unread");

    if (favoriteEmails.has(email.id)) {
      li.classList.add("favorite");
    }

    // Avatar based on first letter of sender's name
    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = email.from.name[0].toUpperCase();

    // Email info
    const emailInfo = document.createElement("div");
    emailInfo.classList.add("email-info");
    emailInfo.innerHTML = `
      <strong>${email.subject}</strong>
      <p>${email.short_description}</p>
      <small>${formatDateTime(email.date)}</small>
    `;

    li.appendChild(avatar);
    li.appendChild(emailInfo);

    li.addEventListener("click", () => {
      loadEmailBody(email.id, email.date, email.subject);
      markAsRead(email.id);
    });
    emailList.appendChild(li);
  });
}

function updatePaginationControls() {
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

function filterEmails(emails) {
  switch (filter) {
    case "favorites":
      return emails.filter((email) => favoriteEmails.has(email.id));
    case "read":
      return emails.filter((email) => readEmails.has(email.id));
    case "unread":
      return emails.filter((email) => !readEmails.has(email.id));
    default:
      return emails;
  }
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
}

async function loadEmailBody(emailId, emailDate, emailSubject) {
  try {
    const response = await fetch(`${apiBaseUrl}/?id=${emailId}`);
    const email = await response.json();
    displayEmailBody(email, emailId, emailDate, emailSubject);
  } catch (error) {
    console.error("Error fetching email body:", error);
  }
}

function displayEmailBody(email, emailId, emailDate, subject) {
  const emailSubject = document.getElementById("emailSubject");
  const emailContent = document.getElementById("emailContent");
  const emailDateTime = document.getElementById("emailDateTime");
  const markFavoriteButton = document.getElementById("markFavorite");

  emailSubject.textContent = `Subject: ${subject}`;
  emailContent.innerHTML = email.body; // Render HTML content
  emailDateTime.textContent = formatDateTime(emailDate);

  // Show the "Mark as Favorite" button
  markFavoriteButton.style.display = "block";
  markFavoriteButton.textContent = favoriteEmails.has(emailId)
    ? "Unmark Favorite"
    : "Mark as Favorite";

  // Toggle favorite on button click
  markFavoriteButton.onclick = () => toggleFavorite(emailId);
}

function toggleFavorite(emailId) {
  const markFavoriteButton = document.getElementById("markFavorite");

  if (favoriteEmails.has(emailId)) {
    favoriteEmails.delete(emailId);
    markFavoriteButton.textContent = "Mark as Favorite";
  } else {
    favoriteEmails.add(emailId);
    markFavoriteButton.textContent = "Unmark Favorite";
  }

  renderEmailList();
}

function markAsRead(emailId) {
  readEmails.add(emailId); // Mark email as read
  renderEmailList(); // Re-render to apply read styles
}
