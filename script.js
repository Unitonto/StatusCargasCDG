document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const importExcelInput = document.createElement('input');
    importExcelInput.type = 'file';
    importExcelInput.style.display = 'none';
    document.body.appendChild(importExcelInput);

    let sampleData = JSON.parse(localStorage.getItem('spreadsheetData')) || [];

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
                                        <option value="-" ${row.status === '-' ? 'selected' : ''}>-</option>
                                        <option value="Cargado" ${row.status === 'Cargado' ? 'selected' : ''}>Cargado</option>
                                        <option value="Cargando" ${row.status === 'Cargando' ? 'selected' : ''}>Cargando</option>
                                        <option value="En espera" ${row.status === 'En espera' ? 'selected' : ''}>En espera</option>
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

        document.getElementById('addRowBtn').addEventListener('click', addRow);
        document.getElementById('saveDataBtn').addEventListener('click', saveData);
        document.getElementById('clearDataBtn').addEventListener('click', clearData);
        document.getElementById('importExcelBtn').addEventListener('click', importExcel);
        document.getElementById('backToStartBtn').addEventListener('click', showStartPage);
    }

    function showStartPage() {
        contentDiv.innerHTML = `
            <h2>Status de Cargas</h2>
            <div class="buttons">
                <button id="loadDataBtn">Cargar Datos</button>
                <button id="viewDetailsBtn">Visualizar Detalles</button>
            </div>
        `;

        document.getElementById('loadDataBtn').addEventListener('click', showSpreadsheet);
        document.getElementById('viewDetailsBtn').addEventListener('click', showDetails);
    }

    function showDetails() {
        const uniqueMovils = [...new Set(sampleData.map(row => row.movil))];

        contentDiv.innerHTML = `
            <h2>Visualizador de Estado y Detalles</h2>
            <label for="movilSelect">Selecciona un móvil:</label>
            <select id="movilSelect">
                <option value="">--Selecciona un móvil--</option>
                ${uniqueMovils.map(movil => `<option value="${movil}">${movil}</option>`).join('')}
            </select>
            <div id="movilDetails"></div>
            <button id="backToStartBtn">Volver al Inicio</button>
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
                        horaCarga = 'Horario estimado de carga lista';
                    }
                }

                const currentDetails = {
                    status: details.status === '-' ? 'No especificado' : details.status,
                    tipoRuta: details.detalles === '-' ? 'No especificado' : details.detalles,
                    horaCarga: horaCarga,
                    ubicacionActual: details.enRuta === '-' ? 'No especificado' : details.enRuta
                };

                document.getElementById('movilDetails').innerHTML = `
                    ${horaCarga.startsWith('Horario estimado') ? '' : `<p>Hora de Carga: ${currentDetails.horaCarga}</p>`}
                    <p>Estado Actual: ${currentDetails.status}</p>
                    <p>Tipo de Ruta: ${currentDetails.tipoRuta}</p>
                    ${horaCarga.startsWith('Horario estimado') ? `<p>${horaCarga}</p>` : ''}
                    <p>Ubicación Actual: ${currentDetails.ubicacionActual}</p>
                `;
            } else {
                document.getElementById('movilDetails').innerHTML = '<p>No se encontraron detalles para el móvil seleccionado.</p>';
            }
        });

        document.getElementById('backToStartBtn').addEventListener('click', showStartPage);
    }

    function addRow() {
        const tableBody = document.getElementById('spreadsheetBody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" placeholder="DD/MM/AAAA" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td><input type="text" /></td>
            <td>
                <select>
                    <option value="-">-</option>
                    <option value="Cargado">Cargado</option>
                    <option value="Cargando">Cargando</option>
                    <option value="En espera">En espera</option>
                </select>
            </td>
            <td><input type="text" /></td>
            <td><input type="text" placeholder="HH:MM" /></td>
            <td>
                <select>
                    <option value="-">-</option>
                    <option value="En Ruta">En Ruta</option>
                    <option value="En Playa">En Playa</option>
                </select>
            </td>
            <td><input type="text" /></td>
        `;
        tableBody.appendChild(newRow);
    }

    function saveData() {
        const rows = document.querySelectorAll('#spreadsheetBody tr');
        sampleData = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                fecha: cells[0].querySelector('input').value || '',
                orden: cells[1].querySelector('input').value || '',
                movil: cells[2].querySelector('input').value || '',
                reparto: cells[3].querySelector('input').value || '',
                status: cells[4].querySelector('select').value || '-',
                detalles: cells[5].querySelector('input').value || '',
                horaCarga: cells[6].querySelector('input').value || '-',
                enRuta: cells[7].querySelector('select').value || '-',
                observacion: cells[8].querySelector('input').value || ''
            };
        }).filter(row => row.fecha || row.orden || row.movil || row.reparto || row.detalles || row.horaCarga || row.enRuta || row.observacion); // Filtrar filas vacías

        localStorage.setItem('spreadsheetData', JSON.stringify(sampleData));
        alert('Datos guardados con éxito.');
    }

    function clearData() {
        sampleData = [];
        localStorage.removeItem('spreadsheetData');
        showSpreadsheet();
    }

    function importExcel() {
        importExcelInput.click();
    }

    importExcelInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                sampleData = jsonData.slice(1).map(row => {
                    if (row.every(cell => cell === null || cell === undefined || cell === '')) {
                        return null;
                    }
                    return {
                        fecha: row[0] || '', // Fecha (A2)
                        orden: row[4] || '', // Orden (E2)
                        movil: row[5] || '', // Movil (F2)
                        reparto: row[1] || '', // Reparto (B2)
                        status: '-', // Status permanece igual
                        detalles: row[7] || '', // Detalles (H2)
                        horaCarga: '-', // Hora de carga permanece igual
                        enRuta: '-', // En Ruta/En Playa permanece igual
                        observacion: '' // Observacion permanece igual
                    };
                }).filter(row => row !== null); // Filtrar filas en blanco

                localStorage.setItem('spreadsheetData', JSON.stringify(sampleData));
                showSpreadsheet();
            } catch (error) {
                console.error('Error al procesar el archivo Excel:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    showStartPage();
});
