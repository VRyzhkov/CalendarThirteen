const months = [
  ["Tertiadecima", "Терциадецима"],
  ["Bitertiadecima", "Битерциадецима"],
  ["Tritertiadecima", "Тритерциадецима"],
  ["Quadritertiadecima", "Квадритерциадецима"],
  ["Quintertiadecima", "Квинтерциадецима"],
  ["Sextertiadecima", "Секстерциадецима"],
  ["Septitertiadecima", "Септитерциадецима"],
  ["Octotertiadecima", "Октотерциадецима"],
  ["Nonatertiadecima", "Нонатерциадецима"],
  ["Decitertiadecima", "Децитерциадецима"],
  ["Undecitertiadecima", "Ундецитерциадецима"],
  ["Duodecitertiadecima", "Дуодецитерциадецима"],
  ["Integra", "Интегра"],
].map(([latin, russian], index) => ({
  index: index + 1,
  latin,
  russian,
  startDay: index * 28 + 1,
}));

const seasons = [
  {
    id: "spring",
    title: "Весна",
    range: "Дни 001—091",
    start: 1,
    end: 91,
    monthIndexes: [1, 2, 3, 4],
    marker: 46,
  },
  {
    id: "summer",
    title: "Лето",
    range: "Дни 092—182",
    start: 92,
    end: 182,
    monthIndexes: [4, 5, 6, 7],
    marker: 137,
  },
  {
    id: "autumn",
    title: "Осень",
    range: "Дни 183—273",
    start: 183,
    end: 273,
    monthIndexes: [7, 8, 9, 10],
    marker: 228,
  },
  {
    id: "winter",
    title: "Зима",
    range: "Дни 274—364",
    start: 274,
    end: 364,
    monthIndexes: [10, 11, 12, 13],
    marker: 319,
  },
];

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const calendar = document.querySelector("#calendar");
const today = new Date();
const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const thisYearsStart = new Date(today.getFullYear(), 1, 5);
const currentYear = todayAtMidnight >= thisYearsStart ? today.getFullYear() : today.getFullYear() - 1;
const isLeapYear = currentYear % 4 === 0 && (currentYear % 100 !== 0 || currentYear % 400 === 0);

function utcDayNumber(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

function currentCalendarDate() {
  const yearStart = new Date(currentYear, 1, 5);
  const elapsedDay = utcDayNumber(todayAtMidnight) - utcDayNumber(yearStart) + 1;
  const leapDayPosition = 113;
  const sunDayPosition = 169 + (isLeapYear ? 1 : 0);

  if (isLeapYear && elapsedDay === leapDayPosition) return { type: "leap" };
  if (elapsedDay === sunDayPosition) return { type: "sun" };

  const baseDay =
    elapsedDay -
    (isLeapYear && elapsedDay > leapDayPosition ? 1 : 0) -
    (elapsedDay > sunDayPosition ? 1 : 0);

  return {
    type: "month",
    baseDay,
    month: Math.floor((baseDay - 1) / 28) + 1,
    day: ((baseDay - 1) % 28) + 1,
  };
}

const currentDate = currentCalendarDate();

function monthCard(month, season) {
  const rows = Array.from({ length: 4 }, (_, weekOffset) => {
    const weekNumber = (month.index - 1) * 4 + weekOffset + 1;
    const cells = Array.from({ length: 7 }, (_, weekdayOffset) => {
      const monthDay = weekOffset * 7 + weekdayOffset + 1;
      const yearDay = month.startDay + monthDay - 1;
      const isOutside = yearDay < season.start || yearDay > season.end;
      const isMarker = yearDay === season.marker;
      const hasSunDayAfter = season.id === "summer" && month.index === 6 && monthDay === 28;
      const isCurrentDay =
        currentDate.type === "month" &&
        currentDate.month === month.index &&
        currentDate.day === monthDay &&
        !isOutside;
      const classes = [
        isOutside ? "is-outside" : "",
        isMarker ? "is-marker" : "",
        hasSunDayAfter ? "has-sun-day" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const dayNumber = `<span class="day-number${isCurrentDay ? " is-current" : ""}"${
        isCurrentDay ? ' aria-label="Сегодня"' : ""
      }>${monthDay}</span>`;
      const dayContent = hasSunDayAfter
        ? `${dayNumber}<span class="sun-day${currentDate.type === "sun" ? " is-current" : ""}" role="img" aria-label="После этого числа — День Солнца">☀</span>`
        : dayNumber;

      return `<td${classes ? ` class="${classes}"` : ""}>${dayContent}</td>`;
    }).join("");

    return `<tr><td aria-label="Неделя ${weekNumber}">${weekNumber}</td>${cells}</tr>`;
  }).join("");

  return `
    <article class="month" aria-label="${month.russian}, месяц ${month.index}">
      <header class="month__heading">
        <div class="month__identity">
          <h3 class="month__name">
            ${month.russian}
            <span class="month__latin">${month.latin}</span>
          </h3>
        </div>
        <span class="month__share">${month.index}/13</span>
      </header>
      <table>
        <thead>
          <tr><th scope="col">№</th>${weekdays.map((day) => `<th scope="col">${day}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </article>`;
}

function intercalaryDays() {
  if (!isLeapYear) return "";

  return `
    <div class="intercalary-list" aria-label="Вненедельные дни">
      <div class="intercalary" data-intercalary="leap">
        <span class="intercalary__name">Високосный день</span>
        <span class="intercalary__position">после 28 Квадритерциадецимы</span>
      </div>
    </div>`;
}

function renderCalendar() {
  calendar.innerHTML = seasons
    .map((season) => {
      const cards = season.monthIndexes
        .map((monthIndex) => monthCard(months[monthIndex - 1], season))
        .join("");

      return `
        <section class="season" data-season="${season.id}" aria-label="${season.title}">
          <div class="season__months">${cards}</div>
          ${season.id === "summer" ? intercalaryDays() : ""}
        </section>`;
    })
    .join("");
}

renderCalendar();
