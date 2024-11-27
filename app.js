// Data Storage
let projects = [];
let currentProjectIndex = null;

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

// Close Project Content Area
document.getElementById('closeProjectContentArea').addEventListener('click', () => {
    document.getElementById('projectContentArea').classList.add('hidden');
    currentProjectIndex = null;
});

// Close Add Mission Modal
document.getElementById('closeAddMissionModal').addEventListener('click', () => {
    document.getElementById('addMissionModal').style.display = 'none';
    document.getElementById('addMissionForm').reset();
    document.getElementById('subMissionsSection').classList.add('hidden');
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

    // Limit to 8 projects (2 rows)
    const displayedProjects = projects.slice(0, 8);

    displayedProjects.forEach((project, index) => {
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
    });
}

// Delegate event listener for Read More, Edit, Delete, and Open Project
document.getElementById('projectsContainer').addEventListener('click', function (e) {
    const index = e.target.closest('.project-card')?.getAttribute('data-index');

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
    } else if (e.target.classList.contains('project-card') || e.target.closest('.project-card')) {
        // Open project details
        openProjectDetails(index);
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
        // Close project content area if open
        if (currentProjectIndex == index) {
            document.getElementById('projectContentArea').classList.add('hidden');
            currentProjectIndex = null;
        }
        displayProjects();
    }
}

// Open Project Details
function openProjectDetails(index) {
    if (currentProjectIndex == index) {
        // Close if same project is clicked
        document.getElementById('projectContentArea').classList.add('hidden');
        currentProjectIndex = null;
        return;
    }
    currentProjectIndex = index;
    const project = projects[index];

    document.getElementById('projectContentTitle').innerText = project.name;
    document.getElementById('projectContentArea').classList.remove('hidden');

    displayMissions();
}

// Handle Add Mission Button
document.getElementById('addMissionBtn').addEventListener('click', () => {
    if (projects[currentProjectIndex].missions.length >= 10) {
        alert('You can add up to 10 missions per project.');
        return;
    }
    document.getElementById('addMissionModal').style.display = 'block';
});

// Handle Mission Type Change
document.getElementById('missionType').addEventListener('change', function () {
    if (this.value === 'withSubmissions') {
        document.getElementById('subMissionsSection').classList.remove('hidden');
    } else {
        document.getElementById('subMissionsSection').classList.add('hidden');
        document.getElementById('subMissionsContainer').innerHTML = '';
    }
});

// Handle Add Sub-Mission Button
document.getElementById('addSubMissionBtn').addEventListener('click', () => {
    const subMissionsContainer = document.getElementById('subMissionsContainer');
    const subMissionCount = subMissionsContainer.children.length;

    if (subMissionCount >= 5) {
        alert('You can add up to 5 sub-missions.');
        return;
    }

    const subMissionDiv = document.createElement('div');
    subMissionDiv.className = 'sub-mission';

    subMissionDiv.innerHTML = `
        <label>Name:</label>
        <input type="text" class="subMissionName" required>
        <label>Description:</label>
        <textarea class="subMissionDescription"></textarea>
        <button type="button" class="btn removeSubMissionBtn">Remove</button>
    `;

    subMissionsContainer.appendChild(subMissionDiv);

    // Handle Remove Sub-Mission Button
    subMissionDiv.querySelector('.removeSubMissionBtn').addEventListener('click', () => {
        subMissionsContainer.removeChild(subMissionDiv);
    });
});

// Handle Add Mission Form Submission
document.getElementById('addMissionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const missionName = document.getElementById('missionName').value.trim();
    const missionDescription = document.getElementById('missionDescription').value.trim();
    const missionType = document.getElementById('missionType').value;

    const project = projects[currentProjectIndex];

    // Check for duplicate mission names
    if (project.missions.some(mission => mission.name === missionName)) {
        alert('Mission name already exists!');
        return;
    }

    const newMission = {
        name: missionName,
        description: missionDescription,
        type: missionType,
        status: 'not started',
        subMissions: []
    };

    if (missionType === 'withSubmissions') {
        const subMissionsContainer = document.getElementById('subMissionsContainer');
        const subMissionElements = subMissionsContainer.querySelectorAll('.sub-mission');

        if (subMissionElements.length === 0) {
            alert('Please add at least one sub-mission.');
            return;
        }

        subMissionElements.forEach((elem) => {
            const subMissionName = elem.querySelector('.subMissionName').value.trim();
            const subMissionDescription = elem.querySelector('.subMissionDescription').value.trim();

            newMission.subMissions.push({
                name: subMissionName,
                description: subMissionDescription,
                status: 'not started'
            });
        });
    }

    project.missions.push(newMission);

    // Close modal and reset form
    document.getElementById('addMissionModal').style.display = 'none';
    this.reset();
    document.getElementById('subMissionsSection').classList.add('hidden');
    document.getElementById('subMissionsContainer').innerHTML = '';

    displayMissions();
});

// Display Missions
function displayMissions() {
    const missionsContainer = document.getElementById('missionsContainer');
    missionsContainer.innerHTML = '';

    const project = projects[currentProjectIndex];

    project.missions.forEach((mission, index) => {
        const missionDiv = document.createElement('div');
        missionDiv.className = 'mission';

        missionDiv.innerHTML = `
            <h3>${mission.name}</h3>
            <p>${mission.description}</p>
            <p>Status: ${mission.status}</p>
            <div class="mission-buttons">
                ${mission.status === 'not started' ? `<button class="btn edit-mission-btn" data-index="${index}">Edit</button>
                <button class="btn delete-mission-btn" data-index="${index}">Delete</button>
                <button class="btn start-mission-btn" data-index="${index}">Start</button>` : ''}
                ${mission.status === 'in progress' ? `<button class="btn mark-done-mission-btn" data-index="${index}">Mark as Done</button>
                <button class="btn reset-mission-btn" data-index="${index}">Reset</button>` : ''}
                ${mission.status === 'done' ? `<button class="btn reopen-mission-btn" data-index="${index}">Reopen</button>` : ''}
            </div>
        `;

        // Handle sub-missions if any
        if (mission.type === 'withSubmissions') {
            const subMissionsList = document.createElement('ul');
            mission.subMissions.forEach((subMission, subIndex) => {
                const subMissionItem = document.createElement('li');
                subMissionItem.innerHTML = `
                    <strong>${subMission.name}</strong> - ${subMission.description} - Status: ${subMission.status}
                    <div class="sub-mission-buttons">
                        ${subMission.status === 'not started' ? `<button class="btn edit-submission-btn" data-mission-index="${index}" data-sub-index="${subIndex}">Edit</button>
                        <button class="btn delete-submission-btn" data-mission-index="${index}" data-sub-index="${subIndex}">Delete</button>
                        <button class="btn start-submission-btn" data-mission-index="${index}" data-sub-index="${subIndex}">Start</button>` : ''}
                        ${subMission.status === 'in progress' ? `<button class="btn mark-done-submission-btn" data-mission-index="${index}" data-sub-index="${subIndex}">Mark as Done</button>
                        <button class="btn reset-submission-btn" data-mission-index="${index}" data-sub-index="${subIndex}">Reset</button>` : ''}
                        ${subMission.status === 'done' ? `<button class="btn reopen-submission-btn" data-mission-index="${index}" data-sub-index="${subIndex}">Reopen</button>` : ''}
                    </div>
                `;
                subMissionsList.appendChild(subMissionItem);
            });
            missionDiv.appendChild(subMissionsList);
        }

        missionsContainer.appendChild(missionDiv);
    });
}

// Delegate mission buttons
document.getElementById('missionsContainer').addEventListener('click', function (e) {
    const missionIndex = e.target.getAttribute('data-index');
    const mission = projects[currentProjectIndex].missions[missionIndex];

    if (e.target.classList.contains('edit-mission-btn')) {
        editMission(missionIndex);
    } else if (e.target.classList.contains('delete-mission-btn')) {
        deleteMission(missionIndex);
    } else if (e.target.classList.contains('start-mission-btn')) {
        updateMissionStatus(mission, 'in progress');
    } else if (e.target.classList.contains('mark-done-mission-btn')) {
        updateMissionStatus(mission, 'done');
    } else if (e.target.classList.contains('reset-mission-btn')) {
        updateMissionStatus(mission, 'not started');
    } else if (e.target.classList.contains('reopen-mission-btn')) {
        updateMissionStatus(mission, 'in progress');
    }

    // Sub-mission buttons
    const subMissionIndex = e.target.getAttribute('data-sub-index');
    if (subMissionIndex !== null) {
        const subMission = mission.subMissions[subMissionIndex];

        if (e.target.classList.contains('edit-submission-btn')) {
            editSubMission(missionIndex, subMissionIndex);
        } else if (e.target.classList.contains('delete-submission-btn')) {
            deleteSubMission(missionIndex, subMissionIndex);
        } else if (e.target.classList.contains('start-submission-btn')) {
            updateSubMissionStatus(subMission, 'in progress');
        } else if (e.target.classList.contains('mark-done-submission-btn')) {
            updateSubMissionStatus(subMission, 'done');
        } else if (e.target.classList.contains('reset-submission-btn')) {
            updateSubMissionStatus(subMission, 'not started');
        } else if (e.target.classList.contains('reopen-submission-btn')) {
            updateSubMissionStatus(subMission, 'in progress');
        }
    }

    displayMissions();
    updateProjectProgress();
});

// Edit Mission
function editMission(index) {
    const mission = projects[currentProjectIndex].missions[index];

    if (mission.status !== 'not started') {
        alert('Mission cannot be edited in its current status.');
        return;
    }

    // Implement edit mission functionality
    // For simplicity, you can reuse the add mission modal or create a new one
    // Here, we will alert the user
    alert('Edit mission functionality is not implemented in this demo.');
}

// Delete Mission
function deleteMission(index) {
    const mission = projects[currentProjectIndex].missions[index];

    if (mission.status !== 'not started') {
        alert('Mission cannot be deleted in its current status.');
        return;
    }

    if (confirm('Are you sure you want to delete this mission?')) {
        projects[currentProjectIndex].missions.splice(index, 1);
    }
}

// Update Mission Status
function updateMissionStatus(mission, newStatus) {
    // Status transitions
    if (newStatus === 'in progress' && mission.status === 'not started') {
        mission.status = 'in progress';
    } else if (newStatus === 'done' && mission.status === 'in progress') {
        mission.status = 'done';
    } else if (newStatus === 'not started' && (mission.status === 'in progress' || mission.status === 'done')) {
        mission.status = 'not started';
    } else {
        alert('Invalid status transition.');
    }
}

// Edit Sub-Mission
function editSubMission(missionIndex, subIndex) {
    const subMission = projects[currentProjectIndex].missions[missionIndex].subMissions[subIndex];

    if (subMission.status !== 'not started') {
        alert('Sub-mission cannot be edited in its current status.');
        return;
    }

    alert('Edit sub-mission functionality is not implemented in this demo.');
}

// Delete Sub-Mission
function deleteSubMission(missionIndex, subIndex) {
    const subMission = projects[currentProjectIndex].missions[missionIndex].subMissions[subIndex];

    if (subMission.status !== 'not started') {
        alert('Sub-mission cannot be deleted in its current status.');
        return;
    }

    if (confirm('Are you sure you want to delete this sub-mission?')) {
        projects[currentProjectIndex].missions[missionIndex].subMissions.splice(subIndex, 1);
    }
}

// Update Sub-Mission Status
function updateSubMissionStatus(subMission, newStatus) {
    if (newStatus === 'in progress' && subMission.status === 'not started') {
        subMission.status = 'in progress';
    } else if (newStatus === 'done' && subMission.status === 'in progress') {
        subMission.status = 'done';
    } else if (newStatus === 'not started' && (subMission.status === 'in progress' || subMission.status === 'done')) {
        subMission.status = 'not started';
    } else {
        alert('Invalid status transition.');
    }
}

// Update Project Progress
function updateProjectProgress() {
    const project = projects[currentProjectIndex];
    let totalTasks = 0;
    let completedTasks = 0;

    project.missions.forEach(mission => {
        if (mission.type === 'single') {
            totalTasks++;
            if (mission.status === 'done') {
                completedTasks++;
            }
        } else if (mission.type === 'withSubmissions') {
            mission.subMissions.forEach(sub => {
                totalTasks++;
                if (sub.status === 'done') {
                    completedTasks++;
                }
            });
        }
    });

    project.progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    displayProjects();
}

// Initial display
displayProjects();
