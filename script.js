// Dynamic Adapt v.1
// HTML data-da="where(uniq class name),position(digi),when(breakpoint)"
// e.x. data-da="item,769,last,min"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle

// массив DOM-элементов
const elements = [...document.querySelectorAll('[data-da]')];
// массив объектов
const elementsArray = [];

// Функция получения индекса внутри родителя
const indexInParent = (parent, element) => [...parent.children].indexOf(element);

// Сортировка массива по breakpoint и place по возрастанию
const arraySort = (arr) => {
  arr.sort((a, b) => {
    if (a.breakpoint === b.breakpoint) {
      if (a.place === b.place) {
        return 0;
      }
      if (a.place === 'first' || b.place === 'last') {
        return -1;
      }
      if (a.place === 'last' || b.place === 'first') {
        return 1;
      }
      return a.place - b.place;
    }
    return a.breakpoint - b.breakpoint;
  });
};

// наполнение elementsArray объктами
elements.forEach((element) => {
  const data = element.dataset.da.trim();
  if (data !== '') {
    const dataArray = data.split(',');

    const oElement = {};
    oElement.element = element;
    oElement.parent = element.parentNode;
    oElement.destination = document.querySelector(`.${dataArray[0].trim()}`);
    oElement.breakpoint = dataArray[1] ? dataArray[1].trim() : '769';
    oElement.place = dataArray[2] ? dataArray[2].trim() : 'last';
    oElement.type = dataArray[3] ? dataArray[3].trim() : 'min';

    elementsArray.push(oElement);
  }
});

// вызов сортировки массива
arraySort(elementsArray);

// Функция перемещения
const moveTo = (place, element, destination) => {
  if (place === 'last' || place >= destination.children.length) {
    destination.append(element);
    return;
  }
  if (place === 'first') {
    destination.prepend(element);
    return;
  }
  destination.children[place].before(element);
};

// Функция возврата
const moveBack = (parent, element, index) => {
  if (parent.children[index] === undefined) {
    parent.append(element);
    return;
  }
  parent.children[index].before(element);
};

// Основная функция
const mediaHandler = (media, breakpointMeida) => {
  // массив объектов с подходящим брейкпоинтом
  const elementsFilter = elementsArray.filter(({ breakpoint }) => breakpoint === breakpointMeida);
  if (media.matches) {
    elementsFilter.forEach((oElement) => {
      // получение индекса внутри родителя
      oElement.index = indexInParent(oElement.parent, oElement.element);
      moveTo(oElement.place, oElement.element, oElement.destination);
    });
  } else {
    elementsFilter.forEach(({ parent, element, index }) => {
      moveBack(parent, element, index);
    });
  }
};

// массив уникальных медиа-запросов
const mediaArray = elementsArray
  .map(({ type, breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`)
  .filter((item, index, self) => self.indexOf(item) === index);

// навешивание слушателя на медиа-запрос 
// и вызов обработчика при первом запуске
mediaArray.forEach((item) => {
  const itemSplit = item.split(',');
  const media = window.matchMedia(itemSplit[0]);
  const breakpoint = itemSplit[1];
  media.addEventListener('change', mediaHandler.bind(null, media, breakpoint));
  mediaHandler.call(null, media, breakpoint);
});
