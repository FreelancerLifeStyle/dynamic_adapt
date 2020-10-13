// Dynamic Adapt v.1
// HTML data-da="where(uniq class name),position(digi),when(breakpoint)"
// e.x. data-da="item,769,last,min"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle

const daElements = document.querySelectorAll("[data-da]");
const daElementsArray = [];
let mediaArray = [];

//Функция получения индекса внутри родителя
const indexInParent = (parent, el) => [...parent.children].indexOf(el);

//Сортировка массива по возрастанию
const dynamicAdaptSort = (arr) => {
  arr.sort((a, b) => {
    if (a.breakpoint === b.breakpoint) {
      if (a.place === b.place) {
        return 0;
      }
      if (a.place === "first" || b.place === "last") {
        return -1;
      }
      if (a.place === "last" || b.place === "first") {
        return 1;
      }
      return a.place - b.place;
    }
    return a.breakpoint - b.breakpoint;
  });
}

if (daElements.length > 0) {
  daElements.forEach((daElement, id) => {
    const daData = daElement.dataset.da.trim();
    if (daData !== "") {
      const object = {};
      const daMove = daData.split(",");
      object.id = id;
      object.parent = daElement.parentNode;
      object.element = daElement;
      object.index = indexInParent(object.parent, daElement);

      object.destination = document.querySelector(`.${daMove[0].trim()}`);
      object.breakpoint = daMove[1] ? daMove[1].trim() : "769";
      object.place = daMove[2] ? daMove[2].trim() : "last";
      object.type = daMove[3] ? daMove[3].trim() : "min";

      daElement.dataset.daIndex = id;
      daElementsArray.push(object);
    }
  });
}

dynamicAdaptSort(daElementsArray);

const dynamicAdaptTo = (place, element, destination) => {
  console.log(place);
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
const dynamicAdaptBack = (parent, element, index) => {
  if (parent.children[index] == undefined) {
    parent.append(element);
    return;
  }
  parent.children[index].before(element);
};

const dynamicAdapt = (media, br) => {
  const array = daElementsArray.filter(({ breakpoint }) => breakpoint == br);
  if (media.matches) {
    console.log('if')
    array.forEach(({ place, element, destination }) => {
      dynamicAdaptTo(place, element, destination)
    });
  } else {
    console.log('else')
    array.forEach(({ parent, element, index }) => {
      dynamicAdaptBack(parent, element, index);
    });
  }
};

mediaArray = daElementsArray.map(({ type, breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`);
mediaArray = [...new Set(mediaArray)];
mediaArray.forEach((item) => {
  const arr = item.split(',')
  const media = window.matchMedia(arr[0]);
  breakpoint = arr[1];
  media.addEventListener("change", dynamicAdapt.bind(null, media, breakpoint));
  dynamicAdapt.call(null, media, breakpoint);
});
console.log(...mediaArray)
