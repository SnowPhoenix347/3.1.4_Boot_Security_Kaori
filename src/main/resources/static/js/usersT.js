const roleList = []
$(async function () {
    const user = await userFetchService.getCurrentUser();
    const userJson = await user.json();
    const roleNames = userJson[0].roles.map(role => role.name);
    let rowTitle = $('#rowTitle')
    if (roleNames.includes('ADMIN')) {
        await getTableWithUsers()
        rowTitle.append(`<p class="h1">Admin panel</p>`)
        console.log("admin")
    } else {
        await getTableWithUsers(userFetchService.getCurrentUser())
        rowTitle.append(`<p class="h1">User panel</p>`)
        console.log("user")
        let buttonAdmin = $('#buttonAdmin');
        buttonAdmin.removeClass('btn-primary active');
        buttonAdmin.hide()
        $('#navTabsAdmin').hide()
        $('#buttonUser').addClass('btn-primary active');

    }

    buttonsController();
})

const userFetchService = {
    head: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': null
    },
    findAllUsers: async () => await fetch('api/users'),
    getCurrentUser: async () => await fetch('api/user'),
    createUser: async (user) => await fetch('/api/create',
        {method: 'POST', headers: userFetchService.head, body: user}),
    getRoles: async () => await fetch('api/roles'),
    deleteUser: async (id) => await fetch(`/api/delete/${id}`,
        {method: 'DELETE', headers: userFetchService.head}),
    getUser: async (id) => await fetch(`/api/user/${id}`),
    updateUser: async (id, user) => await fetch(`/api/update/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: user
    })
}

async function fillRoleList() {
    const response = await userFetchService.getRoles();
    const roles = await response.json();
    roleList.length = 0;
    roles.forEach(role => {
        roleList.push(role);
    });
}

async function buttonsController() {
    $('#buttonAdmin, #buttonUser').on('click', function() {
        $('#buttonAdmin, #buttonUser').removeClass('btn-primary active');
        $(this).addClass('btn-primary active');
    });
    $('#buttonUser').click(async () => {
        await getTableWithUsers(userFetchService.getCurrentUser())
    })
    $('#buttonAdmin').click(async () => {
        await getTableWithUsers()
    })
    $('#buttonCreate').click(async () => {
        await createUser()
    })
    $('#buttonTable').click(async () => {
        await getTableWithUsers()
    })
}

async function getTableWithUsers(promise) {
    let tableBox = $('#tableBox');
    tableBox.show()
    let createBox = $('#createBox');
    createBox.hide()
    let usersTable = $('#usersTable');
    usersTable.empty();
    usersTable.append(`<thead>
                                <tr class="border-top">
                                    <th scope="col">ID</th>
                                    <th scope="col">Username</th>
                                    <th scope="col">Age</th>
                                    <th scope="col">Roles</th>
                                    <th scope="col">Edit</th>
                                    <th scope="col">Delete</th>
                                </tr>
                                </thead>
                                <tbody>
                                </tbody>`);
    let tableHeader = $('#tableHeader');
    tableHeader.empty()
    let table = $('#usersTable tbody');
    table.empty();
    let c;
    if (promise == null) {
        c = userFetchService.findAllUsers();
        $('#usersTable thead tr th:last-child, #usersTable thead tr th:nth-last-child(2)').show();
        tableHeader.append(`<div class="card-title h4 m-2">All users</div>`)

    } else {
        c = promise;
        tableHeader.append(`<div class="card-title h4 m-2">About user</div>`)
    }

    await c
        .then(res => res.json())
        .then(users => {
            users.forEach(user => {
                let tableFilling = `$(
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.age}</td>     
                            <td>${user.roles.map(r => r.name)}</td>
                                    <td class="action-cell">
                                        <button type="button" class="btn btn-info" data-bs-toggle="modal"
                                                data-bs-target="#updateModal" onclick="showUpdateModal(${user.id})">
                                            Update
                                        </button>
                                    </td>
                                    <td class="action-cell">
                                        <button type="button" class="btn btn-danger" data-bs-toggle="modal"
                                                data-bs-target="#deleteModal" onclick="showDeleteModal(${user.id})">
                                            Delete
                                        </button>
                                    </td>
                        </tr>
                )`;
                table.append(tableFilling);
            });
            if (promise != null) {
                $('#usersTable thead tr th:last-child, #usersTable thead tr th:nth-last-child(2)').hide();
                $('#usersTable tbody tr td:last-child, #usersTable tbody tr td:nth-last-child(2)').hide();
            }
        });
}

async function createUser() {
    let tableBox = $('#tableBox');
    tableBox.hide()
    let createBox = $('#createBox');
    createBox.show()
    let tableHeader = $('#tableHeader')
    tableHeader.empty()
    let tableHeaderFilling = `<div class="card-title h4 m-2">Add new user</div>`;
    tableHeader.append(tableHeaderFilling)

    let createForm = $('#createForm')
    await fillRoleList();
    console.log(roleList)
    showRoles(createForm);
    createForm.off('submit');
    createForm.on('submit', (event) => {
        event.preventDefault()
        event.stopPropagation()

        let newUser = JSON.stringify({
            username: $(`[name="username"]`, createForm).val(),
            age: $(`[name="age"]`, createForm).val(),
            password: $(`[name="password"]`, createForm).val(),
            roles: getRole(createForm)
        })
        console.log(newUser)
        userFetchService.createUser(newUser)
            .then(r => {
                if (!r.ok) {
                    alert("Username already exist")
                } else {
                    getTableWithUsers()
                }
            })
        createForm.trigger('reset')
    })

}

function showRoles(form, userRoles = []) {
    $(`[name="roles"]`, form).empty();
    roleList.forEach(role => {
        let selected = userRoles.some(userRole => userRole.id === role.id) ? 'selected' : '';
        let option = `<option value="${role.id}" ${selected}>
                                 ${role.name}
                            </option>`;
        $(`[name="roles"]`, form).append(option);
    });
}

function getRole(form) {
    let role = []
    let options = $(`[name="roles"]`, form)[0].options
    for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
            role.push(roleList[i])
        }
    }
    return role
}

async function showDeleteModal(id) {
    let deleteForm = $('#deleteUserForm');
    let response = await userFetchService.getUser(id);
    let user = await response.json();
    let deleteModal = $('#deleteModal');
    showRoles(deleteForm, user.roles);

    $('#user-id').val(user.id);
    $('#modal-username').val(user.username);
    $('#modal-age').val(user.age);

    let rolesSelect = $('#rolesSelectD');
    rolesSelect.empty();
    user.roles.forEach(role => {
        rolesSelect.append(new Option(role.name, role.id));
    });

    deleteModal.modal('show');
    deleteModal.modal({ backdrop: false });

    deleteForm.off('submit').on('submit', async function (event) {
        event.preventDefault();

        let userId = $('#user-id').val();
        let response = await userFetchService.deleteUser(userId);

        if (response.ok) {
            deleteModal.modal('hide');
            $('.modal-backdrop').remove();
            deleteForm[0].reset();
            await getTableWithUsers();
        } else {
            alert("Failed to delete user");
            deleteModal.modal('hide');
        }
    });
}

async function showUpdateModal(id) {
    let updateForm = $('#updateForm');
    let updateModal = $('#updateModal');

    let response = await userFetchService.getUser(id);
    let user = await response.json();
    let rolesResponse = await userFetchService.getRoles();
    let allRoles = await rolesResponse.json();

    let rolesSelect = $('#updateRoles');
    rolesSelect.empty();
    allRoles.forEach(role => {
        let selected = user.roles.some(userRole => userRole.id === role.id);
        let option = `<option value="${role.id}" ${selected ? 'selected' : ''}>${role.name}</option>`;
        rolesSelect.append(option);
    });

    $('#update-id').val(user.id);
    $('#update-username').val(user.username);
    $('#update-age').val(user.age);
    $('#update-password').val('');

    updateModal.modal('show');

    updateForm.off('submit').on('submit', async function (event) {
        event.preventDefault();

        let userId = $('#update-id').val();
        let updatedUser = JSON.stringify({
            username: $(`[name="username"]`, updateForm).val(),
            age: $(`[name="age"]`, updateForm).val(),
            password: $(`[name="password"]`, updateForm).val() || null,  // Если пусто, передаем null
            roles: Array.from($('#updateRoles').find('option:selected')).map(opt => ({ id: opt.value }))
        });

        let result = await userFetchService.updateUser(userId, updatedUser);
        if (result.ok) {
            await getTableWithUsers();
            updateModal.modal('hide');
        } else {
            alert("Failed to update");
        }
        updateModal.modal('hide');
        $('.modal-backdrop').remove();
        updateForm.trigger('reset');
    });
}