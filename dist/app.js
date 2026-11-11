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
const currentYear = new Date().getFullYear();
const isLeapYear = currentYear % 4 === 0 && (currentYear % 100 !== 0 || currentYear % 400 === 0);

function monthCard(month, season) {
  const rows = Array.from({ length: 4 }, (_, weekOffset) => {
    const weekNumber = (month.index - 1) * 4 + weekOffset + 1;
    const cells = Array.from({ length: 7 }, (_, weekdayOffset) => {
      const monthDay = weekOffset * 7 + weekdayOffset + 1;
      const yearDay = month.startDay + monthDay - 1;
      const isOutside = yearDay < season.start || yearDay > season.end;
      const isMarker = yearDay === season.marker;
      const classes = [isOutside ? "is-outside" : "", isMarker ? "is-marker" : ""]
        .filter(Boolean)
        .join(" ");

      return `<td${classes ? ` class="${classes}"` : ""}>${monthDay}</td>`;
    }).join("");

    return `<tr><td aria-label="Неделя ${weekNumber}">${weekNumber}</td>${cells}</tr>`;
  }).join("");

  return `
    <article class="month" aria-label="${month.russian}, месяц ${month.index}">
      <header class="month__heading">
        <div>
          <span class="month__index">${String(month.index).padStart(2, "0")}</span>
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
  return `
    <div class="intercalary-list" aria-label="Вненедельные дни">
      <div class="intercalary" data-intercalary="leap" ${isLeapYear ? "" : "hidden"}>
        <span class="intercalary__name">Високосный день</span>
        <span class="intercalary__position">после 28 Квадритерциадецимы</span>
      </div>
      <div class="intercalary" data-intercalary="sun">
        <span class="intercalary__name">День Солнца</span>
        <span class="intercalary__position">после 28 Секстерциадецимы</span>
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
        <section class="season" data-season="${season.id}" aria-labelledby="${season.id}-title">
          <header class="season__heading">
            <h2 class="season__title" id="${season.id}-title">${season.title}</h2>
            <span class="season__range">${season.range}</span>
          </header>
          <div class="season__months">${cards}</div>
          ${season.id === "summer" ? intercalaryDays() : ""}
        </section>`;
    })
    .join("");
}

renderCalendar();
