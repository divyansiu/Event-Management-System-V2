// frontend/js/student.js

let allEvents = [];
let myRegistrationsList = [];


// ===============================
// Utility
// ===============================

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ===============================
// Load Events
// ===============================

async function loadAvailableEvents() {
  try {
    const res = await api.events.getAll();

    if (!res.success) {
      showToast(
        res.message || "Failed to load events",
        "error"
      );
      return;
    }

    allEvents = res.data || [];

    applyFilters();

  } catch (error) {
    console.error("Load events error:", error);

    showToast(
      "Unable to load events",
      "error"
    );
  }
}


// ===============================
// Load My Registrations
// ===============================

async function loadMyRegistrations() {
  try {
    const res = await api.registrations.getMyRegistrations();

    if (!res.success) {
      console.error(
        "Failed to load registrations:",
        res.message
      );

      return;
    }

    myRegistrationsList = res.data || [];

    renderMyRegistrations();

  } catch (error) {
    console.error(
      "Load registrations error:",
      error
    );
  }
}


// ===============================
// Render Available Events
// ===============================

function renderAvailableEvents(events) {
  const container =
    document.getElementById("all-events-container");

  if (!container) {
    return;
  }

  if (events.length === 0) {
    container.innerHTML = `
      <div
        class="empty-state"
        style="grid-column: 1 / -1;"
      >
        <div class="kaomoji-icon">
          (✿◠‿◠)
        </div>

        <h3>No Matching Events Found</h3>

        <p>
          No events matched your current search filters.
        </p>
      </div>
    `;

    return;
  }


  // IDs of events the current student has registered for
  const registeredIds = new Set(
    myRegistrationsList
      .filter((registration) => {
        return (
          (registration.status || "REGISTERED")
            .toUpperCase() !== "CANCELLED"
        );
      })
      .map((registration) => {
        const event =
          registration.eventId &&
          typeof registration.eventId === "object"
            ? registration.eventId
            : null;

        return String(
          event?._id ||
          registration.eventId ||
          registration.event
        );
      })
  );


  container.innerHTML = events
    .map((evt) => {

      const eventId = String(
        evt._id || evt.id
      );

      const isRegistered =
        registeredIds.has(eventId);


      // -------------------------------
      // Date
      // -------------------------------

      const dateStr = evt.date
        ? new Date(evt.date).toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )
        : "TBD";


      // -------------------------------
      // Capacity
      // -------------------------------

      const capacity =
        evt.capacity !== undefined
          ? Number(evt.capacity)
          : 100;


      // IMPORTANT:
      // Backend now sends registeredCount
      const registered =
        evt.registeredCount !== undefined
          ? Number(evt.registeredCount)
          : 0;


      const percentage =
        capacity > 0
          ? Math.min(
              100,
              Math.round(
                (registered / capacity) * 100
              )
            )
          : 0;


      // -------------------------------
      // Category styling
      // -------------------------------

      let categoryClass =
        "badge-sakura";

      if (evt.category === "Tech") {
        categoryClass = "badge-blue";
      }

      if (evt.category === "Gaming") {
        categoryClass = "badge-purple";
      }

      if (evt.category === "Sports") {
        categoryClass = "badge-orange";
      }

      if (evt.category === "Workshops") {
        categoryClass = "badge-green";
      }


      // -------------------------------
      // Registration button
      // -------------------------------

      const registerButton = isRegistered
        ? `
          <button
            class="btn btn-outline"
            disabled
            style="width: 100%;"
          >
            🌸 Already RSVP'd ✓
          </button>
        `
        : `
          <button
            class="btn btn-primary student-quick-register"
            data-id="${eventId}"
            style="width: 100%;"
          >
            Reserve Spot 🌸
          </button>
        `;


      return `
        <article class="event-card">

          <div class="card-header">

            <span class="badge ${categoryClass}">
              ${escapeHTML(
                evt.category || "General"
              )}
            </span>

            <span class="badge badge-gray">
              👥 ${registered} / ${capacity} spots
            </span>

          </div>


          <h3 class="event-title">
            ${escapeHTML(
              evt.title || "Untitled Event"
            )}
          </h3>


          <p class="event-desc">
            ${escapeHTML(
              evt.description ||
              "Join campus peers for this event!"
            )}
          </p>


          <!-- Capacity -->

          <div class="capacity-meter">

            <div class="capacity-meter-header">

              <span>
                Capacity Status
              </span>

              <span>
                ${percentage}% filled
              </span>

            </div>


            <div class="capacity-track">

              <div
                class="capacity-fill ${
                  percentage >= 90
                    ? "full"
                    : ""
                }"
                style="width: ${percentage}%;"
              ></div>

            </div>

          </div>


          <!-- Event information -->

          <div class="event-meta">

            <div>
              <span>📅</span>
              <span>
                ${dateStr}
              </span>
            </div>


            <div>
              <span>⏰</span>
              <span>
                ${escapeHTML(
                  evt.time || "TBD"
                )}
              </span>
            </div>


            <div>
              <span>📍</span>
              <span>
                ${escapeHTML(
                  evt.location || "Campus"
                )}
              </span>
            </div>

          </div>


          <!-- Buttons -->

          <div
            class="card-footer"
            style="
              display: flex;
              flex-direction: column;
              gap: 8px;
            "
          >

            ${registerButton}


            <a
              href="event.html?id=${eventId}"
              class="btn btn-outline"
              style="
                width: 100%;
                font-size: 0.84rem;
                padding: 6px 10px;
              "
            >
              View Full Details
            </a>

          </div>

        </article>
      `;
    })
    .join("");


  // ===============================
  // Register buttons
  // ===============================

  container
    .querySelectorAll(
      ".student-quick-register"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        async (event) => {

          const eventId =
            event.currentTarget.getAttribute(
              "data-id"
            );


          // Prevent double-click
          event.currentTarget.disabled = true;

          event.currentTarget.innerHTML =
            "Reserving... 🌸";


          try {

            const res =
              await api.registrations.register(
                eventId
              );


            if (res.success) {

              showToast(
                res.message ||
                  "Spot reserved! See you there 🌸",
                "success"
              );


              // Refresh student's registrations
              await loadMyRegistrations();


              // IMPORTANT:
              // Refresh events so registeredCount
              // comes from backend again.
              await loadAvailableEvents();

            } else {

              showToast(
                res.message ||
                  "Registration failed.",
                "error"
              );


              event.currentTarget.disabled =
                false;

              event.currentTarget.innerHTML =
                "Reserve Spot 🌸";
            }

          } catch (error) {

            console.error(
              "Registration error:",
              error
            );


            showToast(
              "Registration failed. Please try again.",
              "error"
            );


            event.currentTarget.disabled =
              false;

            event.currentTarget.innerHTML =
              "Reserve Spot 🌸";
          }

        }
      );

    });
}


// ===============================
// Render My Registrations
// ===============================

function renderMyRegistrations() {

  const container =
    document.getElementById(
      "my-registrations-container"
    );


  if (!container) {
    return;
  }


  if (
    !myRegistrationsList ||
    myRegistrationsList.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="kaomoji-icon">
          (｡•́‿•̀｡)
        </div>

        <h3>No Registrations Yet</h3>

        <p>
          Reserve a spot in an event to see it here.
        </p>

      </div>
    `;

    return;
  }


  const activeRegistrations =
    myRegistrationsList.filter(
      (registration) =>
        (
          registration.status ||
          "REGISTERED"
        ).toUpperCase() !== "CANCELLED"
    );


  if (activeRegistrations.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="kaomoji-icon">
          (｡•́‿•̀｡)
        </div>

        <h3>No Active Registrations</h3>

        <p>
          You are not currently registered
          for any events.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    activeRegistrations
      .map((registration) => {

        const event =
          registration.eventId &&
          typeof registration.eventId === "object"
            ? registration.eventId
            : null;


        if (!event) {
          return "";
        }


        const eventId =
          event._id || event.id;


        const dateStr = event.date
          ? new Date(
              event.date
            ).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )
          : "TBD";


        return `
          <article class="event-card">

            <div class="card-header">

              <span class="badge badge-sakura">
                ${escapeHTML(
                  event.category ||
                    "General"
                )}
              </span>

              <span class="badge badge-green">
                Registered ✓
              </span>

            </div>


            <h3 class="event-title">
              ${escapeHTML(
                event.title ||
                  "Untitled Event"
              )}
            </h3>


            <p class="event-desc">
              ${escapeHTML(
                event.description ||
                  ""
              )}
            </p>


            <div class="event-meta">

              <div>
                <span>📅</span>
                <span>
                  ${dateStr}
                </span>
              </div>


              <div>
                <span>⏰</span>
                <span>
                  ${escapeHTML(
                    event.time || "TBD"
                  )}
                </span>
              </div>


              <div>
                <span>📍</span>
                <span>
                  ${escapeHTML(
                    event.location ||
                      "Campus"
                  )}
                </span>
              </div>

            </div>


            <div class="card-footer">

              <button
                class="btn btn-outline student-cancel-registration"
                data-id="${eventId}"
                style="width: 100%;"
              >
                Cancel Registration
              </button>

            </div>

          </article>
        `;
      })
      .join("");


  // ===============================
  // Cancel registration buttons
  // ===============================

  container
    .querySelectorAll(
      ".student-cancel-registration"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        async (event) => {

          const eventId =
            event.currentTarget.getAttribute(
              "data-id"
            );


          const confirmed =
            confirm(
              "Are you sure you want to cancel your registration?"
            );


          if (!confirmed) {
            return;
          }


          event.currentTarget.disabled =
            true;


          try {

            const res =
              await api.registrations.cancel(
                eventId
              );


            if (res.success) {

              showToast(
                res.message ||
                  "Registration cancelled successfully.",
                "success"
              );


              await loadMyRegistrations();

              // Refresh event counts
              await loadAvailableEvents();

            } else {

              showToast(
                res.message ||
                  "Unable to cancel registration.",
                "error"
              );


              event.currentTarget.disabled =
                false;
            }

          } catch (error) {

            console.error(
              "Cancel registration error:",
              error
            );


            showToast(
              "Unable to cancel registration.",
              "error"
            );


            event.currentTarget.disabled =
              false;
          }

        }
      );

    });
}


// ===============================
// Search + Filter
// ===============================

function applyFilters() {

  const searchInput =
    document.getElementById(
      "event-search"
    );


  const categorySelect =
    document.getElementById(
      "category-filter"
    );


  const searchTerm =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const selectedCategory =
    categorySelect
      ? categorySelect.value
      : "";


  const filteredEvents =
    allEvents.filter((event) => {

      const searchableText = `
        ${event.title || ""}
        ${event.description || ""}
        ${event.location || ""}
        ${event.category || ""}
      `.toLowerCase();


      const matchesSearch =
        !searchTerm ||
        searchableText.includes(
          searchTerm
        );


      const matchesCategory =
        !selectedCategory ||
        event.category ===
          selectedCategory;


      return (
        matchesSearch &&
        matchesCategory
      );
    });


  renderAvailableEvents(
    filteredEvents
  );
}


// ===============================
// Page Initialization
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    // Search
    const searchInput =
      document.getElementById(
        "event-search"
      );


    if (searchInput) {

      searchInput.addEventListener(
        "input",
        applyFilters
      );

    }


    // Category filter
    const categorySelect =
      document.getElementById(
        "category-filter"
      );


    if (categorySelect) {

      categorySelect.addEventListener(
        "change",
        applyFilters
      );

    }


    // Load data
    await loadMyRegistrations();

    await loadAvailableEvents();

  }
);