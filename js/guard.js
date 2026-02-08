// js/guard-calculators.js
// PURPOSE: Prevent using calculators unless logged in AND paid/trial active

(async function guardCalculators() {
  try {
    const token = localStorage.getItem('token');

    // 1️⃣ Not logged in → go to login
    if (!token) {
      window.location.replace('login.html');
      return;
    }

    // 2️⃣ Ask backend if this user has calculator access
    await fetch(`${window.API_BASE}/api/calculators/access`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 3️⃣ If request succeeds → user is allowed
    // Do NOTHING, page continues loading
  } catch (err) {
    // 4️⃣ If backend rejects → redirect to payment
    window.location.replace('payment.html');
  }
})();
