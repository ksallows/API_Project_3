const key = 'c4264a32a0163befd4df072d8e0f61546031b502';
const url = 'https://calendarific.com/api/v2/';
const inputCountry = document.getElementById('country');
const inputYear = document.getElementById('year');
const getHolidaysButton = document.getElementById('get');
const dataDiv = document.getElementById('data');
const errorDiv = document.getElementById('error');
let countries = {};
let countryCode;

let error = code => {
    switch (code) {
        case 1: errorDiv.innerHTML = 'We weren\'t able to find that country. Check your spelling and try again.'; break;
        case 2: errorDiv.innerHTML = 'Country and year are required.'; break;
        case 3: errorDiv.innerHTML = 'Please enter a valid year between 1800 and 2049.'; break;
    }
    showError();
}

let showError = () => errorDiv.classList.remove('d-none');
let hideError = () => errorDiv.classList.add('d-none');

let createElement = (element, classNames, content, id, increment, collapseToggle = false) => {
    let item = document.createElement(element);
    if (collapseToggle) {
        item.setAttribute('data-bs-target', `#collapse${increment}`)
        item.setAttribute('data-bs-toggle', 'collapse')
    }
    if (id) item.id = id;
    if (classNames.includes('accordion-collapse')) item.setAttribute('data-bs-parent', 'accordion')
    if (element = 'button') item.setAttribute('type', 'button');
    item.classList.add(...classNames);
    item.innerHTML = content;
    return item;
}

let getHolidays = async (country, year) => {
    if (!country || !year) return error(2);
    if (isNaN(parseInt(year)) || year > 2049 || year < 1800) return error(3);
    country = country.toUpperCase();
    if (Object.keys(countries).length == 0) {
        await fetch(`${url}countries?api_key=${key}`)
            .then(result => result.json())
            .then(result => {
                for (i = 0; i < result.response.countries.length; i++) {
                    countries[result.response.countries[i].country_name.toUpperCase()] = result.response.countries[i]['iso-3166'];
                }
            })
    }
    if (Object.keys(countries).includes(country)) countryCode = countries[country];
    else return error(1);

    await fetch(`${url}holidays?api_key=${key}&year=${year}&country=${countryCode}`)
        .then(result => result.json())
        .then(result => {
            dataDiv.innerHTML = "";
            let accordion = createElement('div', ['accordion', 'accordion-flush'], '', 'accordion', i);
            dataDiv.appendChild(accordion);
            for (i = 0; i < result.response.holidays.length; i++) {
                // prevent duplicates
                let previousItem;
                if (i > 0) previousItem = result.response.holidays[i - 1].name;
                if (previousItem != result.response.holidays[i].name || i == 0) {
                    let accItem = createElement('div', ['accordion-item'], '', '', i);
                    let accHeader = createElement('h2', ['accordion-header'], '', `heading${i}`, i);
                    let itemDate = result.response.holidays[i].date.datetime;
                    let { year, month, day } = itemDate;
                    let accButton = createElement('button', ['accordion-button', 'collapsed'], '<strong>' + result.response.holidays[i].name + '</strong><span></span>' + `${month}/${day}/${year}`, '', i, true);
                    let accCollapse = createElement('div', ['accordion-collapse', 'collapse'], '', `collapse${i}`, i);
                    let accBody = createElement('div', ['accordion-body'], result.response.holidays[i].description, '', i);
                    accordion.appendChild(accItem);
                    accItem.appendChild(accHeader);
                    accHeader.appendChild(accButton);
                    accItem.appendChild(accCollapse);
                    accCollapse.appendChild(accBody);
                }
            }
            hideError();
        })
}

getHolidaysButton.addEventListener('click', () => getHolidays(inputCountry.value, inputYear.value));