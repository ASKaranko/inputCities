// eslint-disable-next-line strict
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const input = document.getElementById('select-cities'),
    closeButton = document.querySelector('.close-button'),
    button = document.querySelector('.button'),
    dropdownListsDefault = document.querySelector('.dropdown-lists__list--default'),
    dropdownListsSelect = document.querySelector('.dropdown-lists__list--select'),
    dropdownListsAutocomplete = document.querySelector('.dropdown-lists__list--autocomplete'),
    label = document.querySelector('.label');

  button.href = 'javascript:void(0)';

  const getData = () => fetch('./db_cities.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const showDataListDefault = data => {
    dropdownListsDefault.style.display = 'block';
    const keys = Object.keys(data);
    keys.forEach(key => data[key].forEach(item => {
      const cities = item.cities.sort((x, y) => y.count - x.count).slice(0, 3);
      dropdownListsDefault.querySelector('.dropdown-lists__col').insertAdjacentHTML('afterbegin', `
      <div class="dropdown-lists__countryBlock">
        <div class="dropdown-lists__total-line">
          <div class="dropdown-lists__country">${item.country}</div>
          <div class="dropdown-lists__count">${item.count}</div>
        </div>
        <div class="dropdown-lists__line">
          <div class="dropdown-lists__city dropdown-lists__city--ip">${cities[0].name}</div>
          <div class="dropdown-lists__count">${cities[0].count}</div>
        </div>
        <div class="dropdown-lists__line">
          <div class="dropdown-lists__city dropdown-lists__city--ip">${cities[1].name}</div>
          <div class="dropdown-lists__count">${cities[1].count}</div>
        </div>
        <div class="dropdown-lists__line">
          <div class="dropdown-lists__city dropdown-lists__city--ip">${cities[2].name}</div>
          <div class="dropdown-lists__count">${cities[2].count}</div>
        </div>
      </div>
      `);
    }));
  };

  const cityChoice = (data, city) => {
    const keys = Object.keys(data);
    let selectedCity = '';
    keys.forEach(key => data[key].forEach(item => {
      item.cities.map(elem => {
        if (elem.name === city) {
          selectedCity = elem.link;
        }
      });
    }));
    button.href = selectedCity;
  };

  const showDataListSelect = (data, country) => {
    const keys = Object.keys(data);
    keys.forEach(key => data[key].forEach(item => {
      if (item.country === country) {
        dropdownListsDefault.style.display = 'none';
        dropdownListsSelect.style.display = 'block';
        dropdownListsSelect.querySelector('.dropdown-lists__col').innerHTML = '';
        dropdownListsSelect.querySelector('.dropdown-lists__col').insertAdjacentHTML('afterbegin', `
        <div class="dropdown-lists__countryBlock">
          <div class="dropdown-lists__total-line">
            <div class="dropdown-lists__country">${item.country}</div>
            <div class="dropdown-lists__count">${item.count}</div>
          </div>
        </div>
        `);
        const dropdownListsCountryBlock = dropdownListsSelect.querySelector('.dropdown-lists__countryBlock');

        item.cities.map((elem, i) => {
          dropdownListsCountryBlock.insertAdjacentHTML('beforeend', `
          <div class="dropdown-lists__line">
            <div class="dropdown-lists__city">${item.cities[i].name}</div>
            <div class="dropdown-lists__count">${item.cities[i].count}</div>
          </div>
          `);
        });

        dropdownListsSelect.addEventListener('click', event => {
          let target = event.target;
          target = target.closest('.dropdown-lists__total-line');

          if (target) {
            dropdownListsSelect.style.display = 'none';
            dropdownListsDefault.style.display = 'block';
          }
        });
      }
    }));
  };

  const showDataListAutocomplete = (data, value) => {
    dropdownListsAutocomplete.style.display = 'block';
    dropdownListsAutocomplete.querySelector('.dropdown-lists__col').innerHTML = '';
    dropdownListsAutocomplete.querySelector('.dropdown-lists__col').insertAdjacentHTML('afterbegin', `
        <div class="dropdown-lists__countryBlock">
        </div>
        `);
    const dropdownListsCountryBlock = dropdownListsAutocomplete.querySelector('.dropdown-lists__countryBlock');
    const keys = Object.keys(data);
    const autoElems = [];
    let j = 0;
    const revalue = new RegExp('^' + value, 'i');
    keys.forEach(key => data[key].forEach(item => {
      item.cities.map(elem => {
        if (elem.name.match(revalue)) {
          autoElems[j] = elem;
          j++;
        }
      });
    }));
    if (autoElems.length === 0) {
      dropdownListsCountryBlock.insertAdjacentHTML('beforeend', `
      <div class="dropdown-lists__line">
        <div class="dropdown-lists__city">${'Ничего не найдено'}</div>
      </div>
      `);
    } else {
      autoElems.forEach(item => {
        dropdownListsCountryBlock.insertAdjacentHTML('beforeend', `
        <div class="dropdown-lists__line">
          <div class="dropdown-lists__city">${item.name}</div>
          <div class="dropdown-lists__count">${item.count}</div>
        </div>
        `);
      });
    }
  };

  const eventListeners = data => {
    input.addEventListener('focus', () => {
      showDataListDefault(data);
      dropdownListsDefault.addEventListener('click', event => {
        const targetCountry = event.target.closest('.dropdown-lists__total-line');
        const targetCity = event.target.closest('.dropdown-lists__line');

        if (targetCountry) {
          const country = targetCountry.querySelector('.dropdown-lists__country').innerHTML;
          showDataListSelect(data, country);
          label.innerHTML = '';
          input.value = country;
          closeButton.style.display = 'inline';
        } else if (targetCity) {
          label.innerHTML = '';
          const city = targetCity.querySelector('.dropdown-lists__city').innerHTML;
          input.value = city;
          closeButton.style.display = 'inline';
          cityChoice(data, city);
        }
        closeButton.addEventListener('click', () => {
          input.value = '';
          label.innerHTML = 'Страна или город';
          dropdownListsDefault.style.display = 'none';
          dropdownListsSelect.style.display = 'none';
          closeButton.style.display = 'none';
          button.href = 'javascript:void(0)';
        });
      });
    });
    input.addEventListener('input', () => {
      dropdownListsSelect.style.display = 'none';

      if (input.value === '') {
        dropdownListsDefault.style.display = 'block';
        dropdownListsAutocomplete.style.display = 'none';
        button.href = 'javascript:void(0)';
      } else {
        dropdownListsDefault.style.display = 'none';
        showDataListAutocomplete(data, input.value);
      }
    });
  };

  getData()
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Статус не равно 200');
      }
      return response.json();
    })
    .then(response => {
      eventListeners(response);
    })
    .catch(error => console.log(error));

});
