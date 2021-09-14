enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {}
}

type Listener = (items: Project[]) => void
class ProjectState {
  private projects: Project[] = []
  private listeners: Listener[] = []
  private static instance: ProjectState

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active,
    )
    // const newProject = {
    //   id: Math.random().toString(),
    //   title,
    //   description,
    //   people,
    // }
    this.projects.push(newProject)
    for (const fn of this.listeners) {
      fn(this.projects.slice())
    }
  }

  addListners(listenerFn: Listener) {
    this.listeners.push(listenerFn)
  }

  static getInstance() {
    if (this.instance) return this.instance
    this.instance = new ProjectState()
    return this.instance
  }
}
const projectState = ProjectState.getInstance()

interface Validatable {
  value: string | number
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  required?: boolean
}

function validate(dataInput: Validatable) {
  let isValid = true
  if (dataInput.required) {
    isValid = isValid && dataInput.value.toString().trim().length !== 0
  }
  if (dataInput.minLength != null && typeof dataInput.value === 'string') {
    isValid = isValid && dataInput.value.trim().length >= dataInput.minLength
  }
  if (dataInput.maxLength != null && typeof dataInput.value === 'string') {
    isValid = isValid && dataInput.value.trim().length <= dataInput.maxLength
  }
  if (dataInput.max != null && typeof dataInput.value === 'number') {
    isValid = isValid && dataInput.value <= dataInput.max
  }
  if (dataInput.min != null && typeof dataInput.value === 'number') {
    isValid = isValid && dataInput.value >= dataInput.min
  }

  return isValid
}

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this)
      return boundFn
    },
  }
  return adjDescriptor
}

class ProjectList {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLElement
  assignedProjects: Project[]

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById(
      'project-list',
    )! as HTMLTemplateElement
    this.hostElement = document.getElementById('app')! as HTMLDivElement
    this.assignedProjects = []

    const currentElement = document.importNode(
      this.templateElement.content,
      true,
    ).firstElementChild as HTMLElement
    currentElement.id = `${this.type}-projects`

    this.element = currentElement

    this.hostElement.insertAdjacentElement('beforeend', currentElement)
    this.renderContent()
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`

    projectState.addListners((projects: Project[]) => {
      const relatedProject = projects.filter((data) => {
        if (this.type === 'active') {
          return data.status === ProjectStatus.Active
        }
        return data.status === ProjectStatus.Finished
      })
      this.assignedProjects = relatedProject
      this.renderProjects()
    })

    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' Projects'
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`,
    ) as HTMLUListElement 
    listEl.innerHTML = ''
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li')
      listItem.textContent = prjItem.title
      listEl?.appendChild(listItem)
    }
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    this.templateElement = document.getElementById(
      'project-input',
    )! as HTMLTemplateElement
    this.hostElement = document.getElementById('app')! as HTMLDivElement

    const formElement = document.importNode(this.templateElement.content, true)
      .firstElementChild as HTMLFormElement
    formElement.id = 'user-input'

    this.titleInputElement = formElement.querySelector(
      '#title',
    ) as HTMLInputElement
    this.descriptionInputElement = formElement.querySelector(
      '#description',
    ) as HTMLInputElement
    this.peopleInputElement = formElement.querySelector(
      '#people',
    ) as HTMLInputElement

    // interstion
    formElement.addEventListener('submit', this.submitHandler)
    // formElement.addEventListener('submit', this.submitHandler.bind(this)) for old functions
    this.hostElement.insertAdjacentElement('afterbegin', formElement)
  }

  private clearInputs() {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value
    const enteredDescription = this.descriptionInputElement.value
    const enteredPeople = this.peopleInputElement.value

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    }
    const descValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    }
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    }

    if (
      !validate(titleValidatable) ||
      !validate(descValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid Input, please try again')
      return
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople]
    }
  }

  ///////////// Submit
  // private submitHandler = (event: Event) => {
  //   event.preventDefault()
  //   console.log(this.titleInputElement.value)
  // }
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault()
    const userInput = this.gatherUserInput()
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput
      console.log(title, description, people)
      projectState.addProject(title, description, people)
      this.clearInputs()
    }
  }
  // Submit end
}

const projectObj = new ProjectInput()
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
