type TypeWidth = "min" | "max";
type TypePlace = "first" | "last" | number;

interface ParentsIndexes {
    parent: HTMLDivElement;
    index: number;
    removeClass?: string;
    insertClass?: string;
}

class DynamicAdaptItem {

    private readonly _breakpoint: number;
    private readonly _place: TypePlace;
    private readonly _type: TypeWidth;
    private _parentsIndexes: ParentsIndexes[];
    private _movedCnt: number;

    static mobileStartWidth = 767;
    static padStartWidth = 992;

    set parentsIndexes(value: ParentsIndexes) {
        this._parentsIndexes.push(value);
    }

    public parentsIndexesPop(): void {
        this._parentsIndexes.pop();
    }

    get movedCnt(): number {
        return this.top._movedCnt;
    }

    get top(): DynamicAdaptItem {
        let top: DynamicAdaptItem | undefined = this;
        while (true) {
            if (!top.parentItem) {
                return top;
            } else {
                top = top.parentItem;
            }
        }
    }

    incMoved(): void {
        this.top._movedCnt++;
        console.log(`Class: ${this.element.textContent} movedCnt: ${this.movedCnt}`);
    }

    decMoved(): void {
        this.top._movedCnt--;
        console.log(`Class: ${this.element.textContent} movedCnt: ${this.movedCnt}`);
    }

    get type(): TypeWidth {
        return (this._type as TypeWidth) ? this._type : "max";
    }

    public get breakpoint(): number {
        return this._breakpoint;
    }

    public get index(): number {
        return this._parentsIndexes[this._parentsIndexes.length - 1].index;
    }

    public get parent(): HTMLDivElement {
        return this._parentsIndexes[this._parentsIndexes.length - 1].parent;
    }

    public get place(): number {
        return DynamicAdaptItem.place2Index(this._place, this.destination);
    }

    static str2Num(value: string, defaultValue = 0): number {
        return Number(value) || defaultValue;
    }

    static place2Index(value: TypePlace, destination: HTMLDivElement): number {
        const res = Number(value);
        if (res) {
            return res;
        }

        if (value === "last") {
            const children = Array.from(destination.children);
            return Array.isArray(children) ? children.length : 0;
        }

        if (value === "first") {
            return 0;
        }

        return 0;
    }

    static indexInParent(parent: HTMLDivElement, element: HTMLDivElement): number {
        const array: HTMLDivElement[] = Array.prototype.slice.call(parent.children);
        return array.indexOf(element);
    }

    constructor(breakpoint: string,
                public destination: HTMLDivElement,
                public element: HTMLDivElement,
                parent: HTMLDivElement,
                public parentItem: DynamicAdaptItem | undefined,
                place: TypePlace,
                type: TypeWidth,
                removeInsertClasses?: string
    ) {
        this._breakpoint = DynamicAdaptItem.str2Num(breakpoint, DynamicAdaptItem.mobileStartWidth);
        const removeInsertClassesArr = removeInsertClasses?.split("->");
        const removeClass = removeInsertClassesArr?.[0];
        const insertClass = removeInsertClassesArr?.[1];
        this._parentsIndexes = [{
            parent,
            index: DynamicAdaptItem.indexInParent(parent, element),
            removeClass,
            insertClass
        }];
        this._place = place;
        this._type = type;
        this._movedCnt = 0;
    }
}

class DynamicAdapt {
    // массив объектов
    private dataDaNodes: DynamicAdaptItem[] = [];
    private daClassname = "_dynamic_adapt_";

    constructor() {
        // наполнение objects объектами
        document.querySelectorAll<HTMLDivElement>("[data-da]")
            .forEach(node => {
                if (node.dataset.da) {
                    let dynamicAdaptItem: DynamicAdaptItem | undefined = undefined;
                    node.dataset.da.trim().split(";").forEach(blk => {
                        const dataArray: string[] = blk.split(",");

                        const destination = document.querySelector<HTMLDivElement>(dataArray[0].trim());

                        if (destination) {
                            dynamicAdaptItem = new DynamicAdaptItem(
                                dataArray[1].trim(),
                                destination,
                                node,
                                node.parentNode as HTMLDivElement,
                                dynamicAdaptItem,
                                dataArray.length === 2 ? dataArray[2].trim() as TypePlace : "last",
                                dataArray.length === 3 ? dataArray[3].trim() as TypeWidth : "max"
                            );

                            this.dataDaNodes.push(dynamicAdaptItem);
                        }
                    });
                }
            });

        // this.arraySort(this.dataDaNodes);
        // навешивание слушателя на медиа-запрос
        // и вызов обработчика при первом запуске
        this.dataDaNodes.map(item => `(${item.type}-width: ${item.breakpoint}px), ${item.breakpoint}`)
            .forEach(media => {
                const mediaSplit = media.split(",");
                const matchMedia = window.matchMedia(mediaSplit[0]);
                const mediaBreakpoint = Number(mediaSplit[1]);

                // массив объектов с подходящим брейкпоинтом
                const objectsFilter: DynamicAdaptItem[] = this.dataDaNodes.filter(_ => _.breakpoint === mediaBreakpoint);

                matchMedia.addEventListener("change", () => {
                    this.mediaHandler(matchMedia, objectsFilter);
                });

                this.mediaHandler(matchMedia, objectsFilter);
            });
    }


    // Функция сортировки массива по breakpoint и place
    // по возрастанию для this.type = min
    // по убыванию для this.type = max
    // private arraySort(arr: DynamicAdaptItem[]): void {
    //     arr.sort((a: DynamicAdaptItem, b: DynamicAdaptItem): number => {
    //         if (a.breakpoint === b.breakpoint) {
    //             if (a.place === b.place) {
    //                 return 0;
    //             }
    //
    //             if (this.type === "min") {
    //                 if (a.place < b.place) {
    //                     return -1;
    //                 }
    //
    //                 if (a.place > b.place) {
    //                     return 1;
    //                 }
    //
    //                 return a.place - b.place;
    //             } else {
    //                 if (b.place < a.place) {
    //                     return -1;
    //                 }
    //
    //                 if (b.place > a.place) {
    //                     return 1;
    //                 }
    //
    //                 return b.place - a.place;
    //             }
    //         }
    //
    //         if (this.type === "min") {
    //             return a.breakpoint - b.breakpoint;
    //         } else {
    //             return b.breakpoint - a.breakpoint;
    //         }
    //     });
    // }

    private mediaHandler(matchMedia: MediaQueryList, dynamicAdaptItems: DynamicAdaptItem[]) {
        dynamicAdaptItems.forEach(
            dynamicAdaptItem => {
                if (matchMedia.matches) {
                    const breakpoint = Number(matchMedia.media.split(":")[1].split("px")[0].trim());
                    if (breakpoint === dynamicAdaptItem.breakpoint) {
                        // todo Вставить новую пару parent-index если movedCnt > 0
                        if (dynamicAdaptItem.movedCnt > 0) {
                            const parent = dynamicAdaptItem.element.parentElement! as HTMLDivElement;
                            dynamicAdaptItem.parentsIndexes = {
                                parent,
                                index: DynamicAdaptItem.indexInParent(parent, dynamicAdaptItem.element)
                            };
                        }
                        this.moveTo(dynamicAdaptItem.place, dynamicAdaptItem.element, dynamicAdaptItem.destination);
                        dynamicAdaptItem.incMoved();
                    }

                } else {
                    if (dynamicAdaptItem.element.classList.contains(this.daClassname)) {
                        this.moveBack(dynamicAdaptItem.parent, dynamicAdaptItem.element, dynamicAdaptItem.index);
                        // todo Убрать последнюю пару parent-index если movedCnt > 0
                        if (dynamicAdaptItem.movedCnt > 1) {
                            dynamicAdaptItem.parentsIndexesPop();
                        }
                        dynamicAdaptItem.decMoved();
                        if (dynamicAdaptItem.movedCnt === 0) {
                            dynamicAdaptItem.element.classList.remove(this.daClassname);
                        }
                    }
                }
            }
        );
    }

    // Функция перемещения
    private moveTo(place: number, element: HTMLDivElement, destination: HTMLDivElement) {
        element.classList.add(this.daClassname);

        if (place >= destination.children.length) {
            destination.children[destination.children.length - 1].insertAdjacentElement("afterend", element);
            return;
        }

        destination.children[place].insertAdjacentElement("beforebegin", element);
    }

    // Функция возврата
    private moveBack(parent: HTMLDivElement, element: HTMLDivElement, index: number) {
        const children = Array.from(parent.children);
        if (children.length === 0) {
            parent.insertAdjacentElement("beforeend", element);
        } else if (children.length - 1 < index) {
            parent.children[children.length - 1].insertAdjacentElement("afterend", element);
        } else {
            parent.children[children.length - 1].insertAdjacentElement("beforebegin", element);
        }
    }
}

new DynamicAdapt();

