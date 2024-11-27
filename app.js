// Data Storage
let projects = [];
let currentProjectIndex = null;
let editMissionIndex = null;
let editSubMissionIndex = null;

// Utility Functions
function $(selector) {
    return document.querySelector(selector);
}

function showElement(element) {
    if (!element) {
        console.error('Element not found');
        return;
    }
    element.style.display = 'block'; // Explicitly set display
    element.classList.remove('hidden');
}

function hideElement(element) {
    if (!element) {
        console.error('Element not found');
        return;
    }
    element.style.display = 'none'; // Explicitly hide
    element.classList.add('hidden');
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event Listeners for Modals
// Project Modal (Add/Edit)
$('#addProjectBtn').addEventListener('click', () => {
    $('#projectModalTitle').innerText = 'Add New Project';
    $('#projectForm').reset();
    showElement($('#projectModal'));
    $('#projectForm').dataset.mode = 'add';
});

$('#closeProjectModal').addEventListener('click', () => {
    hideElement($('#projectModal'));
});

$('#projectForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#projectName').value.trim();
    const description = $('#projectDescription').value.trim();

    if (!name || !description) {
        alert('Please fill in all fields.');
        return;
    }

    if (this.dataset.mode === 'add') {
        // Add Project
        if (projects.some(project => project.name.toLowerCase() === name.toLowerCase())) {
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
    } else if (this.dataset.mode === 'edit') {
        // Edit Project
        if (projects.some((project, idx) => project.name.toLowerCase() === name.toLowerCase() && idx !== currentProjectIndex)) {
            alert('Another project with this name already exists!');
            return;
        }

        projects[currentProjectIndex].name = name;
        projects[currentProjectIndex].description = description;
    }

    // Update UI
    displayProjects();
    hideElement($('#projectModal'));
    this.reset();
    this.dataset.mode = 'add';
});

// Description Modal
$('#closeDescriptionModal').addEventListener('click', () => {
    hideElement($('#descriptionModal'));
});

// Project Content Area Close
$('#closeProjectContentArea').addEventListener('click', () => {
    hideElement($('#projectContentArea'));
    currentProjectIndex = null;
});

// Mission Modal (Add/Edit)
$('#addMissionBtn').addEventListener('click', () => {
    if (projects[currentProjectIndex].missions.length >= 10) {
        alert('You can add up to 10 missions per project.');
        return;
    }
    $('#missionModalTitle').innerText = 'Add New Mission';
    $('#missionForm').reset();
    $('#subMissionsSection').classList.add('hidden');
    $('#subMissionsContainer').innerHTML = '';
    showElement($('#missionModal'));
    $('#missionForm').dataset.mode = 'add';
});

$('#closeMissionModal').addEventListener('click', () => {
    hideElement($('#missionModal'));
    $('#missionForm').reset();
    $('#subMissionsSection').classList.add('hidden');
    $('#subMissionsContainer').innerHTML = '';
});

// Edit Sub-Mission Modal
$('#closeEditSubMissionModal').addEventListener('click', () => {
    hideElement($('#editSubMissionModal'));
    $('#editSubMissionForm').reset();
    editMissionIndex = null;
    editSubMissionIndex = null;
});

// Handle Mission Type Change
$('#missionType').addEventListener('change', function () {
    if (this.value === 'withSubmissions') {
        showElement($('#subMissionsSection'));
    } else {
        hideElement($('#subMissionsSection'));
        $('#subMissionsContainer').innerHTML = '';
    }
});

// Handle Add Sub-Mission Button
$('#addSubMissionBtn').addEventListener('click', () => {
    const subMissionsContainer = $('#subMissionsContainer');
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
        <textarea class="subMissionDescription" required></textarea>
        <button type="button" class="btn removeSubMissionBtn">Remove</button>
    `;

    subMissionsContainer.appendChild(subMissionDiv);

    // Handle Remove Sub-Mission Button
    subMissionDiv.querySelector('.removeSubMissionBtn').addEventListener('click', () => {
        subMissionsContainer.removeChild(subMissionDiv);
    });
});

// Handle Mission Form Submission (Add/Edit)
$('#missionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#missionName').value.trim();
    const description = $('#missionDescription').value.trim();
    const type = $('#missionType').value;

    if (!name || !description) {
        alert('Please fill in all fields.');
        return;
    }

    const project = projects[currentProjectIndex];

    if (this.dataset.mode === 'add') {
        // Add Mission
        if (project.missions.some(mission => mission.name.toLowerCase() === name.toLowerCase())) {
            alert('Mission name already exists!');
            return;
        }

        const newMission = {
            name,
            description,
            type,
            status: 'not started',
            subMissions: type === 'withSubmissions' ? [] : null
        };

        project.missions.push(newMission);
    } else if (this.dataset.mode === 'edit') {
        // Edit Mission
        if (project.missions.some((mission, idx) => mission.name.toLowerCase() === name.toLowerCase() && idx !== editMissionIndex)) {
            alert('Another mission with this name already exists!');
            return;
        }

        project.missions[editMissionIndex].name = name;
        project.missions[editMissionIndex].description = description;
        // Type is not editable
    }

    // Handle Sub-Missions
    if (type === 'withSubmissions') {
        const subMissionsContainer = $('#subMissionsContainer');
        const subMissionElements = subMissionsContainer.querySelectorAll('.sub-mission');

        if (this.dataset.mode === 'add') {
            if (subMissionElements.length > 0) {
                subMissionElements.forEach((elem) => {
                    const subMissionName = elem.querySelector('.subMissionName').value.trim();
                    const subMissionDescription = elem.querySelector('.subMissionDescription').value.trim();

                    if (!subMissionName || !subMissionDescription) {
                        alert('Please fill in all sub-mission fields.');
                        return;
                    }

                    projects[currentProjectIndex].missions.slice(-1)[0].subMissions.push({
                        name: subMissionName,
                        description: subMissionDescription,
                        status: 'not started'
                    });
                });
            }
        } else if (this.dataset.mode === 'edit') {
            // Editing missions with sub-missions does not handle adding/removing sub-missions here
            // Sub-missions are managed separately
        }
    }

    // Update UI
    displayMissions();
    updateProjectProgress();
    hideElement($('#missionModal'));
    this.reset();
    this.dataset.mode = 'add';
    editMissionIndex = null;
});

// Handle Edit Sub-Mission Form Submission
$('#editSubMissionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#editSubMissionName').value.trim();
    const description = $('#editSubMissionDescription').value.trim();

    if (!name || !description) {
        alert('Please fill in all fields.');
        return;
    }

    const project = projects[currentProjectIndex];
    const mission = project.missions[editMissionIndex];
    const subMission = mission.subMissions[editSubMissionIndex];

    // Update Sub-Mission
    subMission.name = name;
    subMission.description = description;

    // Update UI
    displayMissions();
    updateProjectProgress();
    hideElement($('#editSubMissionModal'));
    this.reset();
    editMissionIndex = null;
    editSubMissionIndex = null;
});

// Display Projects
function displayProjects() {
    const projectsContainer = $('#projectsContainer');
    projectsContainer.innerHTML = '';

    projects.slice(0, 8).forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-index', index);

        const descriptionPreview = project.description.length > 100
            ? project.description.substring(0, 100) + '...'
            : project.description;

        projectCard.innerHTML = `
            <h3>${project.name}</h3>
            <p>
                ${descriptionPreview}
                ${project.description.length > 100 ? `<a href="#" class="read-more" data-index="${index}">Read More</a>` : ''}
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

// Delegate event listener for Projects Container
$('#projectsContainer').addEventListener('click', function (e) {
    const projectCard = e.target.closest('.project-card');
    if (!projectCard) return;

    const index = projectCard.getAttribute('data-index');

    if (e.target.classList.contains('read-more')) {
        e.preventDefault();
        // Show full description
        const project = projects[index];
        $('#descTitle').innerText = project.name;
        $('#descContent').innerText = project.description;
        showElement($('#descriptionModal'));
    } else if (e.target.classList.contains('edit-btn')) {
        e.stopPropagation();
        // Edit Project
        editProject(index);
    } else if (e.target.classList.contains('delete-btn')) {
        e.stopPropagation();
        // Delete Project
        deleteProject(index);
    } else {
        // Open Project Details
        openProjectDetails(index);
    }
});

// Edit Project
function editProject(index) {
    const project = projects[index];

    $('#projectModalTitle').innerText = 'Edit Project';
    $('#projectName').value = project.name;
    $('#projectDescription').value = project.description;
    $('#projectForm').dataset.mode = 'edit';
    currentProjectIndex = parseInt(index);
    showElement($('#projectModal'));
}

// Delete Project
function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project? This will delete everything related to it.')) {
        projects.splice(index, 1);
        displayProjects();
        if (currentProjectIndex === parseInt(index)) {
            hideElement($('#projectContentArea'));
            currentProjectIndex = null;
        }
    }
}

// Open Project Details
function openProjectDetails(index) {
    const projIndex = parseInt(index);
    if (currentProjectIndex === projIndex) {
        hideElement($('#projectContentArea')); // Toggle close
        currentProjectIndex = null;
        return;
    }
    currentProjectIndex = projIndex;
    const project = projects[currentProjectIndex];
    $('#projectContentTitle').innerText = project.name;
    displayMissions(); // Show missions for this project
    showElement($('#projectContentArea'));
}

// Display Missions
function displayMissions() {
    const missionsContainer = $('#missionsContainer');
    missionsContainer.innerHTML = '';

    const project = projects[currentProjectIndex];

    project.missions.forEach((mission, mIndex) => {
        const missionDiv = document.createElement('div');
        missionDiv.className = 'mission';
        missionDiv.setAttribute('data-mission-index', mIndex);

        missionDiv.innerHTML = `
            <h3>${mission.name}</h3>
            <p>${mission.description}</p>
            <p>Status: <strong>${capitalize(mission.status)}</strong></p>
            <div class="mission-buttons">
                ${mission.status === 'not started' ? `
                    <button class="btn edit-mission-btn" data-mission-index="${mIndex}">Edit</button>
                    <button class="btn delete-mission-btn" data-mission-index="${mIndex}">Delete</button>
                    <button class="btn start-mission-btn" data-mission-index="${mIndex}">Start</button>
                ` : ''}
                ${mission.status === 'in progress' ? `
                    <button class="btn mark-done-mission-btn" data-mission-index="${mIndex}">Mark as Done</button>
                    <button class="btn reset-mission-btn" data-mission-index="${mIndex}">Reset</button>
                ` : ''}
                ${mission.status === 'done' ? `
                    <button class="btn reopen-mission-btn" data-mission-index="${mIndex}">Reopen</button>
                ` : ''}
            </div>
            ${mission.type === 'withSubmissions' ? `
                <div class="sub-missions">
                    <h4>Sub-Missions</h4>
                    <ul class="sub-mission-list">
                        ${mission.subMissions.map((sub, sIndex) => `
                            <li>
                                <strong>${sub.name}</strong> - ${sub.description} - Status: <strong>${capitalize(sub.status)}</strong>
                                <div class="sub-mission-buttons">
                                    ${sub.status === 'not started' ? `
                                        <button class="btn edit-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Edit</button>
                                        <button class="btn delete-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Delete</button>
                                        <button class="btn start-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Start</button>
                                    ` : ''}
                                    ${sub.status === 'in progress' ? `
                                        <button class="btn mark-done-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Mark as Done</button>
                                        <button class="btn reset-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reset</button>
                                    ` : ''}
                                    ${sub.status === 'done' ? `
                                        <button class="btn reopen-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reopen</button>
                                    ` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        missionsContainer.appendChild(missionDiv);
    });
}

// Delegate event listener for Missions Container
$('#missionsContainer').addEventListener('click', function (e) {
    const missionIndex = e.target.getAttribute('data-mission-index');
    const subMissionIndex = e.target.getAttribute('data-sub-index');

    if (e.target.classList.contains('edit-mission-btn')) {
        editMission(missionIndex);
    } else if (e.target.classList.contains('delete-mission-btn')) {
        deleteMission(missionIndex);
    } else if (e.target.classList.contains('start-mission-btn')) {
        updateMissionStatus(missionIndex, 'in progress');
    } else if (e.target.classList.contains('mark-done-mission-btn')) {
        updateMissionStatus(missionIndex, 'done');
    } else if (e.target.classList.contains('reset-mission-btn')) {
        updateMissionStatus(missionIndex, 'not started');
    } else if (e.target.classList.contains('reopen-mission-btn')) {
        updateMissionStatus(missionIndex, 'in progress');
    } else if (e.target.classList.contains('edit-submission-btn')) {
        editSubMission(missionIndex, subMissionIndex);
    } else if (e.target.classList.contains('delete-submission-btn')) {
        deleteSubMission(missionIndex, subMissionIndex);
    } else if (e.target.classList.contains('start-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'in progress');
    } else if (e.target.classList.contains('mark-done-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'done');
    } else if (e.target.classList.contains('reset-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'not started');
    } else if (e.target.classList.contains('reopen-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'in progress');
    }
});

// Edit Mission
function editMission(index) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[index];

    if (mission.status !== 'not started') {
        alert('Only missions with status "Not Started" can be edited.');
        return;
    }

    $('#missionModalTitle').innerText = 'Edit Mission';
    $('#missionName').value = mission.name;
    $('#missionDescription').value = mission.description;
    $('#missionType').value = mission.type;
    $('#missionForm').dataset.mode = 'edit';
    editMissionIndex = parseInt(index);

    if (mission.type === 'withSubmissions') {
        showElement($('#subMissionsSection'));
        // Load existing sub-missions
        const subMissionsContainer = $('#subMissionsContainer');
        subMissionsContainer.innerHTML = '';
        mission.subMissions.forEach((sub, sIndex) => {
            const subMissionDiv = document.createElement('div');
            subMissionDiv.className = 'sub-mission';
            subMissionDiv.innerHTML = `
                <label>Name:</label>
                <input type="text" class="subMissionName" value="${sub.name}" required>
                <label>Description:</label>
                <textarea class="subMissionDescription" required>${sub.description}</textarea>
                <button type="button" class="btn removeSubMissionBtn">Remove</button>
            `;

            subMissionsContainer.appendChild(subMissionDiv);

            // Handle Remove Sub-Mission Button
            subMissionDiv.querySelector('.removeSubMissionBtn').addEventListener('click', () => {
                subMissionsContainer.removeChild(subMissionDiv);
            });
        });
    } else {
        hideElement($('#subMissionsSection'));
        $('#subMissionsContainer').innerHTML = '';
    }

    showElement($('#missionModal'));
}

// Delete Mission
function deleteMission(index) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[index];

    if (mission.status !== 'not started') {
        alert('Only missions with status "Not Started" can be deleted.');
        return;
    }

    if (confirm('Are you sure you want to delete this mission? This will delete all related sub-missions.')) {
        project.missions.splice(index, 1);
        displayMissions();
        updateProjectProgress();
    }
}

// Update Mission Status
function updateMissionStatus(missionIndex, newStatus) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[missionIndex];

    const validTransitions = {
        'not started': ['in progress'],
        'in progress': ['not started', 'done'],
        'done': ['in progress', 'not started']
    };

    if (validTransitions[mission.status].includes(newStatus)) {
        mission.status = newStatus;
        displayMissions();
        updateProjectProgress();
    } else {
        alert('Invalid status transition.');
    }
}

// Edit Sub-Mission
function editSubMission(missionIndex, subMissionIndex) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    if (subMission.status !== 'not started') {
        alert('Only sub-missions with status "Not Started" can be edited.');
        return;
    }

    $('#editSubMissionForm').reset();
    $('#editSubMissionName').value = subMission.name;
    $('#editSubMissionDescription').value = subMission.description;
    showElement($('#editSubMissionModal'));
    editMissionIndex = parseInt(missionIndex);
    editSubMissionIndex = parseInt(subMissionIndex);
}

// Delete Sub-Mission
function deleteSubMission(missionIndex, subMissionIndex) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    if (subMission.status !== 'not started') {
        alert('Only sub-missions with status "Not Started" can be deleted.');
        return;
    }

    if (confirm('Are you sure you want to delete this sub-mission?')) {
        project.missions[missionIndex].subMissions.splice(subMissionIndex, 1);
        displayMissions();
        updateProjectProgress();
    }
}

// Update Sub-Mission Status
function updateSubMissionStatus(missionIndex, subMissionIndex, newStatus) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    const validTransitions = {
        'not started': ['in progress'],
        'in progress': ['not started', 'done'],
        'done': ['in progress', 'not started']
    };

    if (validTransitions[subMission.status].includes(newStatus)) {
        subMission.status = newStatus;
        displayMissions();
        updateProjectProgress();
    } else {
        alert('Invalid status transition.');
    }
}

// Handle Edit Sub-Mission Form Submission
$('#editSubMissionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#editSubMissionName').value.trim();
    const description = $('#editSubMissionDescription').value.trim();

    if (!name || !description) {
        alert('Please fill in all fields.');
        return;
    }

    const project = projects[currentProjectIndex];
    const mission = project.missions[editMissionIndex];
    const subMission = mission.subMissions[editSubMissionIndex];

    // Update Sub-Mission
    subMission.name = name;
    subMission.description = description;

    // Update UI
    displayMissions();
    updateProjectProgress();
    hideElement($('#editSubMissionModal'));
    this.reset();
    editMissionIndex = null;
    editSubMissionIndex = null;
});

// Handle Mission Form Submission (continued)
$('#missionForm').addEventListener('submit', function (e) {
    // The main mission form submission is already handled above
    // This is a placeholder in case you want to add more logic
});

// Display Missions
function displayMissions() {
    const missionsContainer = $('#missionsContainer');
    missionsContainer.innerHTML = '';

    const project = projects[currentProjectIndex];

    project.missions.forEach((mission, mIndex) => {
        const missionDiv = document.createElement('div');
        missionDiv.className = 'mission';
        missionDiv.setAttribute('data-mission-index', mIndex);

        missionDiv.innerHTML = `
            <h3>${mission.name}</h3>
            <p>${mission.description}</p>
            <p>Status: <strong>${capitalize(mission.status)}</strong></p>
            <div class="mission-buttons">
                ${mission.status === 'not started' ? `
                    <button class="btn edit-mission-btn" data-mission-index="${mIndex}">Edit</button>
                    <button class="btn delete-mission-btn" data-mission-index="${mIndex}">Delete</button>
                    <button class="btn start-mission-btn" data-mission-index="${mIndex}">Start</button>
                ` : ''}
                ${mission.status === 'in progress' ? `
                    <button class="btn mark-done-mission-btn" data-mission-index="${mIndex}">Mark as Done</button>
                    <button class="btn reset-mission-btn" data-mission-index="${mIndex}">Reset</button>
                ` : ''}
                ${mission.status === 'done' ? `
                    <button class="btn reopen-mission-btn" data-mission-index="${mIndex}">Reopen</button>
                ` : ''}
            </div>
            ${mission.type === 'withSubmissions' ? `
                <div class="sub-missions">
                    <h4>Sub-Missions</h4>
                    <ul class="sub-mission-list">
                        ${mission.subMissions.map((sub, sIndex) => `
                            <li>
                                <strong>${sub.name}</strong> - ${sub.description} - Status: <strong>${capitalize(sub.status)}</strong>
                                <div class="sub-mission-buttons">
                                    ${sub.status === 'not started' ? `
                                        <button class="btn edit-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Edit</button>
                                        <button class="btn delete-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Delete</button>
                                        <button class="btn start-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Start</button>
                                    ` : ''}
                                    ${sub.status === 'in progress' ? `
                                        <button class="btn mark-done-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Mark as Done</button>
                                        <button class="btn reset-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reset</button>
                                    ` : ''}
                                    ${sub.status === 'done' ? `
                                        <button class="btn reopen-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reopen</button>
                                    ` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        missionsContainer.appendChild(missionDiv);
    });
}

// Delegate event listener for Missions Container
$('#missionsContainer').addEventListener('click', function (e) {
    const missionIndex = e.target.getAttribute('data-mission-index');
    const subMissionIndex = e.target.getAttribute('data-sub-index');

    if (e.target.classList.contains('edit-mission-btn')) {
        editMission(missionIndex);
    } else if (e.target.classList.contains('delete-mission-btn')) {
        deleteMission(missionIndex);
    } else if (e.target.classList.contains('start-mission-btn')) {
        updateMissionStatus(missionIndex, 'in progress');
    } else if (e.target.classList.contains('mark-done-mission-btn')) {
        updateMissionStatus(missionIndex, 'done');
    } else if (e.target.classList.contains('reset-mission-btn')) {
        updateMissionStatus(missionIndex, 'not started');
    } else if (e.target.classList.contains('reopen-mission-btn')) {
        updateMissionStatus(missionIndex, 'in progress');
    } else if (e.target.classList.contains('edit-submission-btn')) {
        editSubMission(missionIndex, subMissionIndex);
    } else if (e.target.classList.contains('delete-submission-btn')) {
        deleteSubMission(missionIndex, subMissionIndex);
    } else if (e.target.classList.contains('start-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'in progress');
    } else if (e.target.classList.contains('mark-done-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'done');
    } else if (e.target.classList.contains('reset-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'not started');
    } else if (e.target.classList.contains('reopen-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'in progress');
    }
});

// Edit Mission
function editMission(index) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[index];

    if (mission.status !== 'not started') {
        alert('Only missions with status "Not Started" can be edited.');
        return;
    }

    $('#missionModalTitle').innerText = 'Edit Mission';
    $('#missionName').value = mission.name;
    $('#missionDescription').value = mission.description;
    $('#missionType').value = mission.type;
    $('#missionForm').dataset.mode = 'edit';
    editMissionIndex = parseInt(index);

    if (mission.type === 'withSubmissions') {
        showElement($('#subMissionsSection'));
        // Load existing sub-missions
        const subMissionsContainer = $('#subMissionsContainer');
        subMissionsContainer.innerHTML = '';
        mission.subMissions.forEach((sub, sIndex) => {
            const subMissionDiv = document.createElement('div');
            subMissionDiv.className = 'sub-mission';
            subMissionDiv.innerHTML = `
                <label>Name:</label>
                <input type="text" class="subMissionName" value="${sub.name}" required>
                <label>Description:</label>
                <textarea class="subMissionDescription" required>${sub.description}</textarea>
                <button type="button" class="btn removeSubMissionBtn">Remove</button>
            `;

            subMissionsContainer.appendChild(subMissionDiv);

            // Handle Remove Sub-Mission Button
            subMissionDiv.querySelector('.removeSubMissionBtn').addEventListener('click', () => {
                subMissionsContainer.removeChild(subMissionDiv);
            });
        });
    } else {
        hideElement($('#subMissionsSection'));
        $('#subMissionsContainer').innerHTML = '';
    }

    showElement($('#missionModal'));
}

// Delete Mission
function deleteMission(index) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[index];

    if (mission.status !== 'not started') {
        alert('Only missions with status "Not Started" can be deleted.');
        return;
    }

    if (confirm('Are you sure you want to delete this mission? This will delete all related sub-missions.')) {
        project.missions.splice(index, 1);
        displayMissions();
        updateProjectProgress();
    }
}

// Update Mission Status
function updateMissionStatus(missionIndex, newStatus) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[missionIndex];

    const validTransitions = {
        'not started': ['in progress'],
        'in progress': ['not started', 'done'],
        'done': ['in progress', 'not started']
    };

    if (validTransitions[mission.status].includes(newStatus)) {
        mission.status = newStatus;
        displayMissions();
        updateProjectProgress();
    } else {
        alert('Invalid status transition.');
    }
}

// Edit Sub-Mission
function editSubMission(missionIndex, subMissionIndex) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    if (subMission.status !== 'not started') {
        alert('Only sub-missions with status "Not Started" can be edited.');
        return;
    }

    $('#editSubMissionForm').reset();
    $('#editSubMissionName').value = subMission.name;
    $('#editSubMissionDescription').value = subMission.description;
    showElement($('#editSubMissionModal'));
    editMissionIndex = parseInt(missionIndex);
    editSubMissionIndex = parseInt(subMissionIndex);
}

// Delete Sub-Mission
function deleteSubMission(missionIndex, subMissionIndex) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    if (subMission.status !== 'not started') {
        alert('Only sub-missions with status "Not Started" can be deleted.');
        return;
    }

    if (confirm('Are you sure you want to delete this sub-mission?')) {
        project.missions[missionIndex].subMissions.splice(subMissionIndex, 1);
        displayMissions();
        updateProjectProgress();
    }
}

// Update Sub-Mission Status
function updateSubMissionStatus(missionIndex, subMissionIndex, newStatus) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    const validTransitions = {
        'not started': ['in progress'],
        'in progress': ['not started', 'done'],
        'done': ['in progress', 'not started']
    };

    if (validTransitions[subMission.status].includes(newStatus)) {
        subMission.status = newStatus;
        displayMissions();
        updateProjectProgress();
    } else {
        alert('Invalid status transition.');
    }
}

// Handle Edit Sub-Mission Form Submission
$('#editSubMissionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#editSubMissionName').value.trim();
    const description = $('#editSubMissionDescription').value.trim();

    if (!name || !description) {
        alert('Please fill in all fields.');
        return;
    }

    const project = projects[currentProjectIndex];
    const mission = project.missions[editMissionIndex];
    const subMission = mission.subMissions[editSubMissionIndex];

    // Update Sub-Mission
    subMission.name = name;
    subMission.description = description;

    // Update UI
    displayMissions();
    updateProjectProgress();
    hideElement($('#editSubMissionModal'));
    this.reset();
    editMissionIndex = null;
    editSubMissionIndex = null;
});

// Display Missions
function displayMissions() {
    const missionsContainer = $('#missionsContainer');
    missionsContainer.innerHTML = '';

    const project = projects[currentProjectIndex];

    project.missions.forEach((mission, mIndex) => {
        const missionDiv = document.createElement('div');
        missionDiv.className = 'mission';
        missionDiv.setAttribute('data-mission-index', mIndex);

        missionDiv.innerHTML = `
            <h3>${mission.name}</h3>
            <p>${mission.description}</p>
            <p>Status: <strong>${capitalize(mission.status)}</strong></p>
            <div class="mission-buttons">
                ${mission.status === 'not started' ? `
                    <button class="btn edit-mission-btn" data-mission-index="${mIndex}">Edit</button>
                    <button class="btn delete-mission-btn" data-mission-index="${mIndex}">Delete</button>
                    <button class="btn start-mission-btn" data-mission-index="${mIndex}">Start</button>
                ` : ''}
                ${mission.status === 'in progress' ? `
                    <button class="btn mark-done-mission-btn" data-mission-index="${mIndex}">Mark as Done</button>
                    <button class="btn reset-mission-btn" data-mission-index="${mIndex}">Reset</button>
                ` : ''}
                ${mission.status === 'done' ? `
                    <button class="btn reopen-mission-btn" data-mission-index="${mIndex}">Reopen</button>
                ` : ''}
            </div>
            ${mission.type === 'withSubmissions' ? `
                <div class="sub-missions">
                    <h4>Sub-Missions</h4>
                    <ul class="sub-mission-list">
                        ${mission.subMissions.map((sub, sIndex) => `
                            <li>
                                <strong>${sub.name}</strong> - ${sub.description} - Status: <strong>${capitalize(sub.status)}</strong>
                                <div class="sub-mission-buttons">
                                    ${sub.status === 'not started' ? `
                                        <button class="btn edit-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Edit</button>
                                        <button class="btn delete-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Delete</button>
                                        <button class="btn start-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Start</button>
                                    ` : ''}
                                    ${sub.status === 'in progress' ? `
                                        <button class="btn mark-done-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Mark as Done</button>
                                        <button class="btn reset-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reset</button>
                                    ` : ''}
                                    ${sub.status === 'done' ? `
                                        <button class="btn reopen-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reopen</button>
                                    ` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        missionsContainer.appendChild(missionDiv);
    });
}

// Delegate event listener for Projects Container
$('#projectsContainer').addEventListener('click', function (e) {
    if (e.target.classList.contains('read-more')) {
        e.preventDefault();
        const index = e.target.dataset.index;
        const project = projects[index];
        $('#descTitle').innerText = project.name;
        $('#descContent').innerText = project.description;
        showElement($('#descriptionModal'));
    }
});

// Delegate event listener for Missions Container
$('#missionsContainer').addEventListener('click', function (e) {
    const missionIndex = e.target.getAttribute('data-mission-index');
    const subMissionIndex = e.target.getAttribute('data-sub-index');

    if (e.target.classList.contains('edit-mission-btn')) {
        editMission(missionIndex);
    } else if (e.target.classList.contains('delete-mission-btn')) {
        deleteMission(missionIndex);
    } else if (e.target.classList.contains('start-mission-btn')) {
        updateMissionStatus(missionIndex, 'in progress');
    } else if (e.target.classList.contains('mark-done-mission-btn')) {
        updateMissionStatus(missionIndex, 'done');
    } else if (e.target.classList.contains('reset-mission-btn')) {
        updateMissionStatus(missionIndex, 'not started');
    } else if (e.target.classList.contains('reopen-mission-btn')) {
        updateMissionStatus(missionIndex, 'in progress');
    } else if (e.target.classList.contains('edit-submission-btn')) {
        editSubMission(missionIndex, subMissionIndex);
    } else if (e.target.classList.contains('delete-submission-btn')) {
        deleteSubMission(missionIndex, subMissionIndex);
    } else if (e.target.classList.contains('start-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'in progress');
    } else if (e.target.classList.contains('mark-done-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'done');
    } else if (e.target.classList.contains('reset-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'not started');
    } else if (e.target.classList.contains('reopen-submission-btn')) {
        updateSubMissionStatus(missionIndex, subMissionIndex, 'in progress');
    }
});

// Edit Mission
function editMission(index) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[index];

    if (mission.status !== 'not started') {
        alert('Only missions with status "Not Started" can be edited.');
        return;
    }

    $('#missionModalTitle').innerText = 'Edit Mission';
    $('#missionName').value = mission.name;
    $('#missionDescription').value = mission.description;
    $('#missionType').value = mission.type;
    $('#missionForm').dataset.mode = 'edit';
    editMissionIndex = parseInt(index);

    if (mission.type === 'withSubmissions') {
        showElement($('#subMissionsSection'));
        // Load existing sub-missions
        const subMissionsContainer = $('#subMissionsContainer');
        subMissionsContainer.innerHTML = '';
        mission.subMissions.forEach((sub, sIndex) => {
            const subMissionDiv = document.createElement('div');
            subMissionDiv.className = 'sub-mission';
            subMissionDiv.innerHTML = `
                <label>Name:</label>
                <input type="text" class="subMissionName" value="${sub.name}" required>
                <label>Description:</label>
                <textarea class="subMissionDescription" required>${sub.description}</textarea>
                <button type="button" class="btn removeSubMissionBtn">Remove</button>
            `;

            subMissionsContainer.appendChild(subMissionDiv);

            // Handle Remove Sub-Mission Button
            subMissionDiv.querySelector('.removeSubMissionBtn').addEventListener('click', () => {
                subMissionsContainer.removeChild(subMissionDiv);
            });
        });
    } else {
        hideElement($('#subMissionsSection'));
        $('#subMissionsContainer').innerHTML = '';
    }

    showElement($('#missionModal'));
}

// Delete Mission
function deleteMission(index) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[index];

    if (mission.status !== 'not started') {
        alert('Only missions with status "Not Started" can be deleted.');
        return;
    }

    if (confirm('Are you sure you want to delete this mission? This will delete all related sub-missions.')) {
        project.missions.splice(index, 1);
        displayMissions();
        updateProjectProgress();
    }
}

// Update Mission Status
function updateMissionStatus(missionIndex, newStatus) {
    const project = projects[currentProjectIndex];
    const mission = project.missions[missionIndex];

    const validTransitions = {
        'not started': ['in progress'],
        'in progress': ['not started', 'done'],
        'done': ['in progress', 'not started']
    };

    if (validTransitions[mission.status].includes(newStatus)) {
        mission.status = newStatus;
        displayMissions();
        updateProjectProgress();
    } else {
        alert('Invalid status transition.');
    }
}

// Edit Sub-Mission
function editSubMission(missionIndex, subMissionIndex) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    if (subMission.status !== 'not started') {
        alert('Only sub-missions with status "Not Started" can be edited.');
        return;
    }

    $('#editSubMissionForm').reset();
    $('#editSubMissionName').value = subMission.name;
    $('#editSubMissionDescription').value = subMission.description;
    showElement($('#editSubMissionModal'));
    editMissionIndex = parseInt(missionIndex);
    editSubMissionIndex = parseInt(subMissionIndex);
}

// Delete Sub-Mission
function deleteSubMission(missionIndex, subMissionIndex) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    if (subMission.status !== 'not started') {
        alert('Only sub-missions with status "Not Started" can be deleted.');
        return;
    }

    if (confirm('Are you sure you want to delete this sub-mission?')) {
        project.missions[missionIndex].subMissions.splice(subMissionIndex, 1);
        displayMissions();
        updateProjectProgress();
    }
}

// Update Sub-Mission Status
function updateSubMissionStatus(missionIndex, subMissionIndex, newStatus) {
    const project = projects[currentProjectIndex];
    const subMission = project.missions[missionIndex].subMissions[subMissionIndex];

    const validTransitions = {
        'not started': ['in progress'],
        'in progress': ['not started', 'done'],
        'done': ['in progress', 'not started']
    };

    if (validTransitions[subMission.status].includes(newStatus)) {
        subMission.status = newStatus;
        displayMissions();
        updateProjectProgress();
    } else {
        alert('Invalid status transition.');
    }
}

// Handle Edit Sub-Mission Form Submission
$('#editSubMissionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#editSubMissionName').value.trim();
    const description = $('#editSubMissionDescription').value.trim();

    if (!name || !description) {
        alert('Please fill in all fields.');
        return;
    }

    const project = projects[currentProjectIndex];
    const mission = project.missions[editMissionIndex];
    const subMission = mission.subMissions[editSubMissionIndex];

    // Update Sub-Mission
    subMission.name = name;
    subMission.description = description;

    // Update UI
    displayMissions();
    updateProjectProgress();
    hideElement($('#editSubMissionModal'));
    this.reset();
    editMissionIndex = null;
    editSubMissionIndex = null;
});

// Display Missions
function displayMissions() {
    const missionsContainer = $('#missionsContainer');
    missionsContainer.innerHTML = '';

    const project = projects[currentProjectIndex];

    project.missions.forEach((mission, mIndex) => {
        const missionDiv = document.createElement('div');
        missionDiv.className = 'mission';
        missionDiv.setAttribute('data-mission-index', mIndex);

        missionDiv.innerHTML = `
            <h3>${mission.name}</h3>
            <p>${mission.description}</p>
            <p>Status: <strong>${capitalize(mission.status)}</strong></p>
            <div class="mission-buttons">
                ${mission.status === 'not started' ? `
                    <button class="btn edit-mission-btn" data-mission-index="${mIndex}">Edit</button>
                    <button class="btn delete-mission-btn" data-mission-index="${mIndex}">Delete</button>
                    <button class="btn start-mission-btn" data-mission-index="${mIndex}">Start</button>
                ` : ''}
                ${mission.status === 'in progress' ? `
                    <button class="btn mark-done-mission-btn" data-mission-index="${mIndex}">Mark as Done</button>
                    <button class="btn reset-mission-btn" data-mission-index="${mIndex}">Reset</button>
                ` : ''}
                ${mission.status === 'done' ? `
                    <button class="btn reopen-mission-btn" data-mission-index="${mIndex}">Reopen</button>
                ` : ''}
            </div>
            ${mission.type === 'withSubmissions' ? `
                <div class="sub-missions">
                    <h4>Sub-Missions</h4>
                    <ul class="sub-mission-list">
                        ${mission.subMissions.map((sub, sIndex) => `
                            <li>
                                <strong>${sub.name}</strong> - ${sub.description} - Status: <strong>${capitalize(sub.status)}</strong>
                                <div class="sub-mission-buttons">
                                    ${sub.status === 'not started' ? `
                                        <button class="btn edit-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Edit</button>
                                        <button class="btn delete-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Delete</button>
                                        <button class="btn start-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Start</button>
                                    ` : ''}
                                    ${sub.status === 'in progress' ? `
                                        <button class="btn mark-done-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Mark as Done</button>
                                        <button class="btn reset-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reset</button>
                                    ` : ''}
                                    ${sub.status === 'done' ? `
                                        <button class="btn reopen-submission-btn" data-mission-index="${mIndex}" data-sub-index="${sIndex}">Reopen</button>
                                    ` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        missionsContainer.appendChild(missionDiv);
    });
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

    project.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update Progress Bar in Projects Grid
    displayProjects();
}

// Initial Display
displayProjects();
