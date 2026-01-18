document.addEventListener("DOMContentLoaded", function () {

    /* ================= BACKEND CHECK ================= */
    fetch("http://localhost:5000/")
        .then(res => res.text())
        .then(data => console.log("Backend says:", data))
        .catch(err => console.log("Backend error:", err));

    /* ================= Init AOS & Swiper & Tilt ================= */
    if (window.AOS) AOS.init({ duration: 700, once: true });

    if (window.VanillaTilt)
        VanillaTilt.init(document.querySelectorAll('[data-tilt]'), { max: 8, speed: 600, glare: false });

    if (window.Swiper)
        new Swiper('.mySwiper', {
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            autoplay: { delay: 5000, disableOnInteraction: false }
        });

    /* ================= Theme toggle ================= */
    const toggleSwitch = document.querySelector('#checkbox');
    if (toggleSwitch) {
        function setTheme(isDark) {
            if (isDark) {
                document.body.classList.add('dark-mode');
                toggleSwitch.checked = true;
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                toggleSwitch.checked = false;
                localStorage.setItem('theme', 'light');
            }
        }
        toggleSwitch.addEventListener('change', () => setTheme(toggleSwitch.checked));
        if (localStorage.getItem('theme') === 'dark') setTheme(true);
    }

    /* ================= Smooth scroll ================= */
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ================= Scroll effects ================= */
    function onScroll() {
        const scrollPos = window.scrollY + 120;
        document.querySelectorAll('section[id]').forEach(sec => {
            if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                const a = document.querySelector('.nav-link[href="#' + sec.id + '"]');
                if (a) a.classList.add('active');
            }
        });

        const nav = document.getElementById('mainNav');
        if (nav) window.scrollY > 60 ? nav.classList.add('shrink') : nav.classList.remove('shrink');

        const st = document.getElementById('scrollTop');
        if (st) st.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }
    window.addEventListener('scroll', onScroll);
    onScroll();

    /* ================= Scroll top ================= */
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn)
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ================= Contact Form (BACKEND READY) ================= */
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const data = {
                name: document.getElementById("contactName").value,
                email: document.getElementById("contactEmail").value,
                package: document.getElementById("contactPackage").value,
                message: document.getElementById("contactMessage").value
            };
            fetch("http://localhost:5000/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(res => {
                    alert(res.message);
                    contactForm.reset();
                })
                .catch(() => alert("Server error"));
        });
    }

    /* ================= LOGIN MODAL (Sign In) ================= */
    const loginForm = document.querySelector("#loginModal form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const res = await fetch("http://localhost:5000/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                alert(data.message);

                // ✅ Form reset after Sign In
                loginForm.reset();

                if (res.ok) {
                    const loginModalEl = document.getElementById("loginModal");
                    const modal = bootstrap.Modal.getInstance(loginModalEl);
                    modal.hide();
                }

            } catch (err) {
                alert("Error connecting to backend");
                console.error(err);
            }
        });
    }

    /* ================= REGISTER MODAL (Sign Up) ================= */
    const registerForm = document.querySelector("#registerModal form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const username = document.getElementById("firstName").value + " " + document.getElementById("lastName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;

            try {
                const res = await fetch("http://localhost:5000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await res.json();
                alert(data.message);

                // ✅ Form reset after Sign Up
                registerForm.reset();

                if (res.ok) {
                    const registerModalEl = document.getElementById("registerModal");
                    const modal = bootstrap.Modal.getInstance(registerModalEl);
                    modal.hide();
                }

            } catch (err) {
                alert("Error connecting to backend");
                console.error(err);
            }
        });
    }

    /* ================= Newsletter ================= */
    function subscribe(email) {
        if (!email || !email.includes('@')) {
            alert('Enter valid email');
            return;
        }
        alert('Subscribed: ' + email);
    }

    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn)
        subscribeBtn.addEventListener('click', () =>
            subscribe(document.getElementById('newsletterEmail').value)
        );

    const footSubscribe = document.getElementById('footSubscribe');
    if (footSubscribe)
        footSubscribe.addEventListener('click', () =>
            subscribe(document.getElementById('footEmail').value)
        );

});
