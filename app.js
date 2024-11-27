// Data Storage
let projects = [];

// Show Add Project Modal
document.getElementById('addProjectBtn').addEventListener('click', () => {
    document.getElementById('addProjectModal').style.display = 'block';
});

// Close Add Project Modal
document.getElementById('closeAddProjectModal').addEventListener('click', () => {
    document.getElementById('addProjectModal').style.display = 'none';
    document.getElementById('addProjectForm').reset();
});

// Close Description Modal
document.getElementById('closeDescriptionModal').addEventListener('click', () => {
    document.getElementById('descriptionModal').style.display = 'none';
});

// Handle Add Project Form Submission
function addProjectHandler(e) {
    e.preventDefault();

    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();

    // Check if project name already exists
    if (projects.some(project => project.name === name)) {
        alert('Project name already exists!');
        return;
    }

    const newProject = {
        name,
        description,
        missions: [],
        progress: 0
    };

    projects.push(newProject);

    // Close modal and reset form
    document.getElementById('addProjectModal').style.display = 'none';
    this.reset();

    // Update the UI
    displayProjects();
}

document.getElementById('addProjectForm').addEventListener('submit', addProjectHandler);

// Display Projects
function displayProjects() {
    const projectsContainer = document.getElementById('projectsContainer');
    projectsContainer.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-index', index);

        const descriptionPreview = project.description.length > 100 ? project.description.substring(0, 100) + '...' : project.description;

        projectCard.innerHTML = `
            <h3>${project.name}</h3>
            <p>
                ${descriptionPreview}
                <a href="#" class="read-more" data-index="${index}">Read More</a>
            </p>
            <div class="buttons">
                <button class="btn edit-btn" data-index="${index}">Edit</button>
                <button class="btn delete-btn" data-index="${index}">Delete</button>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: ${project.progress}%"></div>
            </div>
        `;

        projectsContainer.appendChild(projectCard);

        // Add click event to open project details
        projectCard.addEventListener('click', function (e) {
            if (!e.target.classList.contains('btn') && !e.target.classList.contains('read-more')) {
                openProjectDetails(index);
            }
        });
    });
}

// Delegate event listener for Read More, Edit, Delete
document.getElementById('projectsContainer').addEventListener('click', function (e) {
    const index = e.target.getAttribute('data-index');

    if (e.target.classList.contains('read-more')) {
        e.preventDefault();
        // Show full description
        const project = projects[index];
        document.getElementById('descTitle').innerText = project.name;
        document.getElementById('descContent').innerText = project.description;
        document.getElementById('descriptionModal').style.display = 'block';
    } else if (e.target.classList.contains('edit-btn')) {
        e.stopPropagation();
        // Edit project
        editProject(index);
    } else if (e.target.classList.contains('delete-btn')) {
        e.stopPropagation();
        // Delete project
        deleteProject(index);
    }
});

// Edit Project
function editProject(index) {
    const project = projects[index];

    // Show modal with current project data
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('addProjectModal').style.display = 'block';

    // Update the submit event
    const addProjectForm = document.getElementById('addProjectForm');
    addProjectForm.removeEventListener('submit', addProjectHandler);
    addProjectForm.addEventListener('submit', function updateProject(e) {
        e.preventDefault();

        const newName = document.getElementById('projectName').value.trim();
        const newDescription = document.getElementById('projectDescription').value.trim();

        // Check for duplicate names
        if (
            projects.some(
                (proj, idx) => proj.name === newName && idx != index
            )
        ) {
            alert('Another project with this name already exists!');
            return;
        }

        project.name = newName;
        project.description = newDescription;

        // Close modal and reset form
        document.getElementById('addProjectModal').style.display = 'none';
        addProjectForm.reset();

        // Restore default submit event
        addProjectForm.removeEventListener('submit', updateProject);
        addProjectForm.addEventListener('submit', addProjectHandler);

        displayProjects();
    });
}

// Delete Project
function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project? This will delete everything related to it.')) {
        projects.splice(index, 1);
        displayProjects();
    }
}

// Open Project Details
function openProjectDetails(index) {
    const project = projects[index];
    // Implement the UI to show project details and missions
    // For now, we can alert the project name
    alert(`Open project details for: ${project.name}`);
}

// Initial display
displayProjects();
