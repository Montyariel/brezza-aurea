// ============================================================================
// MOCKDATA.JS - ARQUITECTURA DE DATOS STELLANTIS (FIAT & PEUGEOT)
// ============================================================================

// Modelos Oficiales de vehículos de Stellantis
const VEHICLE_MODELS = {
    Fiat: ["Cronos", "Pulse", "Fastback", "Toro", "Mobi", "Fiorino"],
    Peugeot: ["208", "2008", "3008", "5008", "Partner", "Expert"]
};

// 0. USUARIOS (Credenciales y Perfiles)
const INITIAL_USERS = [
    {
        id: "usr-admin",
        username: "admin",
        password: "admin",
        name: "Ariel"
    }
];

// 1. STOCK DE VEHÍCULOS (Fiat y Peugeot)
const INITIAL_STOCK = [
    {
        id: "veh-1",
        brand: "Fiat",
        model: "Cronos",
        version: "Precision 1.3 CVT",
        vin: "8APZZZ9S1HP102345",
        engine: "Firefly 1.3",
        color: "Gris Plata",
        origin: "Nacional",
        location: "Salón",
        status: "Reservado" // Reservado por Carlos Battistella para su compra
    },
    {
        id: "veh-2",
        brand: "Peugeot",
        model: "208",
        version: "Style 1.6 MT",
        vin: "8ADZZZ2S2KP209876",
        engine: "VTi 1.6",
        color: "Azul Quasar",
        origin: "Nacional",
        location: "Playón",
        status: "Reservado" // Reservado para Mariana Lopilato
    },
    {
        id: "veh-3",
        brand: "Fiat",
        model: "Fastback",
        version: "Limited Edition 1.3T",
        vin: "9BDZZZ3S3LP301234",
        engine: "T270 1.3T",
        color: "Negro Vulcano",
        origin: "Importado",
        location: "Depósito",
        status: "Disponible"
    },
    {
        id: "veh-4",
        brand: "Peugeot",
        model: "3008",
        version: "GT Pack Hybrid4",
        vin: "VF3M4EZZZH849201",
        engine: "1.6T Hybrid",
        color: "Blanco Nacarado",
        origin: "Importado",
        location: "Salón",
        status: "Reservado" // Reservado por Tatiana Fernández
    },
    {
        id: "veh-5",
        brand: "Fiat",
        model: "Toro",
        version: "Freedom 2.0 TD AT9 4x4",
        vin: "9BDZZZ4S4MP405678",
        engine: "Multijet 2.0 TD",
        color: "Rojo Montecarlo",
        origin: "Importado",
        location: "Playón",
        status: "Reservado" // Reservado y Entregado por Rodrigo De Paul
    },
    {
        id: "veh-6",
        brand: "Peugeot",
        model: "2008",
        version: "Allure 1.0T CVT",
        vin: "8ADZZZ5S5NP506789",
        engine: "T200 1.0T",
        color: "Gris Artense",
        origin: "Nacional",
        location: "Depósito",
        status: "Disponible"
    },
    {
        id: "veh-7",
        brand: "Fiat",
        model: "Cronos",
        version: "Drive 1.3 MT",
        vin: "8APZZZ9S2HP104921",
        engine: "Firefly 1.3",
        color: "Blanco Alaska",
        origin: "Nacional",
        location: "Playón",
        status: "Disponible"
    },
    {
        id: "veh-8",
        brand: "Peugeot",
        model: "208",
        version: "Feline 1.6 AT",
        vin: "8ADZZZ2S3KP209555",
        engine: "VTi 1.6",
        color: "Gris Grafito",
        origin: "Nacional",
        location: "Salón",
        status: "Disponible" // Auto de Test Drive
    }
];

// 2. CLIENTES / LEADS
const INITIAL_CLIENTS = [
    {
        id: "cli-1",
        name: "Carlos Battistella",
        phone: "11-3456-7890",
        email: "carlos.batti@gmail.com",
        brandInterest: "Fiat",
        modelInterest: "Cronos",
        origin: "Web",
        stage: "presupuesto",
        birthday: "1988-04-12",
        history: [
            { date: "2026-06-15T10:00:00Z", text: "Lead ingresado por Web. Interesado en Cronos Precision." },
            { date: "2026-06-18T16:30:00Z", text: "Asistió a entrevista presencial y se le pasó presupuesto del plan 70/30." }
        ]
    },
    {
        id: "cli-2",
        name: "Mariana Lopilato",
        phone: "11-9876-5432",
        email: "marian.lopi@hotmail.com",
        brandInterest: "Peugeot",
        modelInterest: "208",
        origin: "Instagram",
        stage: "entrevista",
        birthday: "1994-08-25",
        history: [
            { date: "2026-06-19T11:00:00Z", text: "Consulta por Instagram por Peugeot 208 Style. Quiere hacer Test Drive." }
        ]
    },
    {
        id: "cli-3",
        name: "Juan Ignacio Pérez",
        phone: "11-2233-4455",
        email: "juan.perez@live.com.ar",
        brandInterest: "Fiat",
        modelInterest: "Fastback",
        origin: "Web",
        stage: "contacto",
        birthday: "1985-11-03",
        history: [
            { date: "2026-06-20T17:00:00Z", text: "Dejó datos por el Fastback Limited Edition. Pendiente primer contacto telefónico." }
        ]
    },
    {
        id: "cli-4",
        name: "Tatiana Fernández",
        phone: "11-6677-8899",
        email: "tati.fernandez@outlook.com",
        brandInterest: "Peugeot",
        modelInterest: "3008",
        origin: "Salón",
        stage: "cierre",
        birthday: "1990-06-21", // Hoy es su cumpleaños en la simulación!
        history: [
            { date: "2026-06-12T09:00:00Z", text: "Vino al salón interesada en SUV premium." },
            { date: "2026-06-14T15:00:00Z", text: "Realizó Test Drive en Peugeot 3008 Hybrid. Quedó encantada." },
            { date: "2026-06-19T12:00:00Z", text: "Aceptó propuesta comercial. Pendiente de firma de boleto y entrega física." }
        ]
    },
    {
        id: "cli-5",
        name: "Rodrigo De Paul",
        phone: "11-5555-1234",
        email: "motorcito@gmail.com",
        brandInterest: "Fiat",
        modelInterest: "Toro",
        origin: "Salón",
        stage: "entrega",
        birthday: "1994-05-24",
        history: [
            { date: "2026-05-10T14:00:00Z", text: "Ingresó por salón Lanús." },
            { date: "2026-05-15T11:00:00Z", text: "Firma de boleto Fiat Toro Freedom." },
            { date: "2026-06-10T10:00:00Z", text: "Unidad patentada y asignada." },
            { date: "2026-06-20T16:00:00Z", text: "Asignada fecha de entrega física." }
        ]
    },
    {
        id: "cli-6",
        name: "Florencia Peña",
        phone: "11-4444-9999",
        email: "flor.pena@gmail.com",
        brandInterest: "Peugeot",
        modelInterest: "2008",
        origin: "Instagram",
        stage: "presupuesto",
        birthday: "1982-10-07",
        history: [
            { date: "2026-06-16T15:30:00Z", text: "Consulta por redes sobre la nueva Peugeot 2008." },
            { date: "2026-06-18T18:00:00Z", text: "Cotizada con financiación prendaria Stellantis. Pendiente de confirmación." }
        ]
    }
];

// 3. OPERACIONES (VENTAS)
const INITIAL_OPERATIONS = [
    {
        id: "ope-1",
        clientId: "cli-1",
        vehiculoId: "veh-1", // Fiat Cronos Precision
        paymentMethod: "Financiado Stellantis",
        docStatus: "En Gestoría" // No listo para entrega
    },
    {
        id: "ope-2",
        clientId: "cli-4",
        vehiculoId: "veh-4", // Peugeot 3008 GT
        paymentMethod: "Contado",
        docStatus: "Patentado" // Listo de papeles, pero... ¿PDI Listo? (Se configurará en el código)
    },
    {
        id: "ope-3",
        clientId: "cli-5",
        vehiculoId: "veh-5", // Fiat Toro Freedom
        paymentMethod: "Toma de Usado",
        docStatus: "PDI Listo" // Totalmente listo, ya fue entregado
    }
];

// 4. EVENTOS DE AGENDA
const INITIAL_APPOINTMENTS = [
    {
        id: "appt-1",
        clientId: "cli-2",
        vehiculoId: "veh-8", // Peugeot 208 de test drive
        brand: "Peugeot",
        model: "208",
        date: "2026-06-21",
        time: "10:30",
        type: "Test Drive",
        status: "Realizada",
        notes: "Test drive del 208 en Belgrano. Le gustó mucho el i-Cockpit. Pasando presupuesto hoy."
    },
    {
        id: "appt-2",
        clientId: "cli-1",
        vehiculoId: "veh-1",
        brand: "Fiat",
        model: "Cronos",
        date: "2026-06-21",
        time: "12:00",
        type: "Presupuesto / Negociación",
        status: "Pendiente",
        notes: "Llamar para cerrar plan de financiación y acordar firma de boleto."
    },
    {
        id: "appt-3",
        clientId: "cli-4",
        vehiculoId: "veh-4", // Peugeot 3008
        brand: "Peugeot",
        model: "3008",
        date: "2026-06-21",
        time: "14:00",
        type: "Entrega de 0km",
        status: "Pendiente",
        notes: "Entrega programada para las 14:00 hs. Ojo: revisar si ya tiene PDI Listo y documentación Patentada."
    },
    {
        id: "appt-4",
        clientId: "cli-5",
        vehiculoId: "veh-5",
        brand: "Fiat",
        model: "Toro",
        date: "2026-06-21",
        time: "18:00",
        type: "Entrega de 0km",
        status: "Pendiente",
        notes: "Entrega física de la Toro Freedom 0km. Champagne de regalo listo."
    },
    {
        id: "appt-5",
        clientId: "cli-6",
        brand: "Peugeot",
        model: "2008",
        date: "2026-06-22",
        time: "11:00",
        type: "Cita en Salón",
        status: "Pendiente",
        notes: "Reunión presencial para tasar su Peugeot 208 usado y presupuestar la nueva 2008."
    }
];

// Gestión de Persistencia en LocalStorage
// ============================================================================
// INICIALIZACIÓN CLIENTE SUPABASE SDK
// ============================================================================
let supabaseClient = null;
if (typeof window !== "undefined" && window.supabase && typeof SUPABASE_CONFIG !== "undefined" && SUPABASE_CONFIG.URL !== "TU_SUPABASE_URL" && SUPABASE_CONFIG.ANON_KEY !== "TU_SUPABASE_ANON_KEY") {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
        console.log("Supabase Client initialized successfully!");
    } catch (e) {
        console.error("Failed to initialize Supabase Client: ", e);
    }
}

class Database {
    constructor() {
        this.init();
        this.deduplicateClients();
        this.syncWithSupabase();
    }

    init() {
        // Asegurar la inicialización correcta de usuarios
        let users = null;
        try {
            users = JSON.parse(localStorage.getItem("fp_users"));
        } catch (e) {}
        
        if (!users || !Array.isArray(users) || users.length === 0) {
            users = INITIAL_USERS;
            localStorage.setItem("fp_users", JSON.stringify(users));
        } else if (!users.some(u => u.username === "admin")) {
            users.push(INITIAL_USERS[0]);
            localStorage.setItem("fp_users", JSON.stringify(users));
        }

        if (!localStorage.getItem("fp_clients")) {
            localStorage.setItem("fp_clients", JSON.stringify(INITIAL_CLIENTS));
        }
        if (!localStorage.getItem("fp_stock")) {
            localStorage.setItem("fp_stock", JSON.stringify(INITIAL_STOCK));
        }
        if (!localStorage.getItem("fp_operations")) {
            localStorage.setItem("fp_operations", JSON.stringify(INITIAL_OPERATIONS));
        }
        if (!localStorage.getItem("fp_appointments")) {
            localStorage.setItem("fp_appointments", JSON.stringify(INITIAL_APPOINTMENTS));
        }
    }

    async syncWithSupabase() {
        if (!supabaseClient) return;
        console.log("Sincronizando base de datos local con Supabase...");
        try {
            // 1. Sincronizar Usuarios
            const { data: dbUsers, error: uErr } = await supabaseClient.from('fp_users').select('*');
            if (dbUsers && dbUsers.length > 0) {
                this.saveUsers(dbUsers);
            } else if (!uErr) {
                const localUsers = this.getUsers();
                await supabaseClient.from('fp_users').insert(localUsers);
            }

            // 2. Sincronizar Stock (Vehículos)
            const { data: dbStock, error: sErr } = await supabaseClient.from('fp_stock').select('*');
            if (dbStock && dbStock.length > 0) {
                this.saveStock(dbStock);
            } else if (!sErr) {
                await supabaseClient.from('fp_stock').insert(INITIAL_STOCK);
            }

            // 3. Sincronizar Clientes (Leads)
            const { data: dbClients, error: cErr } = await supabaseClient.from('fp_clients').select('*');
            if (dbClients && dbClients.length > 0) {
                const formattedClients = dbClients.map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    email: c.email,
                    brandInterest: c.brand_interest || c.brandInterest || "",
                    modelInterest: c.model_interest || c.modelInterest || "",
                    origin: c.origin || "Web",
                    stage: c.stage || "contacto",
                    birthday: c.birthday || null,
                    history: c.history || []
                }));
                this.saveClients(formattedClients);
            } else if (!cErr) {
                const dbCompatibleClients = INITIAL_CLIENTS.map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    email: c.email || null,
                    brand_interest: c.brandInterest,
                    model_interest: c.modelInterest,
                    stage: c.stage,
                    history: c.history || []
                }));
                await supabaseClient.from('fp_clients').insert(dbCompatibleClients);
            }

            // 4. Sincronizar Operaciones
            const { data: dbOps, error: oErr } = await supabaseClient.from('fp_operations').select('*');
            if (dbOps && dbOps.length > 0) {
                const formattedOps = dbOps.map(op => ({
                    id: op.id,
                    clientId: op.client_id,
                    vehiculoId: op.vehiculo_id,
                    price: op.price,
                    paymentMethod: op.payment_method,
                    docStatus: op.doc_status,
                    deliveryStatus: op.delivery_status
                }));
                this.saveOperations(formattedOps);
            } else if (!oErr) {
                const dbCompatibleOps = INITIAL_OPERATIONS.map(op => ({
                    id: op.id,
                    client_id: op.clientId,
                    vehiculo_id: op.vehiculoId,
                    price: op.price,
                    payment_method: op.paymentMethod,
                    doc_status: op.docStatus,
                    delivery_status: op.deliveryStatus
                }));
                await supabaseClient.from('fp_operations').insert(dbCompatibleOps);
            }

            // 5. Sincronizar Citas (Agenda)
            const { data: dbAppts, error: aErr } = await supabaseClient.from('fp_appointments').select('*');
            if (dbAppts && dbAppts.length > 0) {
                const formattedAppts = dbAppts.map(appt => ({
                    id: appt.id,
                    clientId: appt.client_id,
                    brand: appt.brand,
                    model: appt.model,
                    date: appt.date,
                    time: appt.time,
                    type: appt.type,
                    status: appt.status,
                    notes: appt.notes,
                    vehiculoId: appt.vehiculo_id
                }));
                this.saveAppointments(formattedAppts);
            } else if (!aErr) {
                const dbCompatibleAppts = INITIAL_APPOINTMENTS.map(appt => ({
                    id: appt.id,
                    client_id: appt.clientId,
                    brand: appt.brand,
                    model: appt.model,
                    date: appt.date,
                    time: appt.time,
                    type: appt.type,
                    status: appt.status,
                    notes: appt.notes,
                    vehiculo_id: appt.vehiculoId || null
                }));
                await supabaseClient.from('fp_appointments').insert(dbCompatibleAppts);
            }

            this.deduplicateClients();
            console.log("¡Base de datos local sincronizada exitosamente con Supabase!");
            
            // Renderizar la UI si las funciones del frontend están cargadas
            if (typeof renderAll === "function") {
                renderAll();
            }
        } catch (err) {
            console.error("Fallo la sincronización con Supabase (corriendo en modo local):", err);
        }
    }

    deduplicateClients() {
        const clients = this.getClients();
        if (clients.length === 0) return;

        const uniqueClients = [];
        const seenNames = new Set();
        let hasDuplicates = false;

        clients.forEach(c => {
            const normalizedName = c.name.toLowerCase().trim();
            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueClients.push(c);
            } else {
                hasDuplicates = true;
                const original = uniqueClients.find(oc => oc.name.toLowerCase().trim() === normalizedName);
                if (original) {
                    // Migrar citas del duplicado al original
                    let appts = this.getAppointments();
                    let apptsUpdated = false;
                    appts = appts.map(a => {
                        if (a.clientId === c.id) {
                            a.clientId = original.id;
                            apptsUpdated = true;
                        }
                        return a;
                    });
                    if (apptsUpdated) {
                        this.saveAppointments(appts);
                    }

                    // Migrar operaciones del duplicado al original
                    let ops = this.getOperations();
                    let opsUpdated = false;
                    ops = ops.map(o => {
                        if (o.clientId === c.id) {
                            o.clientId = original.id;
                            opsUpdated = true;
                        }
                        return o;
                    });
                    if (opsUpdated) {
                        this.saveOperations(ops);
                    }
                    
                    // Fusionar historial
                    if (c.history && c.history.length > 0) {
                        original.history = [...original.history, ...c.history];
                    }
                }
            }
        });

        if (hasDuplicates) {
            console.log("Se detectaron y fusionaron clientes duplicados en la base de datos de Brezza Aurea.");
            this.saveClients(uniqueClients);
        }
    }

    // --- CLIENTES ---
    getClients() {
        return JSON.parse(localStorage.getItem("fp_clients")) || [];
    }

    saveClients(clients) {
        localStorage.setItem("fp_clients", JSON.stringify(clients));
    }

    addClient(client) {
        const clients = this.getClients();
        const newClient = {
            id: `cli-${Date.now()}`,
            history: [],
            ...client
        };
        clients.push(newClient);
        this.saveClients(clients);

        if (supabaseClient) {
            const dbCompatibleClient = {
                id: newClient.id,
                name: newClient.name,
                phone: newClient.phone,
                email: newClient.email || null,
                brand_interest: newClient.brandInterest,
                model_interest: newClient.modelInterest,
                stage: newClient.stage || "contacto",
                history: newClient.history || []
            };
            supabaseClient.from('fp_clients').insert([dbCompatibleClient]).then(({ error }) => {
                if (error) console.error("Error al guardar cliente en Supabase:", error);
            });
        }

        return newClient;
    }

    updateClient(updatedClient) {
        let clients = this.getClients();
        clients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
        this.saveClients(clients);

        if (supabaseClient) {
            const dbCompatibleClient = {
                id: updatedClient.id,
                name: updatedClient.name,
                phone: updatedClient.phone,
                email: updatedClient.email || null,
                brand_interest: updatedClient.brandInterest,
                model_interest: updatedClient.modelInterest,
                stage: updatedClient.stage,
                history: updatedClient.history || []
            };
            supabaseClient.from('fp_clients').update(dbCompatibleClient).eq('id', updatedClient.id).then(({ error }) => {
                if (error) console.error("Error al actualizar cliente en Supabase:", error);
            });
        }

        return updatedClient;
    }

    getClientById(id) {
        return this.getClients().find(c => c.id === id);
    }

    // --- VEHÍCULOS (STOCK) ---
    getStock() {
        return JSON.parse(localStorage.getItem("fp_stock")) || [];
    }

    saveStock(stock) {
        localStorage.setItem("fp_stock", JSON.stringify(stock));
    }

    updateVehicle(updatedVehicle) {
        let stock = this.getStock();
        stock = stock.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
        this.saveStock(stock);

        if (supabaseClient) {
            supabaseClient.from('fp_stock').update(updatedVehicle).eq('id', updatedVehicle.id).then(({ error }) => {
                if (error) console.error("Error al actualizar stock en Supabase:", error);
            });
        }

        return updatedVehicle;
    }

    getVehicleById(id) {
        return this.getStock().find(v => v.id === id);
    }

    // --- OPERACIONES (VENTAS) ---
    getOperations() {
        return JSON.parse(localStorage.getItem("fp_operations")) || [];
    }

    saveOperations(ops) {
        localStorage.setItem("fp_operations", JSON.stringify(ops));
    }

    addOperation(op) {
        const ops = this.getOperations();
        const newOp = {
            id: `ope-${Date.now()}`,
            ...op
        };
        ops.push(newOp);
        this.saveOperations(ops);

        if (supabaseClient) {
            const dbCompatibleOp = {
                id: newOp.id,
                client_id: newOp.clientId,
                vehiculo_id: newOp.vehiculoId,
                price: newOp.price,
                payment_method: newOp.paymentMethod,
                doc_status: newOp.docStatus,
                delivery_status: newOp.deliveryStatus
            };
            supabaseClient.from('fp_operations').insert([dbCompatibleOp]).then(({ error }) => {
                if (error) console.error("Error al guardar operación en Supabase:", error);
            });
        }

        return newOp;
    }

    updateOperation(updatedOp) {
        let ops = this.getOperations();
        ops = ops.map(o => o.id === updatedOp.id ? updatedOp : o);
        this.saveOperations(ops);

        if (supabaseClient) {
            const dbCompatibleOp = {
                id: updatedOp.id,
                client_id: updatedOp.clientId,
                vehiculo_id: updatedOp.vehiculoId,
                price: updatedOp.price,
                payment_method: updatedOp.paymentMethod,
                doc_status: updatedOp.docStatus,
                delivery_status: updatedOp.deliveryStatus
            };
            supabaseClient.from('fp_operations').update(dbCompatibleOp).eq('id', updatedOp.id).then(({ error }) => {
                if (error) console.error("Error al actualizar operación en Supabase:", error);
            });
        }

        return updatedOp;
    }

    getOperationByClientId(clientId) {
        return this.getOperations().find(o => o.clientId === clientId);
    }

    getOperationById(id) {
        return this.getOperations().find(o => o.id === id);
    }

    // --- AGENDA ---
    getAppointments() {
        return JSON.parse(localStorage.getItem("fp_appointments")) || [];
    }

    saveAppointments(appointments) {
        localStorage.setItem("fp_appointments", JSON.stringify(appointments));
    }

    addAppointment(appt) {
        const appointments = this.getAppointments();
        const newAppt = {
            id: `appt-${Date.now()}`,
            ...appt
        };
        appointments.push(newAppt);
        this.saveAppointments(appointments);

        if (supabaseClient) {
            const dbCompatibleAppt = {
                id: newAppt.id,
                client_id: newAppt.clientId,
                brand: newAppt.brand,
                model: newAppt.model,
                date: newAppt.date,
                time: newAppt.time,
                type: newAppt.type,
                status: newAppt.status,
                notes: newAppt.notes,
                vehiculo_id: newAppt.vehiculoId || null
            };
            supabaseClient.from('fp_appointments').insert([dbCompatibleAppt]).then(({ error }) => {
                if (error) console.error("Error al guardar cita en Supabase:", error);
            });
        }

        return newAppt;
    }

    updateAppointment(updatedAppt) {
        let appointments = this.getAppointments();
        appointments = appointments.map(a => a.id === updatedAppt.id ? updatedAppt : a);
        this.saveAppointments(appointments);

        if (supabaseClient) {
            const dbCompatibleAppt = {
                id: updatedAppt.id,
                client_id: updatedAppt.clientId,
                brand: updatedAppt.brand,
                model: updatedAppt.model,
                date: updatedAppt.date,
                time: updatedAppt.time,
                type: updatedAppt.type,
                status: updatedAppt.status,
                notes: updatedAppt.notes,
                vehiculo_id: updatedAppt.vehiculoId || null
            };
            supabaseClient.from('fp_appointments').update(dbCompatibleAppt).eq('id', updatedAppt.id).then(({ error }) => {
                if (error) console.error("Error al actualizar cita en Supabase:", error);
            });
        }

        return updatedAppt;
    }

    getAppointmentById(id) {
        return this.getAppointments().find(a => a.id === id);
    }

    deleteAppointment(id) {
        let appointments = this.getAppointments();
        appointments = appointments.filter(a => a.id !== id);
        this.saveAppointments(appointments);

        if (supabaseClient) {
            supabaseClient.from('fp_appointments').delete().eq('id', id).then(({ error }) => {
                if (error) console.error("Error al borrar cita en Supabase:", error);
            });
        }
    }

    deleteClient(id) {
        let clients = this.getClients();
        clients = clients.filter(c => c.id !== id);
        this.saveClients(clients);

        // Limpiar citas asociadas para evitar registros huérfanos
        let appointments = this.getAppointments();
        appointments = appointments.filter(a => a.clientId !== id);
        this.saveAppointments(appointments);

        // Limpiar operaciones asociadas y liberar vehículos
        let ops = this.getOperations();
        const clientOps = ops.filter(o => o.clientId === id);
        clientOps.forEach(op => {
            const vehicle = this.getVehicleById(op.vehiculoId);
            if (vehicle) {
                vehicle.status = "Disponible";
                this.updateVehicle(vehicle);
            }
        });
        ops = ops.filter(o => o.clientId !== id);
        this.saveOperations(ops);

        if (supabaseClient) {
            supabaseClient.from('fp_clients').delete().eq('id', id).then(({ error }) => {
                if (error) console.error("Error al borrar cliente en Supabase:", error);
            });
        }
    }

    deleteOperation(id) {
        let ops = this.getOperations();
        const op = ops.find(o => o.id === id);
        if (op) {
            const vehicle = this.getVehicleById(op.vehiculoId);
            if (vehicle) {
                vehicle.status = "Disponible";
                this.updateVehicle(vehicle);
            }
            ops = ops.filter(o => o.id !== id);
            this.saveOperations(ops);

            // Revertir etapa del cliente a Presupuesto
            const client = this.getClientById(op.clientId);
            if (client && client.stage === "cierre") {
                client.stage = "presupuesto";
                client.history.push({
                    date: new Date().toISOString(),
                    text: `Operación de venta eliminada. Vehículo liberado en stock. Etapa comercial revertida a Presupuesto.`
                });
                this.updateClient(client);
            }

            if (supabaseClient) {
                supabaseClient.from('fp_operations').delete().eq('id', id).then(({ error }) => {
                    if (error) console.error("Error al borrar operación en Supabase:", error);
                });
            }
        }
    }

    // --- USUARIOS ---
    getUsers() {
        return JSON.parse(localStorage.getItem("fp_users")) || [];
    }

    saveUsers(users) {
        localStorage.setItem("fp_users", JSON.stringify(users));
    }

    addUser(user) {
        const users = this.getUsers();
        if (users.find(u => u.username.toLowerCase() === user.username.toLowerCase())) {
            throw new Error("El nombre de usuario ya existe.");
        }
        const newUser = {
            id: `usr-${Date.now()}`,
            ...user
        };
        users.push(newUser);
        this.saveUsers(users);

        if (supabaseClient) {
            supabaseClient.from('fp_users').insert([newUser]).then(({ error }) => {
                if (error) console.error("Error al guardar usuario en Supabase:", error);
            });
        }

        return newUser;
    }

    validateUser(username, password) {
        const users = this.getUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    }
}

// Instanciar base Stellantis
const db = new Database();
