var deleteModal = document.getElementById('deleteModal')
deleteModal.addEventListener('show.bs.modal', function (event) {
    var buttonD = event.relatedTarget
    var userIdD = buttonD.getAttribute('data-idD')
    var usernameD = buttonD.getAttribute('data-usernameD')
    var ageD = buttonD.getAttribute('data-ageD')

    var rolesD = buttonD.getAttribute('data-rolesD').replace(/[\[\]\s]/g, '')
    var userRolesD = rolesD.split(',')
    var rolesSelectD = document.getElementById('rolesSelectD');

    var modalUserIdInputD = document.getElementById('user-idD')
    var modalUsernameInputD = document.getElementById('modal-usernameD')
    var modalAgeInputD = document.getElementById('modal-ageD')

    modalUserIdInputD.value = userIdD
    modalUsernameInputD.value = usernameD
    modalAgeInputD.value = ageD

    Array.from(rolesSelectD.options).forEach(option => {
        option.selected = userRolesD.includes(option.text);
    });

    console.log('User ID:', userIdD);
    console.log('Username:', usernameD);
    console.log('Age:', ageD);
    console.log('Roles:', userRolesD);

    var deleteUserForm = document.getElementById('deleteUserForm')
    deleteUserForm.action = 'delete?id=' + userIdD
})