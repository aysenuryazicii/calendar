"use strict";

const month = document.querySelector(".month");
const monthHeader = document.querySelector(".month h1");
const days = document.querySelector(".days");
const prevMonth = document.querySelector(".before");
const nextMonth = document.querySelector(".after");
const btnToday = document.querySelector(".btn-today");
const btnEkleme = document.querySelector(".btn-ekleme");
const btnSilme = document.querySelector(".btn-silme");
const btnGuncelleme = document.querySelector(".btn-guncelleme");
const btnContainer = document.querySelector(".btn-container");
const eventBox = document.querySelector("#event");

let date = new Date();
let dateBox;
let clickedDate, clickedMonth, clickedYear;
let clickedMonthNum;
let eventName;

const months = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const calcDate = function () {
  date.setDate(1);

  // Bulunduğumuz ayın kaç gün sürdüğü
  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  // Bir önceki ayın kaç gün sürdüğü
  const prevLastDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    0
  ).getDate();

  // Son günün o ayda hangi güne denk geldiği
  const lastDayIndex = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDay();

  let firstDayStart = date.getDay();
  let nextDays = 7 - lastDayIndex;

  // HTML'e aktarma
  monthHeader.innerHTML = months[date.getMonth()] + " " + date.getFullYear();

  // Günleri oluşturma
  let everyDay = "";

  // günlerin 0 index ile pazar gününden başlamasını düzelttim
  if (firstDayStart <= 0) {
    firstDayStart = 7;
  }
  // Son gün pazar ise bir hafta nextDay ekrana basmasını düzelttim
  if (nextDays === 7) {
    nextDays = 0;
  }

  for (let j = firstDayStart - 1; j > 0; j--) {
    everyDay += `<div class="prev-date date">${prevLastDay - j + 1}</div>`;
  }

  for (let i = 1; i <= lastDayOfMonth; i++) {
    if (
      i === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear()
    ) {
      everyDay += `<div class="today-date date"><span class="badge">${i}</span></div>`;
    } else {
      everyDay += `<div class="date">${i}</div>`;
    }
  }

  for (let x = 1; x <= nextDays; x++) {
    everyDay += `<div class="next-date date">${x}</div>`;
  }

  // Günleri takvime atama
  days.innerHTML = everyDay;

  dateBox = document.querySelectorAll(".date");
  dateBox.forEach((dateBox) =>
    dateBox.addEventListener("click", function () {
      dateBox.classList.add("clicked-date");
      clickedDate = dateBox.textContent;
      clickedMonth = monthHeader.textContent.split(" ")[0];
      clickedYear = monthHeader.textContent.split(" ")[1];
    })
  );
};

prevMonth.addEventListener("click", () => {
  date.setMonth(date.getMonth() - 1);
  month.style.backgroundColor = randomColor();
  calcDate();
});

nextMonth.addEventListener("click", () => {
  date.setMonth(date.getMonth() + 1);
  month.style.backgroundColor = randomColor();
  calcDate();
});

btnToday.addEventListener("click", function () {
  month.style.backgroundColor = "#118452";
  date = new Date();
  calcDate();
});

calcDate();

// --------------------------------------
// --------- Buttons --------------------
// --------------------------------------

btnEkleme.addEventListener("click", function () {
  clickedMonthNum = months.findIndex((month) => month === clickedMonth);
  eventName = eventBox.value;
  eventBox.value = "";

  document.querySelector(
    ".clicked-date"
  ).innerHTML += `<div class="event-name"><br>${eventName}</div>`;

  InsertSQL(clickedDate, clickedMonthNum + 1, clickedYear, eventName);

  document
    .querySelectorAll(".event-name")
    .forEach((e) => (e.style.color = month.style.backgroundColor));
  document.querySelector(".clicked-date").classList.remove("clicked-date");
});

btnSilme.addEventListener("click", function () {
  clickedMonthNum = months.findIndex((month) => month === clickedMonth);

  document.querySelector(".clicked-date").lastElementChild.textContent = "";

  deleteSQL(clickedDate, clickedMonthNum + 1, clickedYear);

  document.querySelector(".clicked-date").classList.remove("clicked-date");
});

btnGuncelleme.addEventListener("click", function () {
  clickedMonthNum = months.findIndex((month) => month === clickedMonth);
  eventName = eventBox.value;
  eventBox.value = "";

  document.querySelector(".clicked-date").lastElementChild.textContent =
    eventName;

  updateSQL(clickedDate, clickedMonthNum + 1, clickedYear, eventName);

  document.querySelector(".clicked-date").classList.remove("clicked-date");
});

// Random renk oluşturma
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomColor = () =>
  `rgba(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)}, 0.7)`;

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

var db = openDatabase("mydb", "1.0", "Test DB", 4 * 1024 * 1024);

const InsertSQL = function (clickedDate, clickedMonth, clickedYear, eventName) {
  db.transaction(function (tx) {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Events_Table(day, month, year, event)"
    );
    tx.executeSql(
      "INSERT INTO Events_Table(day,month,year,event) VALUES (" +
        clickedDate +
        "," +
        clickedMonth +
        "," +
        clickedYear +
        "," +
        `"${eventName}"` +
        ")"
    );
  });
};

const deleteSQL = function (clickedDate, clickedMonth, clickedYear) {
  db.transaction(function (tx) {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Events_Table(day, month, year, event)"
    );
    tx.executeSql(
      "DELETE FROM Events_Table WHERE day=" +
        clickedDate +
        " AND month=" +
        clickedMonth +
        " AND year=" +
        clickedYear
    );
  });
};

const updateSQL = function (clickedDate, clickedMonth, clickedYear, eventName) {
  db.transaction(function (tx) {
    tx.executeSql(
      "UPDATE Events_Table SET event=" +
        eventName +
        " WHERE day=" +
        clickedDate +
        " AND month=" +
        clickedMonth +
        " AND year=" +
        clickedYear
    );
  });
};
