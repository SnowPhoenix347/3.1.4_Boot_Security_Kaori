var userModal = document.getElementById('userModal')
userModal.addEventListener('show.bs.modal', function (event) {
    var button = event.relatedTarget
    var userId = button.getAttribute('data-id')
    var username = button.getAttribute('data-username')
    var age = button.getAttribute('data-age')

    var roles = button.getAttribute('data-roles').replace(/[\[\]\s]/g, '')
    var userRoles = roles.split(',')
    var rolesSelect = document.getElementById('rolesSelect');

    var modalUserIdInput = document.getElementById('user-id')
    var modalUsernameInput = document.getElementById('modal-username')
    var modalAgeInput = document.getElementById('modal-age')

    modalUserIdInput.value = userId
    modalUsernameInput.value = username
    modalAgeInput.value = age

    Array.from(rolesSelect.options).forEach(option => {
        option.selected = userRoles.includes(option.text);
    });
})