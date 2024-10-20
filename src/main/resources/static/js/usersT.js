const roleList = []
$(async function () {
    await getTableWithUsers()
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
        method: 'POST',
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

    // Получаем данные пользователя
    let response = await userFetchService.getUser(id);
    if (!response.ok) {
        console.error('Failed to fetch user:', response.status, response.statusText);
        return; // Остановите выполнение, если не удалось получить пользователя
    }
    let user = await response.json();
    console.log('Fetched user:', user); // Отладка: выводим полученного пользователя

    // Проверка наличия данных пользователя
    if (!user || !user.id) {
        console.error('User data is invalid:', user);
        return; // Остановите выполнение, если данные пользователя неверные
    }

    // Получаем все роли
    let rolesResponse = await userFetchService.getRoles();
    if (!rolesResponse.ok) {
        console.error('Failed to fetch roles:', rolesResponse.status, rolesResponse.statusText);
        return; // Остановите выполнение, если не удалось получить роли
    }
    let allRoles = await rolesResponse.json();

    // Очищаем поле выбора ролей
    let rolesSelect = $('#updateRoles');
    rolesSelect.empty();

    // Заполняем список ролей и выделяем активные у пользователя
    allRoles.forEach(role => {
        let selected = user.roles && user.roles.some(userRole => userRole.id === role.id);
        let option = `<option value="${role.id}" ${selected ? 'selected' : ''}>
                        ${role.name}
                      </option>`;
        rolesSelect.append(option);
    });

    // Заполняем остальные поля формы
    $('#update-id').val(user.id);
    $('#update-username').val(user.username);
    $('#update-age').val(user.age);
    $('#update-password').val(''); // Очищаем поле пароля

    // Показ модального окна
    updateModal.modal('show');
    updateModal.modal({ backdrop: false });

    // Обработчик отправки формы
    updateForm.off('submit').on('submit', async function (event) {
        event.preventDefault();

        let userId = $('#update-id').val(); // Получаем ID перед отправкой
        if (!userId) {
            console.error('User ID is undefined or empty');
            return; // Остановите выполнение, если ID отсутствует
        }

        let newPassword = $('#update-password').val();
        let updatedUser = JSON.stringify({
            username: $(`[name="username"]`, updateForm).val(),
            age: $(`[name="age"]`, updateForm).val(),
            password: $(`[name="password"]`, updateForm).val(),
            roles: Array.from($('#updateRoles').find('option:selected')).map(opt => ({ id: opt.value }))
        });
        console.log('Updating user with data:', updatedUser);
        // Отправляем запрос на обновление
        try {
            await userFetchService.updateUser(userId, updatedUser);
            updateModal.modal('hide');
            await getTableWithUsers(); // Обновляем таблицу с пользователями
        } catch (error) {
            console.error('Error updating user:', error);
        }
        updateForm.trigger('reset')
    });
}