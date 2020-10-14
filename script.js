// Dynamic Adapt v.1
// HTML data-da="where(uniq class name),when(breakpoint),position(digi),type (min, max)"
// e.x. data-da="item,767,last,max"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle

class DynamicAdapt {
	// массив объектов
	elementsArray = [];

	init() {
		// массив DOM-элементов
		this.elements = [...document.querySelectorAll('[data-da]')];

		// наполнение elementsArray объктами
		this.elements.forEach((element) => {
			const data = element.dataset.da.trim();
			if (data !== '') {
				const dataArray = data.split(',');

				const oElement = {};
				oElement.element = element;
				oElement.parent = element.parentNode;
				oElement.destination = document.querySelector(`.${dataArray[0].trim()}`);
				oElement.breakpoint = dataArray[1] ? dataArray[1].trim() : '767';
				oElement.place = dataArray[2] ? dataArray[2].trim() : 'last';
				oElement.type = dataArray[3] ? dataArray[3].trim() : 'max';

				this.elementsArray.push(oElement);
			}
		});

		this.arraySort(this.elementsArray);

		// массив уникальных медиа-запросов
		this.mediaArray = this.elementsArray
			.map(({ type, breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`)
			.filter((item, index, self) => self.indexOf(item) === index);

		// навешивание слушателя на медиа-запрос
		// и вызов обработчика при первом запуске
		this.mediaArray.forEach((item) => {
			const itemSplit = item.split(',');
			const media = window.matchMedia(itemSplit[0]);
			const breakpoint = itemSplit[1];
			media.addEventListener('change', this.mediaHandler.bind(this, media, breakpoint));
			this.mediaHandler.call(this, media, breakpoint);
		});
	}

	// Основная функция
	mediaHandler(media, breakpointMeida) {
		// массив объектов с подходящим брейкпоинтом
		const elementsFilter = this.elementsArray.filter(
			({ breakpoint }) => breakpoint === breakpointMeida,
		);

		if (media.matches) {
			elementsFilter.forEach((oElement) => {
				// получение индекса внутри родителя
				oElement.index = this.indexInParent(
					oElement.parent, oElement.element,
				);
				this.moveTo(oElement.place, oElement.element, oElement.destination);
			});
		} else {
			elementsFilter.forEach(({ parent, element, index }) => {
				this.moveBack(parent, element, index);
			});
		}
	}

	// Функция перемещения
	moveTo(place, element, destination) {
		if (place === 'last' || place >= destination.children.length) {
			destination.append(element);
			return;
		}
		if (place === 'first') {
			destination.prepend(element);
			return;
		}
		destination.children[place].before(element);
	}

	// Функция возврата
	moveBack(parent, element, index) {
		if (parent.children[index] === undefined) {
			parent.append(element);
			return;
		}
		parent.children[index].before(element);
	}

	// Функция получения индекса внутри родителя
	indexInParent(parent, element) {
		return [...parent.children].indexOf(element);
	}

	// Функция сортировки массива по breakpoint и place по возрастанию
	arraySort(arr) {
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
	}
}

const da = new DynamicAdapt();
da.init();