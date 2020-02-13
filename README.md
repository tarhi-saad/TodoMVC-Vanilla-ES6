# TodoMVC (Vanilla ES6)

Simply the best todo list app created using plain JavaScript (ES6). And all those awesome features were created from scratch _(Drag'n'Drop, animations, modal, sort (animated), search, tooltip, etc.)._

The goal of this project was to see how big and complex an app can be built before it was time to switch to a JavaScript framework ([ReactJS](https://reactjs.org/), [VueJS](https://vuejs.org/) or [Angular](https://angular.io/)).

It was possible to keep the project/code clean and maintainable thanks to the following:

- [The MVC design pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#detailmvcmvp)
- [The module design pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript)
- [The factory method pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#factorypatternjavascript)
- Unit testing ([Jest framework](https://jestjs.io/)) - Test driven development

## Table of contents

1. [Demo](#demo)
2. [App screenshots](#App-screenshots)
3. [Technologies](#technologies)
4. [Features & instructions](#features-&-instructions)
5. [Development](#development)

## Demo

Here is the working live demo:
[https://tarhi-saad.github.io/TodoMVC-Vanilla-ES6/](https://tarhi-saad.github.io/TodoMVC-Vanilla-ES6/).

## App screenshots

> **Desktop version**

![Desktop-screenshot](https://user-images.githubusercontent.com/14235870/74249199-16183e80-4ce9-11ea-9c47-cad8960e98b7.png)

> **Mobile version**

|                                                          **Mobile**                                                          |                                                          **tablet**                                                          |
| :--------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: |
| <img width="282" src="https://user-images.githubusercontent.com/14235870/74251992-482b9f80-4ced-11ea-8f91-6dd6a40b6eb4.png"> | <img width="448" src="https://user-images.githubusercontent.com/14235870/74251184-09491a00-4cec-11ea-8a6b-04623ce3fe57.png"> |

## Technologies

- Javascript modules, ES6
- Material Design
- The Web Storage API
- [Webpack 4](https://webpack.js.org/)
- [Jest framework](https://jestjs.io/) (Unit testing)

<img width="64" height="64" src="https://user-images.githubusercontent.com/14235870/74346940-99e92e00-4db0-11ea-9507-5d02d47afc11.png"><img width="64" height="64" src="https://user-images.githubusercontent.com/14235870/74348100-76bf7e00-4db2-11ea-966a-7e708614fa1e.png">

## Features & instructions

### 1- App structure

- There are default projects and you can **(create / delete / edit name)** of new ones.
- In every project you can **(create / delete / edit / set as completed)** our todos.
- Every todo has details.

### 2- Todo details

You can select a todo to access its details to do the following:

- Edit name
- Bookmark todo
- Add subtasks
- Add to **My Day** (see _Default projects_ below for more details)
- Add due date
- Set priority
- Add note

### 3- Default projects

- **All Tasks**: Here you can find and manipulate all todos from every project.\
  Todos created in this project will be added to **Tasks project**.

- **My Day**: It's the same as My Day feature in microsoft todo list. With My Day, you can manage your daily tasks while letting you start each day with a clean slate. When you first open My Day each day, you're greeted with a fresh space to add the tasks you want to accomplish that day.\
  Todos created in this project will have **My Day** set per default and added to **Tasks Project**.

- **Bookmarked**: If you set a todo as bookmarked you'll find it in this project.\
  Todos created in this project will get Bookmarked and added to **Tasks project**.

- **Planned**: Every todo who has a due date can be found here and organized as such: **(Earlier / Today / Tomorrow / Later this week / Next week / Later)**.\
  Todos created in this project will get **Today** as a due date and added to **Tasks project**.

- **Tasks**: This is the default project.

### 4- Sorting todos

- In every project you can sort todos (in ascending or descending order) by:

  - Alphabetically
  - Completed
  - Added to My Day
  - Bookmarked
  - Due date
  - Creation date
  - Priority

- Sorting todos is animated

- Sort options are saved for every project individually

### 5- Drag'n'Drop

- We can reorder todos by a simple **Drag'n'Drop**

- The new order is saved

- Touch screen support for **Drag'n'Drop** (The touch events API). You can activate **Drag'n'Drop** by a long press on the selected todo

- Animated **Drag'n'Drop**

### 6- Search feature

- Search for todos in every project

- You can edit todos while still in search mode

### 7- Indicators in todos

- There are indicators for every todo option that are added to the edited todo item:

  - My Day indicator
  - Subtask indicator
  - Due date indicator
  - Note indicator
  - Bookmarked indicator

- We can easily check our todo options without accessing its details view

### 8- Animation & design

- Material design

- Great & smooth animation with every interaction _(add todo, delete todo, toggle completed, sort, Drag'n'Drop, open/close project window, add subtask, delete subtask, etc.)_

### 9- Full mobile support

- App fully responsive and easy to use in small screen devices

- All features are supported (i.e. Drag'n'Drop, animations, etc.)

## Development

To set up this App locally:

1- Clone this repo to your desktop

2- Run `npm install` to install all the dependencies.

3- Run `npm start` to lunch the App.

## License

> You can check out the full license [here](LICENSE)

This project is licensed under the terms of the **GNU GPLv3** license.
