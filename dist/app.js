"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.projects = [];
        this.listeners = [];
    }
    addProject(title, description, people) {
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);
        // const newProject = {
        //   id: Math.random().toString(),
        //   title,
        //   description,
        //   people,
        // }
        this.projects.push(newProject);
        for (const fn of this.listeners) {
            fn(this.projects.slice());
        }
    }
    addListners(listenerFn) {
        this.listeners.push(listenerFn);
    }
    static getInstance() {
        if (this.instance)
            return this.instance;
        this.instance = new ProjectState();
        return this.instance;
    }
}
const projectState = ProjectState.getInstance();
function validate(dataInput) {
    let isValid = true;
    if (dataInput.required) {
        isValid = isValid && dataInput.value.toString().trim().length !== 0;
    }
    if (dataInput.minLength != null && typeof dataInput.value === 'string') {
        isValid = isValid && dataInput.value.trim().length >= dataInput.minLength;
    }
    if (dataInput.maxLength != null && typeof dataInput.value === 'string') {
        isValid = isValid && dataInput.value.trim().length <= dataInput.maxLength;
    }
    if (dataInput.max != null && typeof dataInput.value === 'number') {
        isValid = isValid && dataInput.value <= dataInput.max;
    }
    if (dataInput.min != null && typeof dataInput.value === 'number') {
        isValid = isValid && dataInput.value >= dataInput.min;
    }
    return isValid;
}
function autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        this.assignedProjects = [];
        const currentElement = document.importNode(this.templateElement.content, true).firstElementChild;
        currentElement.id = `${this.type}-projects`;
        this.element = currentElement;
        this.hostElement.insertAdjacentElement('beforeend', currentElement);
        this.renderContent();
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        projectState.addListners((projects) => {
            const relatedProject = projects.filter((data) => {
                if (this.type === 'active') {
                    return data.status === ProjectStatus.Active;
                }
                return data.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relatedProject;
            this.renderProjects();
        });
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + ' Projects';
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl === null || listEl === void 0 ? void 0 : listEl.appendChild(listItem);
        }
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const formElement = document.importNode(this.templateElement.content, true)
            .firstElementChild;
        formElement.id = 'user-input';
        this.titleInputElement = formElement.querySelector('#title');
        this.descriptionInputElement = formElement.querySelector('#description');
        this.peopleInputElement = formElement.querySelector('#people');
        // interstion
        formElement.addEventListener('submit', this.submitHandler);
        // formElement.addEventListener('submit', this.submitHandler.bind(this)) for old functions
        this.hostElement.insertAdjacentElement('afterbegin', formElement);
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidatable = {
            value: enteredTitle,
            required: true,
        };
        const descValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidatable) ||
            !validate(descValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid Input, please try again');
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    ///////////// Submit
    // private submitHandler = (event: Event) => {
    //   event.preventDefault()
    //   console.log(this.titleInputElement.value)
    // }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHandler", null);
const projectObj = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
