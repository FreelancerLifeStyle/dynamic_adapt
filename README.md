# Динамический адаптив (Dynamic Adapt)
TS функция для комфортной адаптивной верстки. Позволяет "перебрасывать" объекты DOM в зависимости от потребностей.

## Применение.
Для перещаемого объекта пишем HTML атрибут - `data-da` и указываем параметры.  
В JavaScript или TypeScript создаем объект класса DynamicAdapt;

```js, ts
new DynamicAdapt();
```
## Параметры

`data-da="куда,когда,какой,тип,удаляемый_класс->назначаемый_класс"` - Блок перемещения  
`data-da="куда,когда,какой,тип,удаляемый_класс->назначаемый_класс;куда,когда,какой,тип,удаляемый_класс->назначаемый_класс"` Может быть несколько, через точку с запятой (Пробелы допускаются)

Название | Значение по-умолчанию | Описание
------------- | ------------- | ------------- 
`куда (имя класса)` | _\[обязательный\]_ | Класс блока, в который нужно будет "перебросить" текущий объект. Если класс не уникален, объек перебросится в первый элемент с этим классом.
`когда` | _\[обязательный\]_ | Брейкпоинт при котором перемещать объект.
`какой` | last | Позиция на которую нужно переместить объект внутри родителя `куда`. Кроме цифр можно указать слова `first` (в начало блока) или `last` (в конец блока)
`тип срабатывания брейкпоинта. (min или max)` | max  |  
`удаляемый_класс->назначаемый_класс` | нет | 'удаляемый класс' заменяется на 'назначаемый класс'

## Примеры

```html
<div data-da=".content__column-garden,992,max" class="content__block">Я Коля</div>
<div data-da=".content__column-garden,992,2,min" class="content__block">Я Коля</div>
<div data-da=".content__column-garden,992,2,min" class="content__block">Я Коля</div>
<div data-da=".content__column-garden,992,2,min;.content__column-river,767,last,max" class="content__block">Я Коля</div>
```

