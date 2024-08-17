// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyApWMN7o2BvEsV6RtAopE6_RBwgW77gI5k",
    authDomain: "pruebastatus-ea9b8.firebaseapp.com",
    databaseURL: "https://pruebastatus-ea9b8-default-rtdb.firebaseio.com",
    projectId: "pruebastatus-ea9b8",
    storageBucket: "pruebastatus-ea9b8.appspot.com",
    messagingSenderId: "302383298282",
    appId: "1:302383298282:web:30fffe5d69615c45ee0993",
    measurementId: "G-8VV37ZJZ9R"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const importExcelInput = document.createElement('input');
    importExcelInput.type = 'file';
    importExcelInput.style.display = 'none';
    document.body.appendChild(importExcelInput);

    let sampleData = [];

    function fetchDataFromFirebase() {
        const dbRef = database.ref('spreadsheetData');
        dbRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                sampleData = snapshot.val();
                showSpreadsheet();
            } else {
                sampleData = [];
                showSpreadsheet();
            }
        });
    }

    function saveDataToFirebase() {
        getUpdatedData(); // Actualiza sampleData antes de guardar
        database.ref('spreadsheetData').set(sampleData)
            .then(() => {
                alert('Datos guardados correctamente en Firebase.');
            })
            .catch((error) => {
                console.error('Error guardando datos en Firebase:', error);
            });
    }
    

    function showSpreadsheet() {
        contentDiv.innerHTML = `
            <h2>Importación de Datos</h2>
            <div class="buttons">
                <button id="importExcelBtn">Importar Excel</button>
                <button id="backToStartBtn">Volver al Inicio</button>
                <button id="saveDataBtn">Guardar Datos</button>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Orden</th>
                            <th>Movil</th>
                            <th>Reparto</th>
                            <th>Status</th>
                            <th>Detalles</th>
                            <th>Hora de Carga</th>
                            <th>En Ruta/En Playa</th>
                            <th>Observación</th>
                        </tr>
                    </thead>
                    <tbody id="spreadsheetBody">
                        ${sampleData.map(row => `
                            <tr>
                                <td><input type="text" value="${row.fecha || ''}" placeholder="DD/MM/AAAA" /></td>
                                <td><input type="text" value="${row.orden || ''}" /></td>
                                <td><input type="text" value="${row.movil || ''}" /></td>
                                <td><input type="text" value="${row.reparto || ''}" /></td>
                                <td>
                                    <select>
                                        <option value="Pendiente" ${row.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                                        <option value="Cargado" ${row.status === 'Cargado' ? 'selected' : ''}>Cargado</option>
                                    </select>
                                </td>
                                <td><input type="text" value="${row.detalles || ''}" /></td>
                                <td><input type="text" value="${row.horaCarga || '-'}" placeholder="HH:MM" /></td>
                                <td>
                                    <select>
                                        <option value="-" ${row.enRuta === '-' ? 'selected' : ''}>-</option>
                                        <option value="En Ruta" ${row.enRuta === 'En Ruta' ? 'selected' : ''}>En Ruta</option>
                                        <option value="En Playa" ${row.enRuta === 'En Playa' ? 'selected' : ''}>En Playa</option>
                                    </select>
                                </td>
                                <td><input type="text" value="${row.observacion || ''}" /></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="buttons">
                <button id="addRowBtn">Añadir Fila</button>
                <button id="clearDataBtn">Limpiar Datos</button>
            </div>
        `;

        document.getElementById('saveDataBtn').addEventListener('click', saveDataToFirebase);
        document.getElementById('addRowBtn').addEventListener('click', addRow);
        document.getElementById('clearDataBtn').addEventListener('click', clearData);
        document.getElementById('importExcelBtn').addEventListener('click', importExcel);
        document.getElementById('backToStartBtn').addEventListener('click', showStartPage);
    }
    function getUpdatedData() {
        const rows = Array.from(document.querySelectorAll('#spreadsheetBody tr'));
        sampleData = rows.map(row => {
            const cells = row.querySelectorAll('td input, td select');
            return {
                fecha: cells[0].value,
                orden: cells[1].value,
                movil: cells[2].value,
                reparto: cells[3].value,
                status: cells[4].value,
                detalles: cells[5].value,
                horaCarga: cells[6].value,
                enRuta: cells[7].value,
                observacion: cells[8].value
            };
        });
    }    

    function showStartPage() {
        contentDiv.innerHTML = `
            <h2>Status de Cargas</h2>
            <div class="buttons">
                <button id="loadDataBtn">Cargar Datos</button>
                <button id="viewFleetVisibilityBtn">Visibilidad Flota</button>
                <button id="generalVisibilityBtn">Visibilidad General</button>
            </div>
        `;

        document.getElementById('loadDataBtn').addEventListener('click', fetchDataFromFirebase);
        document.getElementById('viewFleetVisibilityBtn').addEventListener('click', showDetails);
        document.getElementById('generalVisibilityBtn').addEventListener('click', showGeneralVisibility);
    }

    function showDetails() {
        const uniqueMovils = [...new Set(sampleData.map(row => row.movil))];

        contentDiv.innerHTML = `
            <h2>Visibilidad Flota</h2>
            <div class="buttons">
                <button id="backToStartBtn">Volver al Inicio</button>
            </div>
            <label for="movilSelect">Selecciona un móvil:</label>
            <select id="movilSelect">
                <option value="">--Selecciona un móvil--</option>
                ${uniqueMovils.map(movil => `<option value="${movil}">${movil}</option>`).join('')}
            </select>
            <div id="movilDetails"></div>
        `;

        document.getElementById('movilSelect').addEventListener('change', (event) => {
            const selectedMovil = event.target.value;
            const details = sampleData.find(row => row.movil === selectedMovil);

            if (details) {
                let horaCarga = details.horaCarga || 'No especificado';
                if (details.horaCarga === '-' || details.horaCarga === 'No especificado') {
                    const rowIndex = sampleData.indexOf(details);
                    const previousRows = sampleData.slice(0, rowIndex);
                    const lastLoadingRow = previousRows.slice().reverse().find(row => row.horaCarga && row.horaCarga !== '-' && row.horaCarga !== 'No especificado');

                    if (lastLoadingRow) {
                        const lastLoadingIndex = previousRows.indexOf(lastLoadingRow);
                        const minutesToAdd = 13 * (rowIndex - lastLoadingIndex);
                        const lastLoadingTime = new Date(`1970-01-01T${lastLoadingRow.horaCarga}:00`);
                        const estimatedReadyTime = new Date(lastLoadingTime.getTime() + minutesToAdd * 60000);
                        horaCarga = `Horario estimado de carga lista: ${estimatedReadyTime.toTimeString().slice(0, 5)}`;
                    } else {
                        horaCarga = '-';
                    }
                }

                document.getElementById('movilDetails').innerHTML = `
                    <p><strong>Movil:</strong> ${details.movil || 'No especificado'}</p>
                    <p><strong>Status:</strong> ${details.status || 'No especificado'}</p>
                    <p><strong>Detalles:</strong> ${details.detalles || 'No especificado'}</p>
                    <p><strong>Hora de Carga:</strong> ${horaCarga || '-'}</p>
                    <p><strong>En Ruta/En Playa:</strong> ${details.enRuta || 'No especificado'}</p>
                    <p><strong>Observación:</strong> ${details.observacion || '-'}</p>
                `;
            }
        });

        document.getElementById('backToStartBtn').addEventListener('click', showStartPage);
    }

    function showGeneralVisibility() {
        const uniqueMovils = [...new Set(sampleData.map(row => row.movil))];

        contentDiv.innerHTML = `
            <h2>Visibilidad General</h2>
            <div class="buttons">
                <button id="backToStartBtn">Volver al Inicio</button>
            </div>
            <label for="filterOL">Filtrar por OL:</label>
            <select id="filterOL">
                <option value="">Todos</option>
                <option value="J">Jauser</option>
                <option value="E">Eminsa</option>
                <option value="L">Lemi</option>
            </select>
            <label for="filterStatus">Filtrar por estado:</label>
            <select id="filterStatus">
                <option value="">Todos</option>
                <option value="Cargado">Cargado</option>
                <option value="Pendiente">Pendiente</option>
            </select>
            <button id="clearFiltersBtn">Limpiar filtros</button>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Movil</th>
                            <th>Status</th>
                            <th>Detalles</th>
                            <th>Hora de Carga</th>
                            <th>En Ruta/En Playa</th>
                            <th>Observación</th>
                            <th>Hora estimada de carga</th>
                        </tr>
                    </thead>
                    <tbody id="generalVisibilityBody">
                        ${sampleData.map(row => `
                            <tr>
                                <td>${row.movil || ''}</td>
                                <td>${row.status || ''}</td>
                                <td>${row.detalles || ''}</td>
                                <td>${row.horaCarga || ''}</td>
                                <td>${row.enRuta || ''}</td>
                                <td>${row.observacion || ''}</td>
                                <td>${row.horaCarga === '-' ? calculateEstimatedTime(row) : row.horaCarga || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('filterOL').addEventListener('change', filterData);
        document.getElementById('filterStatus').addEventListener('change', filterData);
        document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
        document.getElementById('backToStartBtn').addEventListener('click', showStartPage);
    }

    function importExcel() {
        importExcelInput.click();
        importExcelInput.addEventListener('change', handleFile, { once: true });
    }

    function handleFile(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = 'Orden de Prioridades';
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                json.shift(); // Remove header row
                sampleData = json.map(row => ({
                    fecha: row[0] || '',
                    orden: row[4] || '',
                    movil: row[5] || '',
                    reparto: row[1] || '',
                    detalles: row[7] || '',
                    status: 'Pendiente', // Default status
                    horaCarga: '-',
                    enRuta: '-',
                    observacion: ''
                }));
                showSpreadsheet();
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Por favor, selecciona un archivo Excel válido.');
        }
    }

    function addRow() {
        sampleData.push({
            fecha: '',
            orden: '',
            movil: '',
            reparto: '',
            detalles: '',
            status: 'Pendiente',
            horaCarga: '',
            enRuta: '-',
            observacion: ''
        });
        showSpreadsheet();
    }

    function clearData() {
        if (confirm('¿Estás seguro de que deseas limpiar todos los datos?')) {
            sampleData = [];
            showSpreadsheet();
        }
    }

    function filterData() {
        const olFilter = document.getElementById('filterOL').value;
        const statusFilter = document.getElementById('filterStatus').value;

        const filteredData = sampleData.filter(row => {
            let isValid = true;

            if (olFilter && olFilter !== 'G') {
                isValid = row.movil.startsWith(olFilter);
            } else if (olFilter === 'G') {
                isValid = !['J', 'E', 'L'].includes(row.movil.charAt(0));
            }

            if (statusFilter) {
                isValid = isValid && row.status === statusFilter;
            }

            return isValid;
        });

        const tbody = document.getElementById('generalVisibilityBody');
        tbody.innerHTML = filteredData.map(row => `
            <tr>
                <td>${row.movil || ''}</td>
                <td>${row.status || ''}</td>
                <td>${row.detalles || ''}</td>
                <td>${row.horaCarga || ''}</td>
                <td>${row.enRuta || ''}</td>
                <td>${row.observacion || ''}</td>
                <td>${row.horaCarga === '-' ? calculateEstimatedTime(row) : row.horaCarga || ''}</td>
            </tr>
        `).join('');
    }

    function clearFilters() {
        document.getElementById('filterOL').value = '';
        document.getElementById('filterStatus').value = '';
        filterData();
    }

    function calculateEstimatedTime(row) {
        const rowIndex = sampleData.indexOf(row);
        const previousRows = sampleData.slice(0, rowIndex);
        const lastLoadingRow = previousRows.slice().reverse().find(row => row.horaCarga && row.horaCarga !== '-' && row.horaCarga !== 'No especificado');

        if (lastLoadingRow) {
            const lastLoadingIndex = previousRows.indexOf(lastLoadingRow);
            const minutesToAdd = 13 * (rowIndex - lastLoadingIndex);
            const lastLoadingTime = new Date(`1970-01-01T${lastLoadingRow.horaCarga}:00`);
            const estimatedReadyTime = new Date(lastLoadingTime.getTime() + minutesToAdd * 60000);
            return `${estimatedReadyTime.toTimeString().slice(0, 5)}`;
        } else {
            return '';
        }
    }

    showStartPage();
});
