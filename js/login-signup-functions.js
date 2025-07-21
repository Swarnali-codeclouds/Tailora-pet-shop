document.addEventListener("DOMContentLoaded", function () {
  // ✅ SIGNUP FORM
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const password = document.getElementById("password");
      const confirmPassword = document.getElementById("confirmPassword");

      let valid = true;

      // Validation
      if (!name.value.trim()) {
        name.classList.add("is-invalid");
        valid = false;
      } else {
        name.classList.remove("is-invalid");
      }

      const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
      if (!emailPattern.test(email.value)) {
        email.classList.add("is-invalid");
        valid = false;
      } else {
        email.classList.remove("is-invalid");
      }

      if (password.value.length < 6) {
        password.classList.add("is-invalid");
        valid = false;
      } else {
        password.classList.remove("is-invalid");
      }

      if (confirmPassword.value !== password.value || !confirmPassword.value) {
        confirmPassword.classList.add("is-invalid");
        valid = false;
      } else {
        confirmPassword.classList.remove("is-invalid");
      }

      if (valid) {
        let users = JSON.parse(localStorage.getItem("users")) || [];

        const exists = users.some(
          (user) => user.email === email.value.trim()
        );
        if (exists) {
          alert("This email is already registered.");
          return;
        }

        const newUser = {
          name: name.value.trim(),
          email: email.value.trim(),
          password: password.value.trim(),
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        window.location.href = "login.html"; // ✅ Go to login after signup
      }
    });
  }

  // ✅ LOGIN FORM
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail");
      const password = document.getElementById("loginPassword");

      let valid = true;

      const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
      if (!emailPattern.test(email.value.trim())) {
        email.classList.add("is-invalid");
        valid = false;
      } else {
        email.classList.remove("is-invalid");
      }

      if (password.value.trim().length < 1) {
        password.classList.add("is-invalid");
        valid = false;
      } else {
        password.classList.remove("is-invalid");
      }

      if (valid) {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        const matchedUser = users.find(
          (user) =>
            user.email === email.value.trim() &&
            user.password === password.value.trim()
        );

        if (matchedUser) {
          localStorage.setItem("currentUser", JSON.stringify(matchedUser));
          window.location.href = "index.html"; // ✅ Go to home after login
        } else {
          alert("Invalid email or password.");
        }
      }
    });
  }

  // ✅ GOOGLE SIGNUP (both login & signup)
  window.handleGoogleSignup = function (response) {
    const user = {
      name: "Google User",
      email: "googleuser@example.com",
      token: response.credential,
    };

    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html";
  };
});
