// ============================================================================
// APP.JS - LÓGICA DE NEGOCIO, CRUD AGENDA, REGLAS DE NEGOCIO Y MOTOR NLP/IA
// ============================================================================

function startBrezzaAurea() {
    try {
        // Estado global de la aplicación
        const state = {
        currentView: "dashboard",
        selectedBrandFilter: "all", // "all", "fiat", "peugeot"
        currentDate: (() => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        })(),
        draggedClientId: null
    };

    // Referencias a elementos del DOM
    const views = {
        dashboard: document.getElementById("view-dashboard"),
        agenda: document.getElementById("view-agenda"),
        crm: document.getElementById("view-crm"),
        stock: document.getElementById("view-stock"),
        ventas: document.getElementById("view-ventas")
    };

    const navLinks = {
        dashboard: document.getElementById("nav-dashboard"),
        agenda: document.getElementById("nav-agenda"),
        crm: document.getElementById("nav-crm"),
        stock: document.getElementById("nav-stock"),
        ventas: document.getElementById("nav-ventas")
    };

    const pageTitle = document.getElementById("page-title");
    const currentDateText = document.getElementById("current-date-text");
    const globalSearch = document.getElementById("global-search");

    // ============================================================================
    // INICIALIZACIÓN
    // ============================================================================
    function init() {
        try {
            setupLogin();
            setupNavigation();
            setupBrandSelector();
            setupModals();
            setupKanbanDragAndDrop();
            setupGlobalSearch();
            setupAssistantChat();
            
            // Renderizado inicial
            updateDateDisplay();
            setupCollapsiblePanels();
            
            // Inicializar Lucide Icons
            lucide.createIcons();
        } catch (err) {
            alert("Error al iniciar Brezza Aurea:\n" + err.message + "\n" + err.stack);
            console.error(err);
        }
    }

    function setupCollapsiblePanels() {
        const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
        const btnToggleAssistant = document.getElementById("btn-toggle-assistant");
        const btnCloseSidebarInline = document.getElementById("btn-close-sidebar-inline");
        const btnCloseAssistantInline = document.getElementById("btn-close-assistant-inline");
        const appContainer = document.querySelector(".app-container");

        if (!btnToggleSidebar || !btnToggleAssistant || !appContainer) return;

        // Cargar preferencias guardadas
        if (localStorage.getItem("fp_sidebar_hidden") === "true") {
            appContainer.classList.add("sidebar-hidden");
        }
        if (localStorage.getItem("fp_assistant_hidden") === "true") {
            appContainer.classList.add("assistant-hidden");
        }

        btnToggleSidebar.addEventListener("click", () => {
            appContainer.classList.toggle("sidebar-hidden");
            localStorage.setItem("fp_sidebar_hidden", appContainer.classList.contains("sidebar-hidden"));
        });

        btnToggleAssistant.addEventListener("click", () => {
            appContainer.classList.toggle("assistant-hidden");
            localStorage.setItem("fp_assistant_hidden", appContainer.classList.contains("assistant-hidden"));
        });

        if (btnCloseSidebarInline) {
            btnCloseSidebarInline.addEventListener("click", () => {
                appContainer.classList.add("sidebar-hidden");
                localStorage.setItem("fp_sidebar_hidden", "true");
            });
        }

        if (btnCloseAssistantInline) {
            btnCloseAssistantInline.addEventListener("click", () => {
                appContainer.classList.add("assistant-hidden");
                localStorage.setItem("fp_assistant_hidden", "true");
            });
        }

        // En celulares, cerrar los paneles si se hace clic en la sección principal
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
            mainContent.addEventListener("click", (e) => {
                if (window.innerWidth <= 900) {
                    if (e.target.closest("#btn-toggle-sidebar") || e.target.closest("#btn-toggle-assistant")) {
                        return;
                    }
                    if (!appContainer.classList.contains("sidebar-hidden")) {
                        appContainer.classList.add("sidebar-hidden");
                        localStorage.setItem("fp_sidebar_hidden", "true");
                    }
                    if (!appContainer.classList.contains("assistant-hidden")) {
                        appContainer.classList.add("assistant-hidden");
                        localStorage.setItem("fp_assistant_hidden", "true");
                    }
                }
            });
        }
    }

    // ============================================================================
    // ROUTING Y NAVEGACIÓN SPA
    // ============================================================================
    function setupNavigation() {
        Object.keys(navLinks).forEach(viewName => {
            navLinks[viewName].addEventListener("click", (e) => {
                e.preventDefault();
                navigateTo(viewName);
            });
        });

        window.addEventListener("hashchange", () => {
            const hash = window.location.hash.replace("#", "");
            if (views[hash]) {
                navigateTo(hash);
            }
        });

        const initialHash = window.location.hash.replace("#", "");
        if (views[initialHash]) {
            navigateTo(initialHash);
        } else {
            navigateTo("dashboard");
        }

        document.getElementById("dashboard-see-all-appointments").addEventListener("click", () => {
            navigateTo("agenda");
        });
    }

    function navigateTo(viewName) {
        state.currentView = viewName;
        window.location.hash = viewName;

        Object.keys(navLinks).forEach(name => {
            if (name === viewName) {
                navLinks[name].classList.add("active");
            } else {
                navLinks[name].classList.remove("active");
            }
        });

        Object.keys(views).forEach(name => {
            if (name === viewName) {
                views[name].classList.add("active");
            } else {
                views[name].classList.remove("active");
            }
        });

        const titles = {
            dashboard: "Dashboard General - Brezza Aurea",
            agenda: "Agenda de Citas & Entregas",
            crm: "Pipeline de Leads",
            stock: "Inventario de Unidades 0km",
            ventas: "Ventas & Trámites de Gestoría"
        };
        pageTitle.textContent = titles[viewName];

        // Cerrar sidebar al navegar en celulares
        if (window.innerWidth <= 900) {
            const appContainer = document.querySelector(".app-container");
            if (appContainer) {
                appContainer.classList.add("sidebar-hidden");
                localStorage.setItem("fp_sidebar_hidden", "true");
            }
        }

        renderAll();
    }

    // ============================================================================
    // SELECTOR DE MARCA FIAT / PEUGEOT
    // ============================================================================
    function setupBrandSelector() {
        const btnAll = document.getElementById("btn-brand-all");
        const btnFiat = document.getElementById("btn-brand-fiat");
        const btnPeugeot = document.getElementById("btn-brand-peugeot");

        const buttons = [btnAll, btnFiat, btnPeugeot];

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const brand = btn.getAttribute("data-brand");
                state.selectedBrandFilter = brand;

                document.body.className = ""; 
                if (brand === "fiat") {
                    document.body.classList.add("theme-fiat");
                } else if (brand === "peugeot") {
                    document.body.classList.add("theme-peugeot");
                } else {
                    document.body.classList.add("theme-mixed");
                }

                renderAll();
            });
        });
    }

    // ============================================================================
    // RENDERIZADO GLOBAL
    // ============================================================================
    function renderAll() {
        const clients = getFilteredClients();
        const appointments = getFilteredAppointments();
        const stock = getFilteredStock();
        const operations = getFilteredOperations();

        updateBadges(appointments);

        if (state.currentView === "dashboard") {
            renderDashboard(clients, appointments, stock);
        } else if (state.currentView === "agenda") {
            renderAgenda(clients, appointments);
        } else if (state.currentView === "crm") {
            renderCRM(clients);
        } else if (state.currentView === "stock") {
            renderStock(stock);
        } else if (state.currentView === "ventas") {
            renderOperations(operations);
        }

        renderAssistantPriorities(clients, appointments);
        lucide.createIcons();
    }

    // --- FILTROS DE BÚSQUEDA ---
    function getFilteredClients() {
        const allClients = db.getClients();
        const searchQuery = globalSearch.value.toLowerCase().trim();

        return allClients.filter(c => {
            if (state.selectedBrandFilter !== "all" && c.brandInterest.toLowerCase() !== state.selectedBrandFilter) {
                return false;
            }
            if (searchQuery) {
                const matchesName = c.name.toLowerCase().includes(searchQuery);
                const matchesModel = c.modelInterest.toLowerCase().includes(searchQuery);
                const matchesPhone = c.phone.includes(searchQuery);
                const matchesStage = translateStage(c.stage).toLowerCase().includes(searchQuery);
                return matchesName || matchesModel || matchesPhone || matchesStage;
            }
            return true;
        });
    }

    function getFilteredAppointments() {
        const allAppts = db.getAppointments();
        const searchQuery = globalSearch.value.toLowerCase().trim();

        return allAppts.filter(a => {
            if (state.currentView === "agenda" && a.date !== state.currentDate) {
                return false;
            }
            if (state.selectedBrandFilter !== "all" && a.brand.toLowerCase() !== state.selectedBrandFilter) {
                return false;
            }
            if (searchQuery) {
                const client = db.getClientById(a.clientId);
                const clientName = client ? client.name.toLowerCase() : "";
                const matchesClient = clientName.includes(searchQuery);
                const matchesModel = a.model.toLowerCase().includes(searchQuery);
                const matchesNotes = (a.notes || "").toLowerCase().includes(searchQuery);
                const matchesType = a.type.toLowerCase().includes(searchQuery);
                return matchesClient || matchesModel || matchesNotes || matchesType;
            }
            return true;
        });
    }

    function getFilteredStock() {
        const allStock = db.getStock();
        const searchQuery = globalSearch.value.toLowerCase().trim();

        return allStock.filter(v => {
            if (state.selectedBrandFilter !== "all" && v.brand.toLowerCase() !== state.selectedBrandFilter) {
                return false;
            }
            if (searchQuery) {
                const matchesModel = v.model.toLowerCase().includes(searchQuery);
                const matchesVersion = v.version.toLowerCase().includes(searchQuery);
                const matchesVin = v.vin.toLowerCase().includes(searchQuery);
                const matchesLocation = v.location.toLowerCase().includes(searchQuery);
                const matchesStatus = v.status.toLowerCase().includes(searchQuery);
                return matchesModel || matchesVersion || matchesVin || matchesLocation || matchesStatus;
            }
            return true;
        });
    }

    function getFilteredOperations() {
        const allOps = db.getOperations();
        const searchQuery = globalSearch.value.toLowerCase().trim();

        return allOps.filter(o => {
            const client = db.getClientById(o.clientId);
            const vehicle = db.getVehicleById(o.vehiculoId);
            
            if (state.selectedBrandFilter !== "all") {
                if (vehicle && vehicle.brand.toLowerCase() !== state.selectedBrandFilter) {
                    return false;
                }
            }

            if (searchQuery) {
                const clientName = client ? client.name.toLowerCase() : "";
                const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}`.toLowerCase() : "";
                const vin = vehicle ? vehicle.vin.toLowerCase() : "";
                const matchesClient = clientName.includes(searchQuery);
                const matchesVehicle = vehicleName.includes(searchQuery);
                const matchesVin = vin.includes(searchQuery);
                const matchesDoc = o.docStatus.toLowerCase().includes(searchQuery);
                return matchesClient || matchesVehicle || matchesVin || matchesDoc;
            }
            return true;
        });
    }

    function updateBadges(appointments) {
        const todayApptsCount = db.getAppointments().filter(a => a.date === state.currentDate && a.status === "Pendiente").length;
        const agendaBadge = document.getElementById("badge-agenda-count");
        if (todayApptsCount > 0) {
            agendaBadge.textContent = todayApptsCount;
            agendaBadge.style.display = "inline-block";
        } else {
            agendaBadge.style.display = "none";
        }
    }

    function translateStage(stage) {
        const stages = {
            contacto: "Contacto Inicial",
            presupuesto: "Presupuesto",
            entrevista: "Cita / Test Drive",
            cierre: "Boleto / Cierre",
            entrega: "Entrega de Unidad"
        };
        return stages[stage] || stage;
    }

    // ============================================================================
    // REGLAS DE NEGOCIO (VALIDADORES)
    // ============================================================================
    
    // Regala 1: Entregas de 0km requieren documentación 'Patentado' y estado 'PDI Listo'
    function validarDocumentacionPDI(clientId, vehiculoId) {
        const op = db.getOperationByClientId(clientId);
        if (!op) {
            return {
                ok: false,
                reason: "No se encontró ninguna operación de venta para este cliente."
            };
        }
        
        // Si el auto no es el asignado
        if (vehiculoId && op.vehiculoId !== vehiculoId) {
            return {
                ok: false,
                reason: "El vehículo seleccionado para la entrega no coincide con el chasis asignado a la venta."
            };
        }

        if (op.docStatus === "En Gestoría") {
            return {
                ok: false,
                reason: "La documentación figura 'En Gestoría' (Falta Patentamiento)."
            };
        }

        if (op.docStatus === "Patentado") {
            return {
                ok: false,
                warning: true, // Advertencia porque falta la inspección técnica final
                reason: "La unidad está 'Patentada', pero falta el 'PDI Listo' (Inspección Pre-Entrega)."
            };
        }

        return { ok: true };
    }

    // Regla 2: Los Test Drives duran 45 min; no solapar turnos del mismo vehículo demostrador
    function validarSuperposicionTestDrive(vehiculoId, fecha, hora, apptIdExcluir = null) {
        if (!vehiculoId) return { ok: true };

        const allAppts = db.getAppointments();
        const testDrives = allAppts.filter(a => 
            a.id !== apptIdExcluir &&
            a.vehiculoId === vehiculoId &&
            a.date === fecha &&
            a.type === "Test Drive" &&
            a.status !== "Cancelada"
        );

        const nuevoTiempo = parseTimeToMinutes(hora);
        const DURACION_MINUTOS = 45;

        for (let td of testDrives) {
            const tdTiempo = parseTimeToMinutes(td.time);
            const diferencia = Math.abs(nuevoTiempo - tdTiempo);
            if (diferencia < DURACION_MINUTOS) {
                return {
                    ok: false,
                    reason: `Superposición de Test Drive. Ya hay un Test Drive agendado a las ${td.time} hs (Margen mínimo de 45 min no respetado).`
                };
            }
        }

        return { ok: true };
    }

    function parseTimeToMinutes(timeStr) {
        const [hh, mm] = timeStr.split(":").map(Number);
        return hh * 60 + mm;
    }

    // ============================================================================
    // FUNCIONES CORE (CRUD)
    // ============================================================================

    function crear_evento(tipo, fecha, hora, clientId, vehiculoId, descripcion) {
        // Ejecutar validaciones según tipo de evento
        if (tipo === "Entrega de 0km") {
            const val = validarDocumentacionPDI(clientId, vehiculoId);
            if (!val.ok) {
                throw new Error(val.reason);
            }
        } else if (tipo === "Test Drive") {
            const val = validarSuperposicionTestDrive(vehiculoId, fecha, hora);
            if (!val.ok) {
                throw new Error(val.reason);
            }
        }

        const client = db.getClientById(clientId);
        const apptData = {
            clientId,
            vehiculoId,
            brand: client ? client.brandInterest : "Fiat",
            model: client ? client.modelInterest : "Cronos",
            date: fecha,
            time: hora,
            type: tipo,
            status: "Pendiente",
            notes: descripcion
        };

        const newAppt = db.addAppointment(apptData);

        // Avanzar etapa del Lead si aplica
        if (client) {
            let actualizoEtapa = false;
            if (tipo === "Test Drive" && client.stage === "contacto") {
                client.stage = "entrevista";
                actualizoEtapa = true;
            } else if (tipo === "Entrega de 0km" && client.stage !== "entrega") {
                client.stage = "entrega";
                actualizoEtapa = true;
            }

            client.history.push({
                date: new Date().toISOString(),
                text: `Cita creada: ${tipo} para el ${fecha} a las ${hora} hs. ${actualizoEtapa ? `Etapa actualizada a: ${translateStage(client.stage)}` : ''}`
            });
            db.updateClient(client);
        }

        return newAppt;
    }

    function obtener_agenda_del_dia(fecha) {
        const appts = db.getAppointments();
        return appts.filter(a => a.date === fecha);
    }

    function actualizar_estado_evento(id, nuevo_estado) {
        const appt = db.getAppointmentById(id);
        if (!appt) throw new Error("Cita no encontrada.");

        appt.status = nuevo_estado;
        db.updateAppointment(appt);

        // Actualizar historial de cliente
        const client = db.getClientById(appt.clientId);
        if (client) {
            client.history.push({
                date: new Date().toISOString(),
                text: `Estado de cita "${appt.type}" de las ${appt.time} hs cambiado a: ${nuevo_estado}.`
            });
            db.updateClient(client);
        }

        return appt;
    }

    function reprogramar_evento(id, nueva_fecha, nueva_hora) {
        const appt = db.getAppointmentById(id);
        if (!appt) throw new Error("Cita no encontrada.");

        // Validaciones de reglas de negocio
        if (appt.type === "Entrega de 0km") {
            const val = validarDocumentacionPDI(appt.clientId, appt.vehiculoId);
            if (!val.ok) throw new Error(val.reason);
        } else if (appt.type === "Test Drive") {
            const val = validarSuperposicionTestDrive(appt.vehiculoId, nueva_fecha, nueva_hora, appt.id);
            if (!val.ok) throw new Error(val.reason);
        }

        const viejaFecha = appt.date;
        const viejaHora = appt.time;

        appt.date = nueva_fecha;
        appt.time = nueva_hora;
        appt.status = "Reprogramado";

        db.updateAppointment(appt);

        // Registro de historial
        const client = db.getClientById(appt.clientId);
        if (client) {
            client.history.push({
                date: new Date().toISOString(),
                text: `Cita "${appt.type}" reprogramada de: ${viejaFecha} ${viejaHora} hs a: ${nueva_fecha} ${nueva_hora} hs.`
            });
            db.updateClient(client);
        }

        return appt;
    }

    // ============================================================================
    // VISTA 1: DASHBOARD
    // ============================================================================
    function renderDashboard(clients, appointments, stock) {
        const allAppts = db.getAppointments();
        const allClients = db.getClients();
        const allStock = db.getStock();
        const brandFilter = state.selectedBrandFilter;

        const filteredApptsRaw = allAppts.filter(a => brandFilter === "all" || a.brand.toLowerCase() === brandFilter);
        const filteredClientsRaw = allClients.filter(c => brandFilter === "all" || c.brandInterest.toLowerCase() === brandFilter);
        const filteredStockRaw = allStock.filter(v => brandFilter === "all" || v.brand.toLowerCase() === brandFilter);

        // Citas de hoy
        const todayAppts = filteredApptsRaw.filter(a => a.date === state.currentDate);
        document.getElementById("metric-citas-hoy").textContent = todayAppts.length;

        // Leads activos (contacto, presupuesto, entrevista)
        const activeLeads = filteredClientsRaw.filter(c => c.stage !== "entrega" && c.stage !== "cierre");
        document.getElementById("metric-seguimientos").textContent = activeLeads.length;

        // Cierres / Reservados
        const closures = filteredClientsRaw.filter(c => c.stage === "cierre" || c.stage === "entrega");
        document.getElementById("metric-cierres").textContent = closures.length;

        // Stock disponible
        const availableStock = filteredStockRaw.filter(v => v.status === "Disponible");
        document.getElementById("metric-stock-disp").textContent = availableStock.length;

        // Lista de Próximas Citas Prioritarias
        const upcomingListContainer = document.getElementById("dashboard-upcoming-list");
        upcomingListContainer.innerHTML = "";

        const sortedTodayAppts = [...todayAppts].sort((a, b) => a.time.localeCompare(b.time));

        if (sortedTodayAppts.length === 0) {
            upcomingListContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i data-lucide="info" style="width: 24px; height: 24px; margin-bottom: 8px;"></i>
                    <p>No tenés actividades agendadas para hoy, crack.</p>
                </div>
            `;
        } else {
            sortedTodayAppts.forEach(appt => {
                const client = db.getClientById(appt.clientId);
                if (!client) return;

                const item = document.createElement("div");
                item.className = `activity-item ${appt.brand.toLowerCase()}`;
                item.addEventListener("click", () => openAppointmentModal(appt.id));

                item.innerHTML = `
                    <div class="activity-main-info">
                        <div class="activity-time-badge">${appt.time} hs</div>
                        <div class="activity-client-details">
                            <span class="activity-client-name">${client.name}</span>
                            <span class="activity-car">
                                <span class="brand-tag ${appt.brand.toLowerCase()}">${appt.brand}</span>
                                ${appt.model} - ${appt.type}
                            </span>
                        </div>
                    </div>
                    <div class="activity-right-info">
                        <span class="status-badge ${appt.status.toLowerCase()}">${appt.status}</span>
                        <i data-lucide="chevron-right" class="text-muted" style="width:16px;"></i>
                    </div>
                `;
                upcomingListContainer.appendChild(item);
            });
        }

        // Ranking de Modelos
        const modelsListContainer = document.getElementById("dashboard-models-list");
        modelsListContainer.innerHTML = "";

        const modelCounts = {};
        const brandsToCount = brandFilter === "all" ? ["Fiat", "Peugeot"] : [brandFilter.charAt(0).toUpperCase() + brandFilter.slice(1)];
        brandsToCount.forEach(b => {
            VEHICLE_MODELS[b].forEach(m => {
                modelCounts[`${b} ${m}`] = { brand: b, name: m, count: 0 };
            });
        });

        filteredClientsRaw.forEach(c => {
            const key = `${c.brandInterest} ${c.modelInterest}`;
            if (modelCounts[key]) {
                modelCounts[key].count++;
            }
        });

        const topModels = Object.values(modelCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

        const maxCount = Math.max(...topModels.map(m => m.count), 1);

        topModels.forEach(m => {
            const percentage = Math.round((m.count / maxCount) * 100);
            const item = document.createElement("div");
            item.className = "model-stat-item";
            item.innerHTML = `
                <div class="model-stat-info">
                    <span class="model-stat-name">${m.brand} ${m.name}</span>
                    <span class="model-stat-count">${m.count} ${m.count === 1 ? 'interés' : 'intereses'}</span>
                </div>
                <div class="model-stat-bar-bg">
                    <div class="model-stat-bar-fill ${m.brand.toLowerCase()}" style="width: ${percentage}%"></div>
                </div>
            `;
            modelsListContainer.appendChild(item);
        });
    }

    // ============================================================================
    // VISTA 2: AGENDA
    // ============================================================================
    function renderAgenda(clients, appointments) {
        const agendaDateDisplay = document.getElementById("agenda-date-display");
        
        if (state.currentDate === "2026-06-21") {
            agendaDateDisplay.textContent = "Hoy (21 de Jun)";
        } else {
            const [year, month, day] = state.currentDate.split("-");
            agendaDateDisplay.textContent = `${day}/${month}/${year}`;
        }

        const hoursContainer = document.getElementById("agenda-hours-container");
        hoursContainer.innerHTML = "";

        const workHours = [
            "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
            "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
        ];

        const statusFilter = document.getElementById("filter-agenda-status").value;

        workHours.forEach(hourStr => {
            const hourBlock = document.createElement("div");
            hourBlock.className = "hour-block";
            
            const matchedAppts = appointments.filter(appt => {
                const apptHour = appt.time.split(":")[0];
                const blockHour = hourStr.split(":")[0];
                const matchesHour = apptHour === blockHour;
                const matchesStatus = statusFilter === "all" || appt.status === statusFilter;
                return matchesHour && matchesStatus;
            });

            const hourLabel = document.createElement("div");
            hourLabel.className = "hour-label";
            hourLabel.textContent = hourStr;

            const apptContainer = document.createElement("div");
            apptContainer.className = "hour-appointments";
            apptContainer.addEventListener("dblclick", () => {
                openAppointmentModal(null, state.currentDate, hourStr);
            });

            if (matchedAppts.length === 0) {
                apptContainer.innerHTML = `
                    <div class="text-muted" style="font-size: 0.75rem; padding: 12px; font-style: italic; border: 1px dashed rgba(255,255,255,0.02); border-radius: var(--radius-md);">
                        Sin citas agendadas
                    </div>
                `;
            } else {
                matchedAppts.forEach(appt => {
                    const client = db.getClientById(appt.clientId);
                    if (!client) return;

                    const apptCard = document.createElement("div");
                    apptCard.className = `appointment-card ${appt.brand.toLowerCase()}`;
                    apptCard.addEventListener("click", (e) => {
                        e.stopPropagation();
                        openAppointmentModal(appt.id);
                    });

                    // Si es entrega de 0km, validamos en el renderizado y mostramos advertencia si no está PDI Listo
                    let warningTag = "";
                    if (appt.type === "Entrega de 0km") {
                        const check = validarDocumentacionPDI(appt.clientId, appt.vehiculoId);
                        if (!check.ok) {
                            warningTag = `<span class="text-danger" style="font-size:0.7rem; font-weight:600; display:inline-flex; align-items:center; gap:2px; margin-top:4px;"><i data-lucide="alert-triangle" style="width:10px; height:10px;"></i> Doc: ${check.reason}</span>`;
                        } else if (check.warning) {
                            warningTag = `<span class="text-warning" style="font-size:0.7rem; font-weight:600; display:inline-flex; align-items:center; gap:2px; margin-top:4px;"><i data-lucide="alert-circle" style="width:10px; height:10px;"></i> ${check.reason}</span>`;
                        }
                    }

                    apptCard.innerHTML = `
                        <div class="appt-card-header">
                            <span class="appt-card-title">${client.name}</span>
                            <span class="status-badge ${appt.status.toLowerCase()}">${appt.status}</span>
                        </div>
                        <div class="appt-card-details">
                            <div class="appt-card-row">
                                <span class="brand-tag ${appt.brand.toLowerCase()}">${appt.brand}</span>
                                <strong>${appt.model}</strong>
                            </div>
                            <div class="appt-card-row">
                                <i data-lucide="tag" style="width:12px; height:12px;"></i>
                                <span>${appt.type}</span>
                            </div>
                            <div class="appt-card-row">
                                <i data-lucide="clock" style="width:12px; height:12px;"></i>
                                <span>${appt.time} hs</span>
                            </div>
                            ${warningTag}
                        </div>
                        ${appt.notes ? `<p class="appt-card-notes">${appt.notes}</p>` : ""}
                    `;
                    apptContainer.appendChild(apptCard);
                });
            }

            hourBlock.appendChild(hourLabel);
            hourBlock.appendChild(apptContainer);
            hoursContainer.appendChild(hourBlock);
        });

        setupAgendaDayNavigation();
    }

    function setupAgendaDayNavigation() {
        const btnPrev = document.getElementById("btn-prev-day");
        const btnNext = document.getElementById("btn-next-day");
        const filterStatus = document.getElementById("filter-agenda-status");

        const newBtnPrev = btnPrev.cloneNode(true);
        const newBtnNext = btnNext.cloneNode(true);
        btnPrev.parentNode.replaceChild(newBtnPrev, btnPrev);
        btnNext.parentNode.replaceChild(newBtnNext, btnNext);

        newBtnPrev.addEventListener("click", () => {
            changeAgendaDate(-1);
        });
        newBtnNext.addEventListener("click", () => {
            changeAgendaDate(1);
        });

        filterStatus.onchange = () => {
            renderAll();
        };
    }

    function changeAgendaDate(daysOffset) {
        const currentDateObj = new Date(state.currentDate + "T00:00:00");
        currentDateObj.setDate(currentDateObj.getDate() + daysOffset);
        
        const yyyy = currentDateObj.getFullYear();
        const mm = String(currentDateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDateObj.getDate()).padStart(2, '0');
        
        state.currentDate = `${yyyy}-${mm}-${dd}`;
        renderAll();
    }

    // ============================================================================
    // VISTA 3: CRM / PIPELINE DE LEADS
    // ============================================================================
    function renderCRM(clients) {
        const stages = ["contacto", "presupuesto", "entrevista", "cierre", "entrega"];
        
        stages.forEach(stage => {
            const container = document.getElementById(`container-stage-${stage}`);
            const countBadge = document.getElementById(`count-stage-${stage}`);
            container.innerHTML = "";

            const stageClients = clients.filter(c => c.stage === stage);
            countBadge.textContent = stageClients.length;

            if (stageClients.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4 text-muted" style="font-size:0.75rem; border: 1px dashed rgba(255,255,255,0.03); border-radius: var(--radius-md);">
                        Sin leads
                    </div>
                `;
            } else {
                stageClients.forEach(client => {
                    const card = document.createElement("div");
                    card.className = "kanban-card";
                    card.setAttribute("draggable", "true");
                    card.setAttribute("data-id", client.id);

                    card.addEventListener("click", () => openClientModal(client.id));

                    card.addEventListener("dragstart", (e) => {
                        card.classList.add("dragging");
                        state.draggedClientId = client.id;
                    });

                    card.addEventListener("dragend", () => {
                        card.classList.remove("dragging");
                        state.draggedClientId = null;
                    });
                    card.innerHTML = `
                        <div class="client-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                            <div class="client-card-name" style="font-weight: 600;">${client.name}</div>
                            <button class="btn-delete-client" action="delete-client" style="background:transparent; border:none; color:#a0a0a0; cursor:pointer; padding:4px;" onclick="event.stopPropagation();">
                                <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
                            </button>
                        </div>
                        <div class="client-card-car">
                            <span class="brand-tag ${client.brandInterest.toLowerCase()}">${client.brandInterest}</span>
                            <strong>${client.modelInterest}</strong>
                        </div>
                        <div class="client-card-footer">
                            <a href="tel:${client.phone}" class="client-card-phone" onclick="event.stopPropagation();">
                                <i data-lucide="phone" style="width:12px; height:12px;"></i>
                                <span>Llamar</span>
                            </a>
                            <button class="btn-notes-count">
                                <i data-lucide="message-square" style="width:12px; height:12px;"></i>
                                <span>${client.history.length}</span>
                            </button>
                        </div>
                    `;
                    
                    card.querySelector('button[action="delete-client"]').addEventListener("click", (e) => {
                        e.stopPropagation();
                        if (confirm(`¿Estás seguro de eliminar a ${client.name}? Se borrarán también sus citas y ventas asociadas.`)) {
                            db.deleteClient(client.id);
                            addAssistantSystemMessage(`¡Eliminado crack! Saqué a <strong>${client.name}</strong> del sistema y liberé su stock.`);
                            renderAll();
                        }
                    });

                    container.appendChild(card);
                });
            }
        });
    }

    function setupKanbanDragAndDrop() {
        const containers = document.querySelectorAll(".kanban-cards-container");
        
        containers.forEach(container => {
            container.addEventListener("dragover", (e) => {
                e.preventDefault();
                const draggingCard = document.querySelector(".dragging");
                if (draggingCard) container.appendChild(draggingCard);
            });

            container.addEventListener("drop", (e) => {
                e.preventDefault();
                const targetStage = container.getAttribute("data-stage");
                const clientId = state.draggedClientId;

                if (clientId && targetStage) {
                    const client = db.getClientById(clientId);
                    if (client && client.stage !== targetStage) {
                        const oldStage = client.stage;
                        client.stage = targetStage;

                        const dateStr = new Date().toISOString();
                        client.history.push({
                            date: dateStr,
                            text: `Fase del Lead actualizada de "${translateStage(oldStage)}" a "${translateStage(targetStage)}".`
                        });

                        db.updateClient(client);

                        // Si pasa a etapa "cierre" (Boleto) o "entrega", Nico festeja
                        if (targetStage === "cierre") {
                            addAssistantSystemMessage(`¡Excelente venta, crack! 🚗🔥 Mandaste a <strong>${client.name}</strong> a la firma del boleto. ¡Aseguralo y pasale el link de reserva al toque antes de que vuele!`);
                            
                            // Abrir automáticamente el modal de Operación de Venta si no existe una para este cliente
                            const existingOp = db.getOperationByClientId(client.id);
                            if (!existingOp) {
                                setTimeout(() => {
                                    openOperationModal(null, client.id);
                                }, 1500);
                            }
                        } else if (targetStage === "entrega") {
                            addAssistantSystemMessage(`¡Espectacular! 🔑🏆 El nuevo ${client.brandInterest} de <strong>${client.name}</strong> ya está listo para salir a la calle. ¡Qué gran laburo!`);
                        }

                        renderAll();
                    }
                }
            });
        });
    }

    // ============================================================================
    // VISTA 4: STOCK STELLANTIS
    // ============================================================================
    function renderStock(stock) {
        const tbody = document.getElementById("stock-tbody");
        tbody.innerHTML = "";

        if (stock.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        No hay vehículos de stock que coincidan con la búsqueda.
                    </td>
                </tr>
            `;
            return;
        }

        stock.forEach(v => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="brand-tag ${v.brand.toLowerCase()}">${v.brand}</span></td>
                <td><strong>${v.model}</strong> <span class="text-muted" style="font-size:0.8rem;">${v.version}</span></td>
                <td><span class="vin-tag">${v.vin}</span></td>
                <td>${v.engine}</td>
                <td>${v.color}</td>
                <td>${v.origin}</td>
                <td>${v.location}</td>
                <td><span class="badge-stock ${v.status.toLowerCase()}">${v.status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" btn-id="${v.id}" action="change-location">
                        Mover
                    </button>
                </td>
            `;

            // Acción para cambiar ubicación rápido del auto
            tr.querySelector('button[action="change-location"]').addEventListener("click", () => {
                const locations = ["Salón", "Playón", "Depósito"];
                const currentIndex = locations.indexOf(v.location);
                const nextIndex = (currentIndex + 1) % locations.length;
                v.location = locations[nextIndex];
                db.updateVehicle(v);
                
                // Mensaje en chat de Nico
                addAssistantSystemMessage(`¡Movéte, movéte! 🚗 Desplacé el ${v.brand} ${v.model} (${v.color}) al <strong>${v.location}</strong>.`);
                renderAll();
            });

            tbody.appendChild(tr);
        });
    }

    // ============================================================================
    // VISTA 5: OPERACIONES (VENTAS)
    // ============================================================================
    function renderOperations(operations) {
        const tbody = document.getElementById("ventas-tbody");
        tbody.innerHTML = "";

        if (operations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        No hay operaciones comerciales registradas.
                    </td>
                </tr>
            `;
            return;
        }

        operations.forEach(op => {
            const client = db.getClientById(op.clientId);
            const vehicle = db.getVehicleById(op.vehiculoId);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${client ? client.name : 'Desconocido'}</strong></td>
                <td>${vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.color})` : 'Sin asignar'}</td>
                <td><span class="vin-tag">${vehicle ? vehicle.vin : '-'}</span></td>
                <td>${op.paymentMethod}</td>
                <td><span class="badge-doc ${op.docStatus.toLowerCase().replace(/ /g, '-')}">${op.docStatus}</span></td>
                <td>
                    <span class="badge-stock ${op.docStatus === 'PDI Listo' ? 'disponible' : 'reservado'}">
                        ${op.docStatus === 'PDI Listo' ? 'Listo' : 'Pendiente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" action="advance-op">Avanzar fase</button>
                    <button class="btn btn-danger btn-sm" action="delete-op" style="background-color:#e63946; color:white; border:none; margin-left:4px; padding:4px 8px; border-radius:4px; cursor:pointer;">Eliminar</button>
                </td>
            `;

            tr.querySelector('button[action="advance-op"]').addEventListener("click", () => {
                const docStages = ["En Gestoría", "Patentado", "PDI Listo"];
                const currentIndex = docStages.indexOf(op.docStatus);
                if (currentIndex < docStages.length - 1) {
                    const nextStage = docStages[currentIndex + 1];
                    op.docStatus = nextStage;
                    db.updateOperation(op);

                    if (client) {
                        client.history.push({
                            date: new Date().toISOString(),
                            text: `Venta modificada: Documentación avanzada a: ${nextStage}.`
                        });
                        db.updateClient(client);
                    }

                    if (nextStage === "Patentado") {
                        addAssistantSystemMessage(`¡Papeles listos, crack! El auto de <strong>${client.name}</strong> ya está patentado. Falta hacer el PDI (Inspección Pre-Entrega) para poder coordinar el turno de entrega sin dramas. ⚽📝`);
                    } else if (nextStage === "PDI Listo") {
                        addAssistantSystemMessage(`¡PDI VERIFICADO! 🚗✨ El coche de <strong>${client.name}</strong> está 100% limpio y revisado. Ya podés agendar la entrega física con total seguridad. ¡Metéle para adelante!`);
                    }

                    renderAll();
                } else {
                    alert("Esta operación ya se encuentra en su fase final de entrega.");
                }
            });

            tr.querySelector('button[action="delete-op"]').addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm(`¿Estás seguro de eliminar esta venta? El coche asignado volverá a estar Disponible.`)) {
                    db.deleteOperation(op.id);
                    addAssistantSystemMessage(`¡Venta cancelada crack! El auto del cliente <strong>${client ? client.name : 'comprador'}</strong> volvió al stock disponible.`);
                    renderAll();
                }
            });

            tbody.appendChild(tr);
        });
    }

    // ============================================================================
    // MODALES & FORMULARIOS
    // ============================================================================
    const apptModal = document.getElementById("modal-appointment");
    const clientModal = document.getElementById("modal-client");
    const opModal = document.getElementById("modal-operation");

    function setupModals() {
        // Cerrar modales
        document.getElementById("btn-close-appointment").addEventListener("click", () => closeApptModal());
        document.getElementById("btn-cancel-appt").addEventListener("click", () => closeApptModal());
        
        document.getElementById("btn-close-client-modal").addEventListener("click", () => closeClientModal());
        document.getElementById("btn-cancel-client").addEventListener("click", () => closeClientModal());

        document.getElementById("btn-close-op-modal").addEventListener("click", () => closeOpModal());
        document.getElementById("btn-cancel-op").addEventListener("click", () => closeOpModal());

        // Nueva cita
        document.getElementById("btn-quick-appointment").addEventListener("click", () => {
            openAppointmentModal();
        });

        // Nuevo cliente
        document.getElementById("btn-add-client").addEventListener("click", () => {
            openClientModal();
        });

        // Nueva venta
        document.getElementById("btn-add-operation").addEventListener("click", () => {
            openOperationModal();
        });

        // Enlazar cambios de selectores de marca para filtrar modelos correspondientes
        document.getElementById("appt-brand").addEventListener("change", (e) => {
            populateModelSelect("appt-model", e.target.value);
            populateVehicleSelect("appt-vehicle-select", e.target.value);
        });

        document.getElementById("client-brand").addEventListener("change", (e) => {
            populateModelSelect("client-model", e.target.value);
        });

        // Submit formularios
        document.getElementById("form-appointment").addEventListener("submit", handleApptSubmit);
        document.getElementById("form-client").addEventListener("submit", handleClientSubmit);
        document.getElementById("form-operation").addEventListener("submit", handleOpSubmit);
        
        // Toggle campos nuevo cliente inline en el modal de citas
        const btnToggleNewClient = document.getElementById("btn-toggle-new-client-fields");
        const btnCancelNewClient = document.getElementById("btn-cancel-new-client-inline");
        const newClientFields = document.getElementById("new-client-inline-fields");
        const apptClientSelect = document.getElementById("appt-client-select");

        btnToggleNewClient.addEventListener("click", () => {
            newClientFields.style.display = "flex";
            apptClientSelect.required = false;
            apptClientSelect.disabled = true;
            document.getElementById("appt-new-client-name").required = true;
            btnToggleNewClient.style.display = "none";
        });

        btnCancelNewClient.addEventListener("click", () => {
            newClientFields.style.display = "none";
            apptClientSelect.required = true;
            apptClientSelect.disabled = false;
            document.getElementById("appt-new-client-name").required = false;
            document.getElementById("appt-new-client-name").value = "";
            document.getElementById("appt-new-client-phone").value = "";
            document.getElementById("appt-new-client-email").value = "";
            btnToggleNewClient.style.display = "block";
        });

        // Cambio del cliente en citas
        apptClientSelect.addEventListener("change", () => {
            updateClientOtherAppointments(apptClientSelect.value);
        });

        // Agregar nota rápida
        document.getElementById("btn-add-note").addEventListener("click", addQuickClientNote);
    }

    function populateModelSelect(selectId, brand, selectedValue = "") {
        const select = document.getElementById(selectId);
        select.innerHTML = "";
        const models = VEHICLE_MODELS[brand] || [];
        models.forEach(model => {
            const opt = document.createElement("option");
            opt.value = model;
            opt.textContent = model;
            if (model === selectedValue) opt.selected = true;
            select.appendChild(opt);
        });
    }

    function populateClientSelect(selectId, selectedValue = "") {
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="" disabled ${!selectedValue ? "selected" : ""}>Seleccionar cliente...</option>`;
        const clients = db.getClients();
        clients.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = `${c.name} (${c.brandInterest} ${c.modelInterest})`;
            if (c.id === selectedValue) opt.selected = true;
            select.appendChild(opt);
        });
    }

    function populateVehicleSelect(selectId, brand = "Fiat", selectedValue = "") {
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">-- Sin coche asignado (Uso genérico) --</option>`;
        
        const stock = db.getStock().filter(v => v.brand === brand);
        stock.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = `${v.model} ${v.version} - [Color: ${v.color}] - (VIN: ${v.vin.slice(-6)}) [${v.status}]`;
            if (v.id === selectedValue) opt.selected = true;
            select.appendChild(opt);
        });
    }

    // --- Abrir/Cerrar Citas ---
    function openAppointmentModal(apptId = null, defaultDate = null, defaultTime = null) {
        const form = document.getElementById("form-appointment");
        form.reset();

        // Reseteo de campos nuevo cliente inline
        document.getElementById("new-client-inline-fields").style.display = "none";
        document.getElementById("btn-toggle-new-client-fields").style.display = apptId ? "none" : "block";
        
        const apptClientSelect = document.getElementById("appt-client-select");
        apptClientSelect.required = true;
        apptClientSelect.disabled = false;
        document.getElementById("appt-new-client-name").required = false;
        document.getElementById("appt-new-client-name").value = "";
        document.getElementById("appt-new-client-phone").value = "";
        document.getElementById("appt-new-client-email").value = "";

        populateClientSelect("appt-client-select");
        const brandSelect = document.getElementById("appt-brand");
        populateModelSelect("appt-model", brandSelect.value);
        populateVehicleSelect("appt-vehicle-select", brandSelect.value);

        if (apptId) {
            document.getElementById("modal-title-text").textContent = "Editar Cita";
            const appt = db.getAppointmentById(apptId);
            if (appt) {
                document.getElementById("appt-id").value = appt.id;
                populateClientSelect("appt-client-select", appt.clientId);
                document.getElementById("appt-brand").value = appt.brand;
                populateModelSelect("appt-model", appt.brand, appt.model);
                populateVehicleSelect("appt-vehicle-select", appt.brand, appt.vehiculoId);
                document.getElementById("appt-date").value = appt.date;
                document.getElementById("appt-time").value = appt.time;
                document.getElementById("appt-type").value = appt.type;
                document.getElementById("appt-status").value = appt.status;
                document.getElementById("appt-notes").value = appt.notes || "";
                
                updateClientOtherAppointments(appt.clientId);
            }
        } else {
            document.getElementById("modal-title-text").textContent = "Agendar Nueva Cita";
            document.getElementById("appt-id").value = "";
            document.getElementById("appt-date").value = defaultDate || state.currentDate;
            document.getElementById("appt-time").value = defaultTime || "10:00";
            document.getElementById("appt-status").value = "Pendiente";
            
            updateClientOtherAppointments("");
        }

        apptModal.style.display = "flex";
        setTimeout(() => apptModal.classList.add("active"), 10);
        lucide.createIcons();
    }

    function updateClientOtherAppointments(clientId) {
        const otherApptsContainer = document.getElementById("appt-client-other-appts");
        const otherApptsList = document.getElementById("appt-client-other-appts-list");
        if (!otherApptsContainer || !otherApptsList) return;

        otherApptsList.innerHTML = "";
        
        if (!clientId) {
            otherApptsContainer.style.display = "none";
            return;
        }

        // Obtener citas de este cliente (excluyendo la cita que se edita actualmente)
        const currentApptId = document.getElementById("appt-id").value;
        const appts = db.getAppointments().filter(a => a.clientId === clientId && a.id !== currentApptId && a.status !== "Cancelada");

        if (appts.length === 0) {
            otherApptsContainer.style.display = "none";
            return;
        }

        otherApptsContainer.style.display = "block";
        appts.forEach(appt => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn-date-badge";
            
            const [y, m, d] = appt.date.split("-");
            const formattedDate = `${d}/${m}/${y}`;
            
            btn.innerHTML = `<i data-lucide="calendar" style="width:12px; height:12px;"></i> ${formattedDate} (${appt.time} hs - ${appt.type})`;
            btn.title = `Hacé clic para cargar esta fecha y hora`;
            
            btn.addEventListener("click", () => {
                document.getElementById("appt-date").value = appt.date;
                document.getElementById("appt-time").value = appt.time;
                document.getElementById("appt-type").value = appt.type;
                
                // Feedback visual rápido
                btn.style.borderColor = "var(--color-success)";
                btn.style.color = "var(--color-success)";
                setTimeout(() => {
                    btn.style.borderColor = "";
                    btn.style.color = "";
                }, 1000);
            });

            otherApptsList.appendChild(btn);
        });

        lucide.createIcons({
            container: otherApptsList
        });
    }

    function closeApptModal() {
        apptModal.classList.remove("active");
        setTimeout(() => apptModal.style.display = "none", 300);
    }

    function handleApptSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("appt-id").value;
        const clientId = document.getElementById("appt-client-select").value;
        const brand = document.getElementById("appt-brand").value;
        const model = document.getElementById("appt-model").value;
        const vehiculoId = document.getElementById("appt-vehicle-select").value;
        const date = document.getElementById("appt-date").value;
        const time = document.getElementById("appt-time").value;
        const type = document.getElementById("appt-type").value;
        const status = document.getElementById("appt-status").value;
        const notes = document.getElementById("appt-notes").value;

        let targetClientId = clientId;
        const createClientInline = document.getElementById("new-client-inline-fields").style.display === "flex";

        if (createClientInline) {
            const newName = document.getElementById("appt-new-client-name").value.trim();
            const newPhone = document.getElementById("appt-new-client-phone").value.trim();
            const newEmail = document.getElementById("appt-new-client-email").value.trim();

            if (!newName) {
                alert("Por favor ingresá el nombre del nuevo cliente, crack.");
                return;
            }

            // Validar si ya existe un cliente con el mismo nombre para evitar duplicaciones
            const allClients = db.getClients();
            const duplicate = allClients.find(c => c.name.toLowerCase().trim() === newName.toLowerCase().trim());

            if (duplicate) {
                targetClientId = duplicate.id;
                // Actualizar los datos de contacto si se ingresaron nuevos datos
                let updated = false;
                if (newPhone && duplicate.phone !== newPhone) {
                    duplicate.phone = newPhone;
                    updated = true;
                }
                if (newEmail && duplicate.email !== newEmail) {
                    duplicate.email = newEmail;
                    updated = true;
                }
                if (updated) {
                    duplicate.history.push({
                        date: new Date().toISOString(),
                        text: `Datos de contacto actualizados durante el agendamiento de cita.`
                    });
                    db.updateClient(duplicate);
                }
                console.log(`Cliente existente detectado ("${newName}"). Vinculando cita para evitar duplicados.`);
            } else {
                // Crear el cliente nuevo
                const newClient = db.addClient({
                    name: newName,
                    phone: newPhone,
                    email: newEmail,
                    brandInterest: brand,
                    modelInterest: model,
                    stage: "contacto",
                    birthday: ""
                });
                targetClientId = newClient.id;
            }
        } else if (!targetClientId) {
            alert("Elegí un cliente válido, crack.");
            return;
        }

        try {
            if (id) {
                // Modificación CRUD
                reprogramar_evento(id, date, time);
                actualizar_estado_evento(id, status);
                
                // Actualizar notas y vehículo en la cita directamente
                const appt = db.getAppointmentById(id);
                if (appt) {
                    appt.brand = brand;
                    appt.model = model;
                    appt.vehiculoId = vehiculoId;
                    appt.type = type;
                    appt.notes = notes;
                    db.updateAppointment(appt);
                }
            } else {
                // Creación CRUD
                crear_evento(type, date, time, targetClientId, vehiculoId, notes);
            }
            closeApptModal();
            renderAll();
        } catch (err) {
            // Mostrar error de validación en pantalla
            alert(`¡Alerta Brezza Aurea! No se pudo agendar: ${err.message}`);
        }
    }

    // --- Abrir/Cerrar Clientes ---
    function openClientModal(clientId = null) {
        const form = document.getElementById("form-client");
        form.reset();

        const brandSelect = document.getElementById("client-brand");
        populateModelSelect("client-model", brandSelect.value);

        const historyBox = document.getElementById("client-history-box");
        const historyList = document.getElementById("client-history-list");
        historyList.innerHTML = "";

        if (clientId) {
            document.getElementById("modal-client-title").textContent = "Ficha de Lead";
            const client = db.getClientById(clientId);
            if (client) {
                document.getElementById("client-id").value = client.id;
                document.getElementById("client-name").value = client.name;
                document.getElementById("client-phone").value = client.phone;
                document.getElementById("client-email").value = client.email || "";
                document.getElementById("client-brand").value = client.brandInterest;
                populateModelSelect("client-model", client.brandInterest, client.modelInterest);
                document.getElementById("client-origin").value = client.origin || "Web";
                document.getElementById("client-stage").value = client.stage;
                document.getElementById("client-birthday").value = client.birthday || "";

                historyBox.style.display = "flex";

                if (client.history.length === 0) {
                    historyList.innerHTML = `<p class="text-muted text-center" style="font-size:0.75rem;">Sin notas en historial</p>`;
                } else {
                    [...client.history].reverse().forEach(hist => {
                        const hItem = document.createElement("div");
                        hItem.className = "history-item";
                        
                        const dateFormatted = new Date(hist.date).toLocaleString("es-AR", {
                            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                        });

                        hItem.innerHTML = `
                            <div class="history-meta">
                                <span>${dateFormatted} hs</span>
                            </div>
                            <div class="history-content">${hist.text}</div>
                        `;
                        historyList.appendChild(hItem);
                    });
                }
            }
        } else {
            document.getElementById("modal-client-title").textContent = "Nuevo Lead";
            document.getElementById("client-id").value = "";
            document.getElementById("client-stage").value = "contacto";
            historyBox.style.display = "none";
        }

        clientModal.style.display = "flex";
        setTimeout(() => clientModal.classList.add("active"), 10);
        lucide.createIcons();
    }

    function closeClientModal() {
        clientModal.classList.remove("active");
        setTimeout(() => clientModal.style.display = "none", 300);
    }

    function handleClientSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("client-id").value;
        const name = document.getElementById("client-name").value;
        const phone = document.getElementById("client-phone").value;
        const email = document.getElementById("client-email").value;
        const brandInterest = document.getElementById("client-brand").value;
        const modelInterest = document.getElementById("client-model").value;
        const origin = document.getElementById("client-origin").value;
        const stage = document.getElementById("client-stage").value;
        const birthday = document.getElementById("client-birthday").value;

        const clientData = { name, phone, email, brandInterest, modelInterest, origin, stage, birthday };

        if (id) {
            const existing = db.getClientById(id);
            db.updateClient({ id, history: existing.history, ...clientData });
        } else {
            // Validar si ya existe un cliente con el mismo nombre para evitar duplicaciones
            const allClients = db.getClients();
            const duplicate = allClients.find(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());
            if (duplicate) {
                alert(`¡Alerta Brezza Aurea! Ya existe un cliente registrado con el nombre "${name}". Para evitar duplicados, buscalo en la lista o en el Pipeline.`);
                return;
            }

            const historyInit = [{
                date: new Date().toISOString(),
                text: `Lead ingresado al sistema. Canal: ${origin}.`
            }];
            if (birthday) {
                historyInit.push({
                    date: new Date().toISOString(),
                    text: `Fecha de cumpleaños registrada: ${birthday}. ¡Listo para beneficios!`
                });
            }
            db.addClient({ ...clientData, history: historyInit });
            addAssistantSystemMessage(`¡Nuevo lead ingresado crack! <strong>${name}</strong> ya está en la etapa de Contacto por un ${brandInterest} ${modelInterest}.`);
        }

        closeClientModal();
        renderAll();
    }

    function addQuickClientNote() {
        const clientId = document.getElementById("client-id").value;
        const noteInput = document.getElementById("new-interaction-note");
        const noteText = noteInput.value.trim();

        if (!clientId || !noteText) return;

        const client = db.getClientById(clientId);
        if (client) {
            client.history.push({
                date: new Date().toISOString(),
                text: noteText
            });
            db.updateClient(client);
            noteInput.value = "";
            openClientModal(clientId);
            renderAll();
        }
    }

    // --- Abrir/Cerrar Ventas ---
    function openOperationModal(opId = null, defaultClientId = "") {
        const form = document.getElementById("form-operation");
        form.reset();

        populateClientSelect("op-client-select", defaultClientId);
        
        // Cargar todos los autos disponibles
        const selectVeh = document.getElementById("op-vehicle-select");
        selectVeh.innerHTML = `<option value="" disabled selected>Seleccionar vehículo de stock...</option>`;
        const stock = db.getStock().filter(v => v.status === "Disponible" || v.status === "Reservado");
        stock.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.textContent = `[${v.brand}] ${v.model} ${v.version} - VIN: ${v.vin.slice(-6)} (${v.status})`;
            selectVeh.appendChild(opt);
        });

        if (opId) {
            document.getElementById("modal-op-title").textContent = "Editar Venta";
            const op = db.getOperationById(opId);
            if (op) {
                document.getElementById("op-id").value = op.id;
                populateClientSelect("op-client-select", op.clientId);
                document.getElementById("op-vehicle-select").value = op.vehiculoId;
                document.getElementById("op-payment").value = op.paymentMethod;
                document.getElementById("op-doc").value = op.docStatus;
            }
        } else {
            document.getElementById("modal-op-title").textContent = "Registrar Nueva Venta (Cierre)";
            document.getElementById("op-id").value = "";
            document.getElementById("op-doc").value = "En Gestoría";
        }

        opModal.style.display = "flex";
        setTimeout(() => opModal.classList.add("active"), 10);
        lucide.createIcons();
    }

    function closeOpModal() {
        opModal.classList.remove("active");
        setTimeout(() => opModal.style.display = "none", 300);
    }

    function handleOpSubmit(e) {
        e.preventDefault();
        const id = document.getElementById("op-id").value;
        const clientId = document.getElementById("op-client-select").value;
        const vehiculoId = document.getElementById("op-vehicle-select").value;
        const paymentMethod = document.getElementById("op-payment").value;
        const docStatus = document.getElementById("op-doc").value;

        if (!clientId || !vehiculoId) {
            alert("Por favor completá los campos requeridos, crack.");
            return;
        }

        const opData = { clientId, vehiculoId, paymentMethod, docStatus };

        if (id) {
            db.updateOperation({ id, ...opData });
        } else {
            db.addOperation(opData);
            
            // Cambiar estado del vehículo de stock a Reservado
            const vehicle = db.getVehicleById(vehiculoId);
            if (vehicle) {
                vehicle.status = "Reservado";
                db.updateVehicle(vehicle);
            }

            // Cambiar etapa del cliente a "cierre" (Boleto)
            const client = db.getClientById(clientId);
            if (client) {
                client.stage = "cierre";
                client.history.push({
                    date: new Date().toISOString(),
                    text: `Venta registrada oficialmente: Pago ${paymentMethod}. Auto VIN asignado: ${vehicle ? vehicle.vin : '-'}.`
                });
                db.updateClient(client);
            }

            addAssistantSystemMessage(`¡Excelente cierre! 🚗🔑 Registré la venta al cliente <strong>${client ? client.name : 'comprador'}</strong>. ¡Ahora a gestionar los papeles rápido!`);
        }

        closeOpModal();
        renderAll();
    }

    // ============================================================================
    // BUSCADOR GLOBAL Y FECHA
    // ============================================================================
    function setupGlobalSearch() {
        globalSearch.addEventListener("input", () => {
            renderAll();
        });
    }

    function updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const [y, m, d] = state.currentDate.split("-");
        const dateObj = new Date(y, m - 1, d);
        currentDateText.textContent = dateObj.toLocaleDateString('es-AR', options);
    }

    // ============================================================================
    // ASISTENTE DE VENTAS (WIDGET DE PRIORIDADES Y CHAT NLP)
    // ============================================================================
    function renderAssistantPriorities(clients, appointments) {
        const priorityContainer = document.getElementById("assistant-priority-todo");
        priorityContainer.innerHTML = "";

        const priorities = [];
        const todayPending = appointments.filter(a => a.date === state.currentDate && a.status === "Pendiente");
        
        todayPending.forEach(appt => {
            const client = db.getClientById(appt.clientId);
            if (client) {
                priorities.push({
                    text: `<strong>Cita a las ${appt.time} hs</strong>: ${appt.type} con ${client.name} (${appt.brand} ${appt.model}).`,
                    action: () => openAppointmentModal(appt.id)
                });
            }
        });

        // Clientes en contacto inicial sin llamadas hoy
        const contactStage = clients.filter(c => c.stage === "contacto");
        contactStage.forEach(client => {
            priorities.push({
                text: `<strong>Llamar a ${client.name}</strong>: Lead Web pendiente por ${client.brandInterest} ${client.modelInterest}.`,
                action: () => openClientModal(client.id)
            });
        });

        const top3 = priorities.slice(0, 3);

        if (top3.length === 0) {
            priorityContainer.innerHTML = `<li>¡Todo al día! No hay tareas prioritarias pendientes agendadas para hoy. ¡A seguir sumando leads! 🚗</li>`;
        } else {
            top3.forEach(p => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${p.text}</span>
                    <span class="todo-action">Gestionar</span>
                `;
                li.querySelector(".todo-action").addEventListener("click", p.action);
                priorityContainer.appendChild(li);
            });
        }
    }

    function setupAssistantChat() {
        const btnSend = document.getElementById("btn-send-chat");
        const inputText = document.getElementById("assistant-input-text");
        const btnBriefing = document.getElementById("btn-trigger-briefing");

        btnSend.addEventListener("click", () => handleUserChatMessage());
        inputText.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleUserChatMessage();
        });

        btnBriefing.addEventListener("click", () => {
            inputText.value = "/hoy";
            handleUserChatMessage();
        });
    }

    async function handleUserChatMessage() {
        const input = document.getElementById("assistant-input-text");
        const messageText = input.value.trim();
        if (!messageText) return;

        addChatMessage(messageText, "user");
        input.value = "";

        try {
            // Detectar si estamos en un archivo local o en la nube para usar la URL adecuada
            const apiBaseUrl = window.location.protocol === "file:" ? "http://localhost:8000" : "";
            const response = await fetch(`${apiBaseUrl}/api/asistente/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: messageText })
            });

            if (response.ok) {
                const data = await response.json();
                addChatMessage(data.reply, "assistant");

                // Sincronizar la UI con la base de datos de Supabase si el agente realizó cambios
                if (typeof db !== "undefined" && typeof db.syncWithSupabase === "function") {
                    await db.syncWithSupabase();
                }
                renderAll();
            } else {
                throw new Error("El backend respondió con un error.");
            }
        } catch (err) {
            console.warn("Backend de FastAPI no disponible. Usando fallback NLP local. Detalle:", err);
            // Fallback al motor NLP local original en app.js
            setTimeout(() => {
                let reply;
                if (messageText === "/hoy") {
                    reply = procesarBriefingMatutino();
                } else {
                    reply = getNLPResponse(messageText);
                }
                addChatMessage(reply, "assistant");
            }, 600);
        }
    }

    function addChatMessage(text, sender) {
        const chatContainer = document.getElementById("chat-messages-container");
        const bubble = document.createElement("div");
        
        // Estilos especiales si es una alerta del sistema
        if (text.startsWith("[Alerta") || text.includes("¡Ojo!")) {
            bubble.className = `chat-bubble system-alert`;
        } else if (text.startsWith("[Festejo") || text.includes("¡Excelente") || text.includes("Éxito")) {
            bubble.className = `chat-bubble system-success`;
        } else {
            bubble.className = `chat-bubble ${sender}`;
        }
        
        bubble.innerHTML = text;
        chatContainer.appendChild(bubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function addAssistantSystemMessage(text) {
        setTimeout(() => {
            addChatMessage(text, "assistant");
        }, 800);
    }

    // --- PARSER DE LENGUAJE NATURAL (NLP / SIMULADOR DE FUNCTION CALLING) ---
    function getNLPResponse(userMsg) {
        const msg = userMsg.toLowerCase().trim();

        // 1. Comando de Briefing Matutino
        if (msg === "/hoy" || msg.includes("resumen de hoy") || msg.includes("briefing") || msg.includes("agenda de hoy")) {
            return procesarBriefingMatutino();
        }

        // 2. Reprogramar Evento por Chat
        // Frase tipo: "pasa la cita de Mariana a las 15" o "pospone la entrega de las 14 a mañana a las 17"
        if (msg.includes("reprogram") || msg.includes("pasa la") || msg.includes("pospone") || msg.includes("muda")) {
            return procesarReprogramacionNLP(msg);
        }

        // 3. Cancelar Evento por Chat
        // Frase tipo: "cancela el turno de Mariana" o "cancela la cita de las 14"
        if (msg.includes("cancel")) {
            return procesarCancelacionNLP(msg);
        }

        // 4. Consulta de Stock
        // Frase tipo: "¿qué stock hay de Cronos?" o "mostrame el stock"
        if (msg.includes("stock") || msg.includes("vehiculo") || msg.includes("unidades")) {
            return procesarConsultaStockNLP(msg);
        }

        // 5. Agendar Cita
        // Frase tipo: "agenda una entrega para Carlos mañana a las 18"
        if (msg.includes("agenda") || msg.includes("turno nuevo") || msg.includes("crear cita")) {
            return procesarAgendadoNLP(msg);
        }

        // 6. Clásica duda / Descuento Nico
        if (msg.includes("descuento") || msg.includes("duda") || msg.includes("precio") || msg.includes("promo")) {
            return `¡Mirá crack, te hago una atención de la casa! Si el cliente duda en cerrar, ofrécele esto: <strong>"Si me lo señas hoy te queda con un 10% de descuento en gastos de gestoría"</strong>. ¡Aprovechalo, mandale el link para reservar la unidad de Brezza Aurea antes de que se venda! 🚗🔑`;
        }

        // Respuestas generales
        const replies = [
            `¡Dale crack! ¿Cómo venís con las ventas? Si necesitás que reprogramemos alguna entrega o que revise qué stock nos queda de Fiat y Peugeot, decime y lo hago al toque. 🚗🚙`,
            `¡Joya total! Recordá que podés tirar el comando <strong>/hoy</strong> para ver qué tenemos agendado en el día y enterarte de cualquier alerta de patentamiento. ¡Vamos por esos cierres! 📈`,
            `¡Qué hacés crack! ¿Querés que agendemos un Test Drive para algún lead dudoso? Escribime algo tipo *"agenda test drive de 208 para Mariana a las 16"* y yo me encargo de armarlo. 😉🚗`
        ];

        return replies[Math.floor(Math.random() * replies.length)];
    }

    // --- DETALLE DE LÓGICAS NLP ---

    function procesarBriefingMatutino() {
        const hoy = state.currentDate;
        const apptsHoy = db.getAppointments().filter(a => a.date === hoy && a.status !== "Cancelada");
        
        const [y, m, d] = hoy.split("-");
        const dateObj = new Date(y, m - 1, d);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const formattedDate = dateObj.toLocaleDateString('es-AR', options);
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        let reply = `<strong>Briefing Matutino - ${capitalizedDate}</strong> 🚗🌅<br><br>`;
        
        if (apptsHoy.length === 0) {
            reply += `¡Hola crack! Hoy no tenemos actividades registradas en la agenda. ¡Buen momento para llamar leads desde el CRM! 🚗`;
            return reply;
        }

        reply += `Hoy tenemos <strong>${apptsHoy.length} actividades agendadas</strong>:<br>`;

        // Listar agenda
        apptsHoy.forEach(appt => {
            const client = db.getClientById(appt.clientId);
            const statusEmoji = appt.status === "Realizada" ? "✅" : "⏳";
            reply += `• <strong>${appt.time} hs</strong>: ${appt.type} - ${client ? client.name : 'Cliente'} (${appt.brand} ${appt.model}) [${statusEmoji} ${appt.status}]<br>`;
        });

        // 1. Alerta de Cumpleaños
        const clients = db.getClients();
        const cumpleanosHoy = clients.filter(c => {
            if (!c.birthday) return false;
            const [y, m, d] = c.birthday.split("-");
            return m === "06" && d === "21"; // Coincide con nuestro dummy date
        });

        if (cumpleanosHoy.length > 0) {
            reply += `<br>🎉 <strong>¡Cumpleaños Brezza Aurea de Hoy!</strong>:<br>`;
            cumpleanosHoy.forEach(c => {
                reply += `• <strong>${c.name}</strong> cumple años hoy. ¡Llamalo para saludarlo y ofrécele una atención del 10% en gastos de gestoría para cerrar ese trato! 🚗🎁<br>`;
            });
        }

        // 2. Alertas de Negocio (Documentación y PDI para Entregas de hoy)
        const entregasHoy = apptsHoy.filter(a => a.type === "Entrega de 0km");
        if (entregasHoy.length > 0) {
            reply += `<br>⚠️ <strong>Alertas de Entregas 0km</strong>:<br>`;
            entregasHoy.forEach(ent => {
                const client = db.getClientById(ent.clientId);
                const check = validarDocumentacionPDI(ent.clientId, ent.vehiculoId);
                if (!check.ok) {
                    reply += `• <strong>OJO CON ${client ? client.name : 'Cliente'} (${ent.time} hs)</strong>: El auto no se puede entregar. Razón: <strong>${check.reason}</strong> ❌<br>`;
                } else if (check.warning) {
                    reply += `• <strong>ADVERTENCIA ${client ? client.name : 'Cliente'} (${ent.time} hs)</strong>: ${check.reason} ⚠️<br>`;
                } else {
                    reply += `• ${client ? client.name : 'Cliente'} (${ent.time} hs) está listo para entrega. ¡Papeles y PDI al día! ✅<br>`;
                }
            });
        }

        return reply;
    }

    function procesarReprogramacionNLP(msg) {
        // Encontrar cliente por nombre
        const clients = db.getClients();
        let targetClient = null;
        for (let c of clients) {
            if (msg.includes(c.name.toLowerCase().split(" ")[0])) { // Busca primer nombre
                targetClient = c;
                break;
            }
        }

        if (!targetClient) {
            // Si no encuentra por nombre, busca por la hora original
            const appts = db.getAppointments().filter(a => a.date === state.currentDate);
            const matchHora = msg.match(/\b(0[89]|1[0-9]|20):[0-5][0-9]\b/) || msg.match(/\b([89]|1[0-9]|20)\b/);
            if (matchHora) {
                const horaBuscada = matchHora[0].includes(":") ? matchHora[0] : `${matchHora[0].padStart(2, '0')}:00`;
                const appt = appts.find(a => a.time === horaBuscada);
                if (appt) targetClient = db.getClientById(appt.clientId);
            }
        }

        if (!targetClient) {
            return `¡Ojo crack! No entendí bien de quién es la cita que querés reprogramar. Escribí el primer nombre del cliente o la hora exacta.`;
        }

        // Buscar cita activa del cliente para hoy
        const appts = db.getAppointments().filter(a => a.clientId === targetClient.id && a.date === state.currentDate && a.status !== "Cancelada");
        if (appts.length === 0) {
            return `¡Che! No encontré ninguna cita activa agendada hoy para <strong>${targetClient.name}</strong>.`;
        }

        const apptToReprog = appts[0];

        // Extraer nueva hora
        // regex para buscar formatos de hora: 15:00, 15, 15hs, 18.30
        const timeMatch = msg.match(/\b(0[89]|1[0-9]|20):[0-5][0-9]\b/) || msg.match(/\b([89]|1[0-9]|20)\b/);
        let nuevaHora = "17:00";
        if (timeMatch) {
            nuevaHora = timeMatch[0].includes(":") ? timeMatch[0] : `${timeMatch[0].padStart(2, '0')}:00`;
        }

        // Extraer nueva fecha (mañana, hoy o una fecha fija)
        let nuevaFecha = state.currentDate;
        if (msg.includes("mañana")) {
            const dateObj = new Date(state.currentDate + "T00:00:00");
            dateObj.setDate(dateObj.getDate() + 1);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            nuevaFecha = `${yyyy}-${mm}-${dd}`;
        }

        try {
            reprogramar_evento(apptToReprog.id, nuevaFecha, nuevaHora);
            renderAll();
            return `¡Listo crack! Reprogramé la cita de <strong>${targetClient.name}</strong> (${apptToReprog.type}) para el <strong>${nuevaFecha} a las ${nuevaHora} hs</strong>. ¡La agenda ya se actualizó en pantalla! 🚗🔥`;
        } catch (err) {
            return `¡Ojo crack! Intenté reprogramar la cita de <strong>${targetClient.name}</strong>, pero el sistema saltó con un límite de negocio: <strong>${err.message}</strong>`;
        }
    }

    function procesarCancelacionNLP(msg) {
        const clients = db.getClients();
        let targetClient = null;
        for (let c of clients) {
            if (msg.includes(c.name.toLowerCase().split(" ")[0])) {
                targetClient = c;
                break;
            }
        }

        if (!targetClient) {
            return `¡Che! Decime bien el nombre del cliente para saber cuál turno dar de baja.`;
        }

        const appts = db.getAppointments().filter(a => a.clientId === targetClient.id && a.date === state.currentDate && a.status !== "Cancelada");
        if (appts.length === 0) {
            return `No vi ningún turno activo agendado hoy para <strong>${targetClient.name}</strong>.`;
        }

        const apptToCancel = appts[0];
        actualizar_estado_evento(apptToCancel.id, "Cancelada");
        renderAll();

        return `¡Joya! Cita de <strong>${targetClient.name}</strong> cancelada correctamente. Bloque de las ${apptToCancel.time} hs liberado. ⚽🗑️`;
    }

    function procesarConsultaStockNLP(msg) {
        const stock = db.getStock();
        let brandFilter = msg.includes("fiat") ? "Fiat" : (msg.includes("peugeot") ? "Peugeot" : null);
        
        let items = stock;
        if (brandFilter) {
            items = stock.filter(v => v.brand === brandFilter);
        }

        let response = `¡Obvio crack! Acá tenés el <strong>stock de Brezza Aurea</strong> consultado:<br><br>`;
        
        items.forEach(v => {
            const statusColor = v.status === "Disponible" ? "green" : (v.status === "Reservado" ? "orange" : "gray");
            response += `• <strong>${v.brand} ${v.model}</strong> (${v.color}) - Ubicación: ${v.location} - Estado: <span style="color:${statusColor}">${v.status}</span> (VIN: ...${v.vin.slice(-6)})<br>`;
        });

        return response;
    }

    function procesarAgendadoNLP(msg) {
        // Encontrar cliente
        const clients = db.getClients();
        let targetClient = null;
        for (let c of clients) {
            if (msg.includes(c.name.toLowerCase().split(" ")[0])) {
                targetClient = c;
                break;
            }
        }

        if (!targetClient) {
            return `¡Ojo! Para agendar, primero necesito que me digas el nombre del cliente para buscarlo en la base.`;
        }

        // Tipo de cita
        let tipo = "Cita en Salón";
        if (msg.includes("test") || msg.includes("manejo") || msg.includes("probar")) {
            tipo = "Test Drive";
        } else if (msg.includes("entrega") || msg.includes("entregar")) {
            tipo = "Entrega de 0km";
        } else if (msg.includes("seguimiento") || msg.includes("llamar")) {
            tipo = "Llamado de Seguimiento";
        }

        // Hora
        const timeMatch = msg.match(/\b(0[89]|1[0-9]|20):[0-5][0-9]\b/) || msg.match(/\b([89]|1[0-9]|20)\b/);
        let hora = "11:00";
        if (timeMatch) {
            hora = timeMatch[0].includes(":") ? timeMatch[0] : `${timeMatch[0].padStart(2, '0')}:00`;
        }

        // Fecha
        let fecha = state.currentDate;
        if (msg.includes("mañana")) {
            const dateObj = new Date(state.currentDate + "T00:00:00");
            dateObj.setDate(dateObj.getDate() + 1);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            fecha = `${yyyy}-${mm}-${dd}`;
        }

        // Coche demostrador si es Test Drive o entrega
        let vehiculoId = "";
        if (tipo === "Test Drive") {
            const vehTest = db.getStock().find(v => v.brand === targetClient.brandInterest && v.model === targetClient.modelInterest);
            if (vehTest) vehiculoId = vehTest.id;
        } else if (tipo === "Entrega de 0km") {
            const op = db.getOperationByClientId(targetClient.id);
            if (op) vehiculoId = op.vehiculoId;
        }

        try {
            crear_evento(tipo, fecha, hora, targetClient.id, vehiculoId, "Agendado por asistente virtual (chat)");
            renderAll();
            return `¡Cita agendada con éxito! Agendé la cita tipo <strong>${tipo}</strong> para <strong>${targetClient.name}</strong> el día <strong>${fecha} a las ${hora} hs</strong>. ¡Ya figura en el calendario! 🚗📅`;
        } catch (err) {
            return `¡Atención! No pude agendar la cita. Razón comercial: <strong>${err.message}</strong> ❌`;
        }
    }

    // ============================================================================
    // SISTEMA DE SEGURIDAD: LOGIN Y REGISTRO
    // ============================================================================
    function setupLogin() {
        const loginScreen = document.getElementById("login-screen");
        const loginCard = document.getElementById("login-card");
        const loginFace = document.getElementById("login-face-panel");
        const registerFace = document.getElementById("register-face-panel");
        
        const btnSwitchToRegister = document.getElementById("btn-switch-to-register");
        const btnSwitchToLogin = document.getElementById("btn-switch-to-login");
        
        const formLogin = document.getElementById("form-login-auth");
        const formRegister = document.getElementById("form-register-auth");
        
        const loginErrorMsg = document.getElementById("login-error-msg");
        const registerErrorMsg = document.getElementById("register-error-msg");
        
        const btnLogout = document.getElementById("btn-logout");
        
        // Verificar si ya hay una sesión guardada
        const savedSession = localStorage.getItem("fp_session_user");
        if (savedSession) {
            const user = JSON.parse(savedSession);
            loginScreen.style.display = "none";
            setupSessionInfo(user);
            renderAll();
        } else {
            loginScreen.style.display = "flex";
        }
        
        // Alternar paneles
        btnSwitchToRegister.addEventListener("click", (e) => {
            e.preventDefault();
            loginCard.classList.add("flipped");
            setTimeout(() => {
                loginFace.classList.remove("active");
                registerFace.classList.add("active");
            }, 300);
            registerErrorMsg.textContent = "";
            formRegister.reset();
        });
        
        btnSwitchToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            loginCard.classList.remove("flipped");
            setTimeout(() => {
                registerFace.classList.remove("active");
                loginFace.classList.add("active");
            }, 300);
            loginErrorMsg.textContent = "";
            formLogin.reset();
        });
        
        // Procesar Login
        formLogin.addEventListener("submit", (e) => {
            try {
                e.preventDefault();
                const username = document.getElementById("login-username").value.trim();
                const password = document.getElementById("login-password").value;
                
                const user = db.validateUser(username, password);
                if (user) {
                    localStorage.setItem("fp_session_user", JSON.stringify(user));
                    loginErrorMsg.textContent = "";
                    setupSessionInfo(user);
                    
                    // Animación de entrada
                    loginScreen.classList.add("fade-out");
                    setTimeout(() => {
                        loginScreen.style.display = "none";
                        renderAll();
                    }, 800);
                } else {
                    loginErrorMsg.textContent = "Credenciales incorrectas. Intentá de nuevo.";
                }
            } catch (err) {
                alert("Error al intentar iniciar sesión:\n" + err.message + "\n" + err.stack);
                console.error(err);
            }
        });
        
        // Procesar Registro
        formRegister.addEventListener("submit", (e) => {
            try {
                e.preventDefault();
                const name = document.getElementById("register-name").value.trim();
                const username = document.getElementById("register-username").value.trim();
                const password = document.getElementById("register-password").value;
                
                db.addUser({ username, password, name });
                registerErrorMsg.style.color = "#4ade80";
                registerErrorMsg.textContent = "¡Usuario creado con éxito! Redirigiendo...";
                
                setTimeout(() => {
                    btnSwitchToLogin.click();
                    registerErrorMsg.style.color = "var(--color-danger)";
                }, 1500);
            } catch (err) {
                registerErrorMsg.style.color = "var(--color-danger)";
                registerErrorMsg.textContent = err.message;
                alert("Error al intentar registrar usuario:\n" + err.message + "\n" + err.stack);
                console.error(err);
            }
        });
        
        // Procesar Logout
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("fp_session_user");
            loginScreen.classList.remove("fade-out");
            loginScreen.style.display = "flex";
            btnSwitchToLogin.click();
        });
    }
    
    function setupSessionInfo(user) {
        const avatar = document.getElementById("sidebar-user-avatar");
        const name = document.getElementById("sidebar-user-name");
        
        if (avatar && name) {
            avatar.textContent = user.username.charAt(0).toUpperCase();
            name.textContent = user.username;
        }
        
        addAssistantSystemMessage(`¡Hola <strong>${user.username}</strong>! Qué bueno tenerte acá. Iniciaste sesión en <strong>Brezza Aurea</strong>. Estoy listo para ayudarte con la gestión de tus leads de Fiat y Peugeot hoy. 🚗📈`);
    }

        init();
    } catch (err) {
        alert("Error crítico en la aplicación Brezza Aurea:\n" + err.message + "\n" + err.stack);
        console.error(err);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startBrezzaAurea);
} else {
    startBrezzaAurea();
}
