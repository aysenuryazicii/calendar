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
let counterForPrevDays = 0;
let prevLastDay;

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
  counterForPrevDays = 0;
  date.setDate(1);

  // Bulunduğumuz ayın kaç gün sürdüğü
  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  // Bir önceki ayın kaç gün sürdüğü
  prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

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
    counterForPrevDays++;
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
  clickedMonth = monthHeader.textContent.split(" ")[0];

  dateBox = document.querySelectorAll(".date");
  dateBox.forEach((dateBox) =>
    dateBox.addEventListener("click", function () {
      dateBox.classList.add("clicked-date");
      clickedDate = dateBox.textContent;
      clickedMonth = monthHeader.textContent.split(" ")[0];
      clickedYear = monthHeader.textContent.split(" ")[1];
    })
  );
  readSQL(clickedMonth);
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

const init = function () {
  initFunc();
  btnToday.addEventListener("click", function () {
    initFunc();
  });
};

const initFunc = function () {
  month.style.backgroundColor = "#118452";
  date = new Date();
  calcDate();
};

// --------------------------------------
// --------- Buttons --------------------
// --------------------------------------

btnEkleme.addEventListener("click", function () {
  clickedMonthNum = months.findIndex((month) => month === clickedMonth);
  if (eventBox.value) eventName = eventBox.value;
  else return;
  eventBox.value = "";

  const eventDiv = document.createElement("p");
  eventDiv.classList.add("event-name");
  eventDiv.textContent = eventName;
  document.querySelector(".clicked-date")?.prepend(eventDiv);

  coloringEventName();

  InsertSQL(clickedDate, clickedMonthNum + 1, clickedYear, eventName);

  document.querySelector(".clicked-date")?.classList.remove("clicked-date");
});

btnSilme.addEventListener("click", function () {
  clickedMonthNum = months.findIndex((month) => month === clickedMonth);
  clickedDate =
    document.querySelector(".clicked-date")?.childNodes[1]?.textContent;

  clickCheckForNothing();
  deleteSQL(clickedDate, clickedMonthNum + 1, clickedYear);

  document.querySelector(".clicked-date")?.classList.remove("clicked-date");
});

btnGuncelleme.addEventListener("click", function () {
  clickedMonthNum = months.findIndex((month) => month === clickedMonth);
  clickedDate =
    document.querySelector(".clicked-date")?.childNodes[1]?.textContent;
  eventName = eventBox.value;
  eventBox.value = "";

  clickCheckForNothing(eventName);
  updateSQL(clickedDate, clickedMonthNum + 1, clickedYear, eventName);

  document.querySelector(".clicked-date")?.classList.remove("clicked-date");
});

// Random renk oluşturma
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomColor = () =>
  `rgba(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)}, 0.7)`;

const coloringEventName = function () {
  document
    .querySelectorAll(".event-name")
    .forEach((e) => (e.style.color = month.style.backgroundColor));
};

///////////////////////////////////////////////
//////////////-----WebSQL------////////////////
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
        `"${eventName}"` +
        " WHERE day=" +
        clickedDate +
        " AND month=" +
        clickedMonth +
        " AND year=" +
        clickedYear
    );
  });
};

const readSQL = function (clickedMonth) {
  db.transaction(function (tx) {
    clickedMonthNum = months.findIndex((month) => month === clickedMonth);
    dateBox = document.querySelectorAll(".date");
    let dayOfEvent;

    tx.executeSql(
      `SELECT * FROM Events_Table WHERE month=${clickedMonthNum + 1}`,
      [],
      function (tx, results) {
        var len = results.rows.length;
        for (let i = 0; i < len; i++) {
          dayOfEvent =
            Number(dateBox[results.rows[i].day].childNodes[0]?.textContent) -
            1 +
            counterForPrevDays;

          if (dayOfEvent > prevLastDay) dayOfEvent -= prevLastDay;

          if (
            Number(
              document.querySelector(
                `body > div.container > div > div.days-container > div > div:nth-child(${
                  dayOfEvent + counterForPrevDays
                })`
              )?.textContent
            ) === dayOfEvent
          ) {
            const eventDivTag = document.createElement("p");
            eventDivTag.classList.add("event-name");
            eventDivTag.textContent = results.rows[i].event;

            document
              .querySelector(
                `body > div.container > div > div.days-container > div > div:nth-child(${
                  dayOfEvent + counterForPrevDays
                })`
              )
              ?.prepend(eventDivTag);

            coloringEventName();
          }
        }
      },
      null
    );
  });
};

const clickCheckForNothing = function (eventName = "") {
  if (
    document.querySelector(".clicked-date")?.firstElementChild !=
    document.querySelector(".badge")
  ) {
    if (
      document.querySelector(".clicked-date")?.lastElementChild ===
      document.querySelector(".badge")
    ) {
      document.querySelector(".clicked-date").firstElementChild.textContent =
        eventName;
    } else if (document.querySelector(".clicked-date")?.firstElementChild) {
      document.querySelector(".clicked-date").firstElementChild.textContent =
        eventName;
    }
  }
};

init();
