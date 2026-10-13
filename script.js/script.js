"use strict";

/*
  CAREPOINT HOSPITAL — FRONT-END DEMO

  This is a learning prototype, not a secure medical portal.
  Use a proper backend, secure sessions, password hashing,
  access controls and a database before handling real patients.
*/

const $ = (selector) => document.querySelector(selector);

const authScreen = $("#authScreen");
const dashboard = $("#dashboard");
const loginForm = $("#loginForm");
const registerForm = $("#registerForm");

const STORAGE = {
  users: "carepoint_demo_users",
  session: "carepoint_demo_session",
  appointments: "carepoint_demo_appointments",
};

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    icon: "👩‍⚕️",
    bio: "General consultations and preventive healthcare.",
  },
  {
    id: 2,
    name: "Dr. Michael Adams",
    specialty: "Cardiology",
    icon: "👨‍⚕️",
    bio: "Heart health assessment and cardiac care.",
  },
  {
    id: 3,
    name: "Dr. Grace Williams",
    specialty: "Paediatrics",
    icon: "👩‍⚕️",
    bio: "Healthcare for babies, children and adolescents.",
  },
  {
    id: 4,
    name: "Dr. David Brown",
    specialty: "Dermatology",
    icon: "👨‍⚕️",
    bio: "Assessment of skin, hair and nail conditions.",
  },
  {
    id: 5,
    name: "Dr. Emily Clark",
    specialty: "Gynaecology",
    icon: "👩‍⚕️",
    bio: "Women's health consultations and care.",
  },
  {
    id: 6,
    name: "Dr. James Wilson",
    specialty: "Orthopaedics",
    icon: "👨‍⚕️",
    bio: "Bone, joint and musculoskeletal assessment.",
  },
];

let currentUser = null;
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readStorage(STORAGE.users, []);
}

function getAppointments() {
  return readStorage(STORAGE.appointments, []);
}

function userAppointments() {
  return getAppointments().filter((item) => item.email === currentUser?.email);
}

function updateAppointments(items) {
  saveStorage(STORAGE.appointments, items);
}

function setMessage(selector, text, type = "error") {
  const element = $(selector);
  element.textContent = text;
  element.className = `message ${type}`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function showAuth(mode = "login") {
  authScreen.classList.remove("hidden");
  dashboard.classList.add("hidden");

  loginForm.classList.toggle("hidden", mode !== "login");
  registerForm.classList.toggle("hidden", mode !== "register");

  $("#loginMessage").textContent = "";
  $("#registerMessage").textContent = "";

  $("#loginPassword").value = "";
  $("#registerPassword").value = "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDashboard() {
  if (!currentUser) {
    showAuth("login");
    return;
  }

  authScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");

  $("#topName").textContent = currentUser.name;
  $("#welcomeName").textContent = currentUser.name.split(" ")[0];
  $("#topAvatar").textContent = currentUser.name.charAt(0).toUpperCase();

  $("#profileName").value = currentUser.name;
  $("#profileEmail").value = currentUser.email;
  $("#profileAvatar").textContent = currentUser.name.charAt(0).toUpperCase();

  renderDoctors();
  renderAppointments();
  updateStats();
  renderPieChart();
  showSection("overview");
}

// LOGIN AND REGISTRATION

$("#showRegister").addEventListener("click", () => showAuth("register"));
$("#showLogin").addEventListener("click", () => showAuth("login"));

document.querySelectorAll(".show-password").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    const reveal = input.type === "password";

    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "Hide" : "Show";
  });
});

$("#register").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#registerName").value.trim();
  const email = $("#registerEmail").value.trim().toLowerCase();
  const password = $("#registerPassword").value;

  if (name.length < 2) {
    setMessage("#registerMessage", "Please enter your full name.");
    return;
  }

  if (password.length < 8) {
    setMessage("#registerMessage", "Use a password of at least 8 characters.");
    return;
  }

  const users = getUsers();

  if (users.some((user) => user.email === email)) {
    setMessage(
      "#registerMessage",
      "This email is already registered. Please sign in.",
    );
    return;
  }

  /*
    DEMO ONLY: this saves a password in browser storage.
    Never use this authentication approach in a real website.
    Production authentication belongs on a secure server.
  */
  users.push({ name, email, password });
  saveStorage(STORAGE.users, users);

  setMessage(
    "#registerMessage",
    "Account created! You can now sign in.",
    "success",
  );

  $("#register").reset();

  setTimeout(() => showAuth("login"), 700);
});

$("#login").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = $("#loginEmail").value.trim().toLowerCase();
  const password = $("#loginPassword").value;

  const user = getUsers().find(
    (item) => item.email === email && item.password === password,
  );

  if (!user) {
    setMessage("#loginMessage", "Incorrect email or password. Try again.");
    return;
  }

  currentUser = { name: user.name, email: user.email };

  // Remember-me is a convenience for this demo, not secure authentication.
  if ($("#rememberMe").checked) {
    saveStorage(STORAGE.session, currentUser);
  } else {
    sessionStorage.setItem(STORAGE.session, JSON.stringify(currentUser));
    localStorage.removeItem(STORAGE.session);
  }

  showDashboard();
});

$("#forgotPassword").addEventListener("click", (event) => {
  event.preventDefault();
  alert(
    "Password recovery is not connected in this demo. " +
      "A live site should send a secure password-reset link to the registered email.",
  );
});

// DASHBOARD NAVIGATION

function showSection(sectionId) {
  if (!currentUser) {
    showAuth("login");
    return;
  }

  const section = document.getElementById(sectionId);

  if (!section || !section.classList.contains("page-section")) {
    return;
  }

  document.querySelectorAll(".page-section").forEach((page) => {
    page.classList.toggle("hidden", page.id !== sectionId);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    const active = link.dataset.section === sectionId;
    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(link.dataset.section);
  });
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.go);
  });
});

$("#menuToggle").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (
    window.innerWidth <= 720 &&
    $("#sidebar").classList.contains("open") &&
    !$("#sidebar").contains(event.target) &&
    !$("#menuToggle").contains(event.target)
  ) {
    $("#sidebar").classList.remove("open");
  }
});

// DOCTOR DIRECTORY

function createDoctorCard(doctor) {
  const card = document.createElement("article");
  card.className = "doctor-card";

  const avatar = document.createElement("div");
  avatar.className = "doctor-avatar";
  avatar.textContent = doctor.icon;

  const name = document.createElement("h3");
  name.textContent = doctor.name;

  const specialty = document.createElement("div");
  specialty.className = "specialty";
  specialty.textContent = doctor.specialty;

  const bio = document.createElement("p");
  bio.textContent = doctor.bio;

  const button = document.createElement("button");
  button.className = "btn primary full";
  button.type = "button";
  button.textContent = "Book appointment";

  button.addEventListener("click", () => {
    $("#doctorSelect").value = String(doctor.id);
    showSection("appointments");
    $("#appointmentDate").focus();
  });

  card.append(avatar, name, specialty, bio, button);
  return card;
}

function renderDoctors(search = "") {
  const featured = $("#featuredDoctors");
  const all = $("#allDoctors");
  const term = search.trim().toLowerCase();

  featured.replaceChildren();
  all.replaceChildren();

  doctors.slice(0, 3).forEach((doctor) => {
    featured.appendChild(createDoctorCard(doctor));
  });

  const filtered = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(term),
  );

  filtered.forEach((doctor) => {
    all.appendChild(createDoctorCard(doctor));
  });

  $("#noDoctors").classList.toggle("hidden", filtered.length > 0);

  const select = $("#doctorSelect");
  const previousValue = select.value;

  select.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a doctor";
  select.appendChild(placeholder);

  doctors.forEach((doctor) => {
    const option = document.createElement("option");
    option.value = String(doctor.id);
    option.textContent = `${doctor.name} — ${doctor.specialty}`;
    select.appendChild(option);
  });

  if (doctors.some((doctor) => String(doctor.id) === previousValue)) {
    select.value = previousValue;
  }
}

$("#doctorSearch").addEventListener("input", (event) => {
  renderDoctors(event.target.value);
});

// APPOINTMENT BOOKING

function todayString() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 10);
}

$("#appointmentDate").min = todayString();

function hasSlotConflict(doctorId, date, time) {
  return getAppointments().some(
    (item) =>
      item.doctorId === doctorId &&
      item.date === date &&
      item.time === time &&
      item.status === "Upcoming",
  );
}

$("#appointmentForm").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!currentUser) {
    showAuth("login");
    return;
  }

  const doctorId = Number($("#doctorSelect").value);
  const date = $("#appointmentDate").value;
  const time = $("#appointmentTime").value;
  const reason = $("#appointmentReason").value.trim();

  if (!doctorId || !date || !time) {
    setMessage("#bookingMessage", "Please choose a doctor, date and time.");
    return;
  }

  if (date < todayString()) {
    setMessage("#bookingMessage", "Choose today or a future date.");
    return;
  }

  if (hasSlotConflict(doctorId, date, time)) {
    setMessage(
      "#bookingMessage",
      "That doctor already has a booking at this time in the demo. Choose another slot.",
    );
    return;
  }

  const doctor = doctors.find((item) => item.id === doctorId);

  const appointment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: currentUser.email,
    doctorId,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date,
    time,
    reason,
    status: "Upcoming",
  };

  const appointments = getAppointments();
  appointments.push(appointment);
  updateAppointments(appointments);

  $("#appointmentForm").reset();
  $("#appointmentDate").min = todayString();

  setMessage(
    "#bookingMessage",
    "Demo booking saved to this browser.",
    "success",
  );

  renderAppointments();
  updateStats();
  renderPieChart();
  showToast("Appointment added to your demo dashboard.");
});

// APPOINTMENT DISPLAY AND CANCELLATION

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function sortedAppointments(items) {
  return [...items].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
}

function createAppointmentItem(item) {
  const row = document.createElement("div");
  row.className = "appointment-item";

  const date = document.createElement("div");
  date.className = "date-box";

  const day = document.createElement("strong");
  day.textContent = item.date.slice(8, 10);

  const month = document.createElement("small");
  month.textContent = new Date(`${item.date}T12:00:00`)
    .toLocaleDateString("en-GB", { month: "short" })
    .toUpperCase();

  date.append(day, month);

  const info = document.createElement("div");
  info.className = "appointment-info";

  const doctorName = document.createElement("strong");
  doctorName.textContent = item.doctorName;

  const detail = document.createElement("small");
  detail.textContent = `${item.specialty} · ${item.time}`;

  info.append(doctorName, detail);
  row.append(date, info);

  const status = document.createElement("span");
  status.className = `status ${item.status.toLowerCase()}`;
  status.textContent = item.status;
  row.appendChild(status);

  return row;
}

function renderAppointments() {
  if (!currentUser) return;

  const items = sortedAppointments(userAppointments());
  const now = new Date();

  // Past appointments are displayed as completed in this demo.
  const updated = getAppointments().map((item) => {
    if (
      item.email === currentUser.email &&
      item.status === "Upcoming" &&
      new Date(`${item.date}T${item.time}:00`) < now
    ) {
      return { ...item, status: "Completed" };
    }
    return item;
  });

  updateAppointments(updated);

  const currentItems = sortedAppointments(userAppointments());
  const upcoming = currentItems.filter((item) => item.status === "Upcoming");

  const upcomingList = $("#upcomingList");
  upcomingList.replaceChildren();

  if (!upcoming.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent =
      "No upcoming appointments. Book a visit to get started.";
    upcomingList.appendChild(empty);
  } else {
    upcoming.slice(0, 4).forEach((item) => {
      upcomingList.appendChild(createAppointmentItem(item));
    });
  }

  const rows = $("#appointmentRows");
  rows.replaceChildren();

  currentItems.forEach((item) => {
    const tr = document.createElement("tr");

    [
      `${item.doctorName} — ${item.specialty}`,
      formatDate(item.date),
      item.time,
    ].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = `status ${item.status.toLowerCase()}`;
    status.textContent = item.status;
    statusCell.appendChild(status);
    tr.appendChild(statusCell);

    const actionCell = document.createElement("td");

    if (item.status === "Upcoming") {
      const cancel = document.createElement("button");
      cancel.className = "cancel-btn";
      cancel.type = "button";
      cancel.textContent = "Cancel";

      cancel.addEventListener("click", () => {
        if (!confirm("Cancel this demo appointment?")) return;

        const latest = getAppointments().map((entry) =>
          entry.id === item.id && entry.email === currentUser.email
            ? { ...entry, status: "Cancelled" }
            : entry,
        );

        updateAppointments(latest);
        renderAppointments();
        updateStats();
        renderPieChart();
        showToast("Appointment cancelled.");
      });

      actionCell.appendChild(cancel);
    } else {
      actionCell.textContent = "—";
    }

    tr.appendChild(actionCell);
    rows.appendChild(tr);
  });

  $("#emptyAppointments").classList.toggle("hidden", currentItems.length > 0);
}

function updateStats() {
  const items = userAppointments();

  $("#totalAppointments").textContent = items.length;
  $("#upcomingAppointments").textContent = items.filter(
    (item) => item.status === "Upcoming",
  ).length;

  $("#doctorCount").textContent = doctors.length;
}

// PIE CHART

function renderPieChart() {
  const items = userAppointments();

  const upcoming = items.filter((item) => item.status === "Upcoming").length;
  const completed = items.filter((item) => item.status === "Completed").length;
  const cancelled = items.filter((item) => item.status === "Cancelled").length;
  const total = upcoming + completed + cancelled;

  const chart = $("#pieChart");
  const legend = $("#chartLegend");

  const values = [
    { label: "Upcoming", count: upcoming, color: "#087fbd" },
    { label: "Completed", count: completed, color: "#149b79" },
    { label: "Cancelled", count: cancelled, color: "#d84b58" },
  ];

  if (total === 0) {
    chart.style.background = "conic-gradient(#e6edf3 0deg 360deg)";
  } else {
    let currentAngle = 0;

    const segments = values.map((item) => {
      const start = currentAngle;
      currentAngle += (item.count / total) * 360;
      return `${item.color} ${start}deg ${currentAngle}deg`;
    });

    chart.style.background = `conic-gradient(${segments.join(", ")})`;
  }

  chart.setAttribute(
    "aria-label",
    `Appointment chart: ${upcoming} upcoming, ${completed} completed, ${cancelled} cancelled`,
  );

  legend.replaceChildren();

  values.forEach((item) => {
    const line = document.createElement("div");
    line.className = "legend-item";

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = item.color;

    const text = document.createElement("span");
    text.textContent = `${item.label}: ${item.count}`;

    line.append(dot, text);
    legend.appendChild(line);
  });
}

// PROFILE

$("#profileForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#profileName").value.trim();

  if (name.length < 2) {
    setMessage("#profileMessage", "Enter a valid name.");
    return;
  }

  const users = getUsers();
  const index = users.findIndex((user) => user.email === currentUser.email);

  if (index < 0) {
    setMessage("#profileMessage", "Account not found. Please sign in again.");
    return;
  }

  users[index].name = name;
  saveStorage(STORAGE.users, users);

  currentUser.name = name;

  if (localStorage.getItem(STORAGE.session)) {
    saveStorage(STORAGE.session, currentUser);
  } else {
    sessionStorage.setItem(STORAGE.session, JSON.stringify(currentUser));
  }

  $("#topName").textContent = name;
  $("#welcomeName").textContent = name.split(" ")[0];
  $("#topAvatar").textContent = name.charAt(0).toUpperCase();
  $("#profileAvatar").textContent = name.charAt(0).toUpperCase();

  setMessage("#profileMessage", "Profile updated.", "success");
  showToast("Profile updated successfully.");
});

// LOGOUT

$("#logout").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem(STORAGE.session);
  sessionStorage.removeItem(STORAGE.session);
  showAuth("login");
  $("#login").reset();
  showToast("You have signed out.");
});

// RESTORE DEMO SESSION

function restoreSession() {
  const saved = readStorage(STORAGE.session, null) || readSessionStorage();

  if (!saved || !saved.email) {
    showAuth("login");
    return;
  }

  const user = getUsers().find((item) => item.email === saved.email);

  if (!user) {
    localStorage.removeItem(STORAGE.session);
    sessionStorage.removeItem(STORAGE.session);
    showAuth("login");
    return;
  }

  currentUser = { name: user.name, email: user.email };
  showDashboard();
}

function readSessionStorage() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE.session));
  } catch {
    return null;
  }
}

restoreSession();
