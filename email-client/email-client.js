const apiBaseUrl = "https://flipkart-email-mock.now.sh";
let currentPage = 1;
let totalPages = 2; // Assuming there are 2 pages as per the instruction

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
});

async function loadEmails(page) {
  try {
    const response = await fetch(`${apiBaseUrl}/?page=${page}`);
    const data = await response.json();
    renderEmailList(data.list);
    updatePaginationControls();
  } catch (error) {
    console.error("Error fetching emails:", error);
  }
}

function renderEmailList(emails) {
  const emailList = document.getElementById("emailList");
  emailList.innerHTML = "";

  emails.forEach((email) => {
    const li = document.createElement("li");
    li.classList.add("email-item");

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

    li.addEventListener("click", () => loadEmailBody(email.id));
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

async function loadEmailBody(emailId) {
  try {
    const response = await fetch(`${apiBaseUrl}/?id=${emailId}`);
    const email = await response.json();
    displayEmailBody(email);
  } catch (error) {
    console.error("Error fetching email body:", error);
  }
}

function displayEmailBody(email) {
  const emailSubject = document.getElementById("emailSubject");
  const emailContent = document.getElementById("emailContent");
  const emailDateTime = document.getElementById("emailDateTime");

  emailSubject.textContent = `Subject: ${email.subject}`;
  emailContent.innerHTML = email.body; // Render HTML content
  emailDateTime.textContent = formatDateTime(email.date);
}
