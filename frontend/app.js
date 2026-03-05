document.addEventListener("DOMContentLoaded", function () {

    /* ================= BACKEND CHECK ================= */
    fetch("https://wanderlust-backend-uq67.onrender.com/")
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
            fetch("https://wanderlust-backend-uq67.onrender.com/contact", {
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
                const res = await fetch("https://wanderlust-backend-uq67.onrender.com/signin", {
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



/* ================= SEARCH FORM ================= */
const searchForm = document.getElementById("mainSearchForm");
if (searchForm) {
    searchForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        // Form se values lo
        const destination = document.getElementById("mainDest").value.trim();
        const checkIn = document.getElementById("mainCheckIn").value;
        const checkOut = document.getElementById("mainCheckOut").value;
        const travelers = document.getElementById("mainTrav").value;

        // Validation
        if (!destination) {
            alert("Please enter a destination");
            return;
        }
        if (!checkIn) {
            alert("Please select check-in date");
            return;
        }
        if (!checkOut) {
            alert("Please select check-out date");
            return;
        }

        // Data prepare karo
        const searchData = {
            destination: destination,
            checkIn: checkIn,
            checkOut: checkOut,
            travelers: travelers
        };

        console.log("Sending search data:", searchData);

        try {
            // Backend par data bhejo
            const response = await fetch("https://wanderlust-backend-uq67.onrender.com/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(searchData)
            });

            const data = await response.json();
            console.log("Search response:", data);

            if (response.ok) {

                if (data.destinations && data.destinations.length > 0) {
                    updateDestinations(data.destinations);
                    alert(`✅ Found ${data.destinations.length} matching destinations!`);
                    
                    // ✅ YEH LINES ADD KARO - FORM CLEAR KARNE KE LIYE
                    // Destination field clear
                    document.getElementById("mainDest").value = "";
                    // Check-in field clear
                    document.getElementById("mainCheckIn").value = "";
                    // Check-out field clear
                    document.getElementById("mainCheckOut").value = "";
                    // Travelers field reset to default (first option)
                    document.getElementById("mainTrav").selectedIndex = 0;
                    
                } else {
                    alert("❌ No matching destinations found");
                }
            } else {
                alert("❌ " + data.message);
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Server error. Please try again.");
        }
    });
}


                

/* ================= UPDATE DESTINATIONS ================= */
function updateDestinations(destinations) {
    const popularRow = document.getElementById("popularRow");
    if (!popularRow) return;

    // Purani destinations hatao
    popularRow.innerHTML = "";

    // Nayi destinations dikhao
    destinations.forEach(dest => {
        const stars = generateStars(dest.rating);
        
        const destHTML = `
            <div class="col-md-3 mb-4 dest-item" data-category="${dest.category}">
                <div class="destination-card card">
                    <div class="position-relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" 
                             class="card-img-top zoom-img" alt="${dest.name}">
                        <div class="price-tag">$${dest.price}</div>
                    </div>
                    <div class="card-body">
                        <div class="rating">
                            ${stars}
                            <span class="ms-1">${dest.rating}</span>
                        </div>
                        <h5 class="card-title">${dest.name}</h5>
                        <p class="card-text">${getDescription(dest.name)}</p>
                        <a href="#" class="btn btn-sm btn-outline-primary">Explore</a>
                    </div>
                </div>
            </div>
        `;
        popularRow.innerHTML += destHTML;
    });
}

/* ================= HELPER FUNCTIONS ================= */
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function getDescription(name) {
    const descriptions = {
        "Maldives": "Tropical paradise with crystal waters.",
        "Phuket": "Famous for beaches and nightlife.",
        "Bali": "Experience culture, beaches and nightlife.",
        "Santorini": "Enjoy breathtaking sunsets.",
        "Paris": "Discover the city of love.",
        "New York": "The city that never sleeps.",
        "London": "Historic landmarks and modern vibes.",
        "Tokyo": "Blend of tradition and modern city life.",
        "Swiss Alps": "Snowy peaks and alpine adventures.",
        "Himalayas": "Breathtaking peaks and trekking adventures.",
        "Mount Fuji": "Iconic mountain with serene landscapes.",
        "Rocky Mountains": "Majestic mountain range for adventure seekers."
    };
    return descriptions[name] || "Amazing destination to explore!";
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
                const res = await fetch("https://wanderlust-backend-uq67.onrender.com/signup", {
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
async function subscribe(email) {
    if (!email || !email.includes('@')) {
        alert('Enter valid email');
        return;
    }

    try {
        const response = await fetch("https://wanderlust-backend-uq67.onrender.com/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("✅ " + data.message);
            // Clear email fields
            document.getElementById("newsletterEmail").value = "";
            document.getElementById("footEmail").value = "";
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        alert("Server error. Please try again.");
        console.error("Subscribe error:", error);
    }
}

// ✅ YEH LINES ADD KARO - EVENT LISTENERS
const subscribeBtn = document.getElementById('subscribeBtn');
if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
        const email = document.getElementById('newsletterEmail').value;
        subscribe(email);
    });
}

const footSubscribe = document.getElementById('footSubscribe');
if (footSubscribe) {
    footSubscribe.addEventListener('click', () => {
        const email = document.getElementById('footEmail').value;
        subscribe(email);
    });
}

    /* ================= BOOKING FORM ================= */
    const bookingForm = document.getElementById("bookingForm");

    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();   
            alert("Details Submitted Successfully!");
            bookingForm.reset();
        });
    }

    /* ================= FILTER DESTINATIONS ================= */
    const filterButtons = document.querySelectorAll('#filterGroup .btn');
    const destItems = document.querySelectorAll('.dest-item');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();  
                e.stopPropagation();

                // Active button class update
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                
                destItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

}); 